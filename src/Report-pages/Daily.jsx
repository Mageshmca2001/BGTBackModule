import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';

const DailyReports = () => {
useEffect(() => {
document.title = 'BGT - Daily Report';
}, []);

const [selectedDay, setSelectedDay] = useState('');
const [entries, setEntries] = useState('10');
const [search, setSearch] = useState('');
const [originalData, setOriginalData] = useState([]);
const [filteredData, setFilteredData] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [dateTime, setDateTime] = useState(new Date());
const [loading, setLoading] = useState(false);
const isExportDisabled = filteredData.length === 0;

const chartRef = useRef(null);
const chartInstanceRef = useRef(null);

useEffect(() => {
const interval = setInterval(() => setDateTime(new Date()), 1000);
return () => clearInterval(interval);
}, []);

const formattedDate = dateTime.toLocaleDateString("en-GB", {
day: "2-digit",
month: "2-digit",
year: "numeric",
});
const formattedTime = dateTime.toLocaleTimeString();

const totalTested = filteredData.reduce((acc, item) => acc + (parseInt(item.tested) || 0), 0);
const totalCompleted = filteredData.reduce((acc, item) => acc + (parseInt(item.completed) || 0), 0);
const totalReworked = filteredData.reduce((acc, item) => acc + (parseInt(item.reworked) || 0), 0);

const totalPages = Math.ceil(filteredData.length / itemsPerPage);

const handleSelectDayChange = (event) => setSelectedDay(event.target.value);

const handleEntriesChange = (event) => {
const value = event.target.value;
setEntries(value);
setItemsPerPage(value === 'All' ? filteredData.length : parseInt(value, 10));
setCurrentPage(1);
};

useEffect(() => {
if (entries === 'All') {
setItemsPerPage(filteredData.length);
}
}, [entries, filteredData]);

const handleSearchChange = (event) => {
const searchValue = event.target.value.toLowerCase();
setSearch(searchValue);

const filtered = originalData.filter((item) =>
item.hours.toLowerCase().includes(searchValue) ||
item.tested.toString().includes(searchValue) ||
item.completed.toString().includes(searchValue) ||
item.reworked.toString().includes(searchValue)
);

setFilteredData(filtered);
setCurrentPage(1);
};

const handleGenerateReport = async () => {
if (!selectedDay) {
alert('Please select Day to generate the report.');
return;
}

try {
setLoading(true);
const response = await axios.get("https://frontend-1-lunu.onrender.com/admin");
const fetchedData = response.data;

let filteredByDay;
if (selectedDay === "01") {
filteredByDay = fetchedData.filter((item) => item.hours.startsWith("08"));
} else if (selectedDay === "02") {
filteredByDay = fetchedData.filter((item) => item.hours.startsWith("09"));
} else if (selectedDay === "03") {
filteredByDay = fetchedData;
} else {
filteredByDay = [];
}

setOriginalData(filteredByDay);
setFilteredData(filteredByDay);
setCurrentPage(1);
} catch (error) {
console.error("Error fetching report data:", error);
} finally {
setLoading(false);
}
};

const handleExport = async () => {
setLoading(true);
try {
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('DailyReports');

const header = ['Hours', 'Tested', 'Completed', 'Reworked'];
const headerRow = worksheet.addRow(header);
headerRow.font = { bold: true };
headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

worksheet.columns = [
{ width: 18 },
{ width: 12 },
{ width: 12 },
{ width: 12 },
];

filteredData.forEach(item => {
const row = worksheet.addRow([
item.hours || '',
item.tested || 0,
item.completed || 0,
item.reworked || 0,
]);
row.alignment = { vertical: 'middle', horizontal: 'center' };
});

const summaryStart = filteredData.length + 3;
worksheet.getCell(`A${summaryStart}`).value = 'Total Summary';
worksheet.getCell(`A${summaryStart}`).font = { bold: true, size: 12 };

const summaryRows = [
['Total Tested', totalTested],
['Total Completed', totalCompleted],
['Total Reworked', totalReworked]
];

summaryRows.forEach(([label, value]) => {
const row = worksheet.addRow([label, value]);
row.alignment = { vertical: 'middle', horizontal: 'center' };
});

const buffer = await workbook.xlsx.writeBuffer();
const blob = new Blob([buffer], { type: 'application/octet-stream' });
saveAs(blob, 'DailyReports.xlsx');
} catch (err) {
console.error('❌ Excel export error:', err);
} finally {
setLoading(false);
}
};

const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

const paginatedData = filteredData.slice(
(currentPage - 1) * itemsPerPage,
currentPage * itemsPerPage
);

useEffect(() => {
if (!chartRef.current || filteredData.length === 0) return;

const ctx = chartRef.current.getContext('2d');
if (chartInstanceRef.current) {
chartInstanceRef.current.destroy();
}

const labels = filteredData.map(item => item.hours);
const tested = filteredData.map(item => item.tested);
const completed = filteredData.map(item => item.completed);
const reworked = filteredData.map(item => item.reworked);

chartInstanceRef.current = new Chart(ctx, {
type: 'bar',
data: {
labels,
datasets: [
{
label: 'Meters Tested',
data: tested,
backgroundColor: '#60a5fa',
borderColor: '#3b82f6',
borderWidth: 1
},
{
label: 'Meters Completed',
data: completed,
backgroundColor: '#34d399',
borderColor: '#10b981',
borderWidth: 1
},
{
label: 'Meters Reworked',
data: reworked,
backgroundColor: '#fca5a5',
borderColor: '#f87171',
borderWidth: 1
}
]
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: { position: 'top' },
title: {
display: true,
text: 'Meter Testing Analysis by Hours',
color: '#334155',
font: { size: 18, weight: 'bold', family: 'Poppins' },
padding: { top: 10, bottom: 10 }
},
datalabels: { display: false }
},
scales: {
y: {
beginAtZero: true,
title: {
display: true,
text: 'Number of Meters',
color: '#4b5563'
}
},
x: {
title: {
display: true,
text: 'Hours',
color: '#4b5563'
},
stacked: false,
grid: { display: false }
}
}
}
});
}, [filteredData]);

return (
<div className="w-full overflow-x-hidden px-0 sm:px-0 pb-10">
<h1 className="text-3xl font-[poppins] text-primary">Daily Report</h1>

{/* Date & Time */}
<div className="flex flex-col sm:flex-row justify-end sm:space-x-4 mt-2 space-y-2 sm:space-y-0">
<p className="bg-primary text-white font-[poppins] w-full sm:w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-[poppins] w-full sm:w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Time: {formattedTime}
</p>
</div>

{/* Filter Section */}
<div className="bg-primary p-4 rounded shadow-md mt-4">
<div className="flex flex-col md:flex-row md:items-end gap-4">
<div className="w-full md:w-1/2">
<label htmlFor="selectDay" className="block text-base1 text-white font-[poppins]">
Select Day
</label>
<select
id="selectDay"
className="border border-white rounded p-2 w-full sm:w-64 mt-2"
value={selectedDay}
onChange={handleSelectDayChange}
>
<option value="" disabled>Select Day</option>
<option value="01">Present Day</option>
<option value="02">Previous Day</option>
<option value="03">Last 7 Days</option>
</select>
</div>

<div className="flex-grow text-right w-full md:w-auto">
<button
onClick={handleGenerateReport}
className="bg-green-600 text-white px-4 py-2 rounded mt-6 hover:bg-gray-400 w-full md:w-auto mr-1"
>
<i className="bx bx-cog mr-2"></i> Generate
</button>
<span title={isExportDisabled ? 'Generate report first' : ''}>
<button
onClick={handleExport}
disabled={isExportDisabled}
className={`px-4 py-2 rounded mt-6 w-full md:w-auto ${
isExportDisabled
? 'bg-gray-400 cursor-not-allowed'
: 'bg-green-600 hover:bg-gray-400 text-white'
}`}
>
<i className="bx bxs-file-export mr-2"></i> Export
</button>
</span>
</div>
</div>
</div>

{/* Report Table */}
<div className="bg-primary text-white font-[poppins] p-4 rounded-t mt-4">Daily Report</div>
<div className="bg-white p-4 rounded-b shadow-md">
{loading ? (
<div className="flex flex-col justify-center items-center py-16 animate-fadeIn">
<div className="relative">
<div className="w-16 h-16 rounded-full border-4 border-t-transparent border-b-transparent border-primary animate-spin"></div>
<div className="absolute inset-0 flex justify-center items-center">
<i className='bx bx-loader-alt text-4xl text-primary animate-pulse'></i>
</div>
</div>
<p className="mt-4 text-lg text-primary font-[poppins] animate-pulse">
Loading daily report...
</p>
<p className="text-sm text-gray-400 font-[poppins] mt-1">
Please wait while we fetch the data.
</p>
</div>
) : (
<>
{/* Entries & Search */}
<div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
<div className="flex items-center space-x-4 min-w-max">
<label htmlFor="entries" className="text-gray-700 whitespace-nowrap">Show</label>
<select
id="entries"
className="border border-gray-300 rounded p-2"
value={entries}
onChange={handleEntriesChange}
>
<option value="10">10</option>
<option value="25">25</option>
<option value="50">50</option>
<option value="All">All</option>
</select>
<span className="text-gray-700 whitespace-nowrap">entries</span>
</div>

<div className="flex items-center space-x-4 min-w-max">
<label htmlFor="search" className="text-gray-700 whitespace-nowrap">Search:</label>
<input
type="text"
id="search"
className="border border-gray-300 rounded p-2"
value={search}
onChange={handleSearchChange}
/>
</div>
</div>

{/* Table */}
<div className="overflow-x-auto w-full">
<table className="min-w-full bg-white table-auto">
<thead>
<tr>
<th className="border text-center text-base bg-primary text-white px-4 py-2">Hours</th>
<th className="border text-center text-base bg-primary text-white px-4 py-2">Tested</th>
<th className="border text-center text-base bg-primary text-white px-4 py-2">Completed</th>
<th className="border text-center text-base bg-primary text-white px-4 py-2">Reworked</th>
</tr>
</thead>
<tbody>
{paginatedData.length === 0 ? (
<tr>
<td colSpan="4" className="text-center py-4 text-gray-500">
No data available for the selected day or search.
</td>
</tr>
) : (
paginatedData.map((item, index) => (
<tr key={index}>
<td className="border text-center px-4 py-2">{item.hours}</td>
<td className="border text-center px-4 py-2">{item.tested}</td>
<td className="border text-center px-4 py-2">{item.completed}</td>
<td className="border text-center px-4 py-2">{item.reworked}</td>
</tr>
))
)}
</tbody>
</table>
</div>

{/* Pagination */}
<div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
<span className="text-sm text-gray-700">
Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
</span>
<div className="flex space-x-2 overflow-x-auto py-2 px-1 w-full md:w-auto">
<button
onClick={() => handlePageChange(currentPage - 1)}
disabled={currentPage === 1}
className="px-4 py-2 bg-white border rounded disabled:opacity-50 shrink-0"
>
Previous
</button>
{Array.from({ length: totalPages }, (_, index) => (
<button
key={index}
onClick={() => handlePageChange(index + 1)}
className={`px-4 py-2 border rounded shrink-0 ${
currentPage === index + 1 ? 'bg-primary text-white' : 'bg-white'
}`}
>
{index + 1}
</button>
))}
<button
onClick={() => handlePageChange(currentPage + 1)}
disabled={currentPage === totalPages}
className="px-4 py-2 bg-white border rounded disabled:opacity-50 shrink-0"
>
Next
</button>
</div>
</div>
</>
)}
</div>

{/* Chart & Summary */}
{filteredData.length > 0 && !loading && (
<div className="bg-white p-4 mt-6 border-t pt-6 rounded shadow-md w-full overflow-hidden">
<h2 className="text-2xl font-bold font-[poppins] mb-1 text-primary">Daily Report Chart</h2>
<p className="text-gray-500 text-sm font-[poppins] mb-2">Daily analysis of meter testing</p>
<div className="relative w-full h-[300px] sm:h-[500px]">
<canvas ref={chartRef} className="absolute top-0 left-0 w-full h-full" />
</div>

<div className="mt-4">
<h2 className="text-xl font-bold text-primary font-[poppins] mb-2">Total Summary</h2>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-[poppins]">
<div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
<p className="text-lg">Total Tested</p>
<p className="text-2xl font-bold mt-0">{totalTested}</p>
</div>
<div className="bg-green-100 text-green-800 p-4 rounded shadow">
<p className="text-lg">Total Completed</p>
<p className="text-2xl font-bold mt-0">{totalCompleted}</p>
</div>
<div className="bg-red-100 text-red-800 p-4 rounded shadow">
<p className="text-lg">Total Reworked</p>
<p className="text-2xl font-bold mt-0">{totalReworked}</p>
</div>
</div>
</div>
</div>
)}
</div>
);
};

export default DailyReports;
