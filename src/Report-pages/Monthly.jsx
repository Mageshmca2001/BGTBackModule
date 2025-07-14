import { useState, useEffect, useRef } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';

const Monthly = () => {
const [selectedMonth, setSelectedMonth] = useState('');
const [selectedYear, setSelectedYear] = useState('');
const [entries, setEntries] = useState('10');
const [search, setSearch] = useState('');
const [filteredData, setFilteredData] = useState([]);
const [data, setData] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [dateTime, setDateTime] = useState(new Date());
const [loading, setLoading] = useState(false);
const [modalMessage, setModalMessage] = useState('');
const [showModal, setShowModal] = useState(false);
const isExportDisabled = filteredData.length === 0;

const chartRef = useRef(null);
const chartInstanceRef = useRef(null);

useEffect(() => {
document.title = 'BGT - Monthly Report';
}, []);

useEffect(() => {
const interval = setInterval(() => setDateTime(new Date()), 1000);
return () => clearInterval(interval);
}, []);

const formattedDate = dateTime.toLocaleDateString('en-GB', {
day: '2-digit',
month: '2-digit',
year: 'numeric',
});
const formattedTime = dateTime.toLocaleTimeString();

const totalPages = Math.ceil(filteredData.length / itemsPerPage);

const handleMonthChange = (e) => setSelectedMonth(e.target.value);
const handleYearChange = (e) => setSelectedYear(e.target.value);

const handleEntriesChange = (e) => {
const value = e.target.value;
setEntries(value);
const length = value === 'All' ? filteredData.length || data.length : parseInt(value, 10);
setItemsPerPage(length);
setCurrentPage(1);
};

const handleSearchChange = (e) => {
const searchValue = e.target.value.toLowerCase();
setSearch(searchValue);
const filtered = data.filter((item) =>
(item.date && item.date.toLowerCase().includes(searchValue)) ||
(item.tested && item.tested.toString().includes(searchValue)) ||
(item.completed && item.completed.toString().includes(searchValue)) ||
(item.reworked && item.reworked.toString().includes(searchValue))
);
setFilteredData(filtered);
setCurrentPage(1);
};

const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
return Promise.race([
fetch(url, options),
new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout)),
]);
};

const handleGenerateReport = async () => {
if (!selectedMonth || !selectedYear) {
setModalMessage('Please select both month and year to generate the report.');
setShowModal(true);
return;
}

try {
setLoading(true);
const response = await fetchWithTimeout('https://frontend-2-vt1l.onrender.com/admin');
const json = await response.json();

let result = json.filter((item) => item.date);

result = result.filter((item) => {
const [day, month, year] = item.date.split('.');
return month === selectedMonth && year === selectedYear;
});

if (entries === 'All') {
setItemsPerPage(result.length);
}

setData(result);
setFilteredData(result);
setCurrentPage(1);
} catch (error) {
console.error('❌ Fetch error:', error);
setModalMessage('Error fetching data. Please check your network or try again.');
setShowModal(true);
} finally {
setLoading(false);
}
};

const handleExport = async () => {
try {
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('MonthlyReports');

const header = ['Date', 'Tested', 'Completed', 'Reworked'];
const headerRow = worksheet.addRow(header);
headerRow.font = { bold: true };
headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

worksheet.columns = [
{ width: 18 },
{ width: 12 },
{ width: 14 },
{ width: 14 },
];

filteredData.forEach(item => {
const row = worksheet.addRow([
item.date || '',
item.tested || 0,
item.completed || 0,
item.reworked || 0,
]);
row.alignment = { vertical: 'middle', horizontal: 'center' };
});

const summaryStart = filteredData.length + 3;
const summaryTitle = worksheet.getCell(`A${summaryStart}`);
summaryTitle.value = 'Total Summary';
summaryTitle.font = { bold: true, size: 12 };
summaryTitle.alignment = { vertical: 'middle', horizontal: 'center' };

const summaryRows = [
['Total Tested', totalTested],
['Total Completed', totalCompleted],
['Total Reworked', totalReworked],
];

summaryRows.forEach(([label, value]) => {
const row = worksheet.addRow([label, value]);
row.alignment = { vertical: 'middle', horizontal: 'center' };
});

const buffer = await workbook.xlsx.writeBuffer();
const blob = new Blob([buffer], { type: 'application/octet-stream' });
saveAs(blob, 'MonthlyReports.xlsx');
} catch (error) {
console.error('❌ Excel export error:', error);
}
};

const handlePageChange = (page) => setCurrentPage(page);

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

const labels = filteredData.map(item => item.date);
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
backgroundColor: '#a78bfa',
borderColor: '#7c3aed',
borderWidth: 1,
},
{
label: 'Meters Completed',
data: completed,
backgroundColor: '#34d399',
borderColor: '#10b981',
borderWidth: 1,
},
{
label: 'Meters Reworked',
data: reworked,
backgroundColor: '#f472b6',
borderColor: '#db2777',
borderWidth: 1,
},
],
},
options: {
responsive: true,
maintainAspectRatio: false,
layout: { padding: 10 },
plugins: {
legend: { position: 'top' },
title: {
display: true,
text: 'Monthly Meter Testing Analysis',
font: { size: 18, weight: 'bold', family: 'Poppins' },
color: '#333',
padding: { top: 10, bottom: 10 },
},
datalabels: { display: false },
},
scales: {
y: {
beginAtZero: true,
title: {
display: true,
text: 'Number of Meters',
color: '#333',
},
},
x: {
title: {
display: true,
text: 'Date',
color: '#333',
},
ticks: {
maxRotation: 45,
minRotation: 0,
autoSkip: true,
maxTicksLimit: 12,
},
},
},
},
});
}, [filteredData]);

const totalTested = filteredData.reduce((acc, item) => acc + (parseInt(item.tested) || 0), 0);
const totalCompleted = filteredData.reduce((acc, item) => acc + (parseInt(item.completed) || 0), 0);
const totalReworked = filteredData.reduce((acc, item) => acc + (parseInt(item.reworked) || 0), 0);

return (
<>
<div className="w-full overflow-x-hidden px-0 pb-10">
<h1 className="text-3xl font-[poppins] text-primary">Monthly Report</h1>

{/* Date & Time Display */}
<div className="flex justify-end space-x-2 items-center mt-2">
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Time: {formattedTime}
</p>
</div>

{/* Filter Section */}
<div className="bg-primary p-4 rounded shadow-md mt-4">
<div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
<div className="w-full md:w-auto">
<div className="w-full md:w-auto">
<label className="block text-base1 text-white font-[poppins]">Select Month</label>
<select
className="border border-white font-[poppins] rounded p-2 w-full sm:w-64 mt-2"
value={selectedMonth}
onChange={handleMonthChange}
>
<option value="" disabled>Select Month</option>
{Array.from({ length: 12 }, (_, i) => (
<option key={i + 1} value={String(i + 1).padStart(2, '0')}>
{new Date(0, i).toLocaleString('default', { month: 'long' })}
</option>
))}
</select>
</div>

</div>
<div className="w-full md:w-auto">
<label className="block text-base1 text-white font-[poppins]">Select Year</label>
<select
className="border border-white  font-[poppins] rounded p-2 w-full sm:w-64 mt-2"
value={selectedYear}
onChange={handleYearChange}
>
<option value="" disabled>Select Year</option>
<option value="2023">2023</option>
<option value="2024">2024</option>
<option value="2025">2025</option>
</select>
</div>

<div className="flex-grow text-right w-full md:w-auto">
<button
onClick={handleGenerateReport}
className="bg-green-600 text-white font-[poppins] px-4 py-2 rounded mt-6 hover:bg-gray-400 w-full md:w-auto mr-1"
>
<i className="bx bx-cog mr-2"></i> Generate
</button>
<span title={isExportDisabled ? 'Generate report first' : ''}>
<button
onClick={handleExport}
disabled={isExportDisabled}
className={`px-4 py-2 rounded font-[poppins] mt-6 w-full md:w-auto ${
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
<div className="bg-primary text-white font-[poppins] p-4 rounded-t mt-4">Monthly Report</div>
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
Loading Monthly report...
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
<label htmlFor="entries" className="text-gray-700 font-[poppins] whitespace-nowrap">Show</label>
<select
id="entries"
className="border border-gray-300 font-[poppins]  rounded p-2"
value={entries}
onChange={handleEntriesChange}
>
<option value="10">10</option>
<option value="25">25</option>
<option value="50">50</option>
<option value="All">All</option>
</select>
<span className="text-gray-700 font-[poppins]  whitespace-nowrap">entries</span>
</div>

<div className="flex items-center space-x-4 min-w-max">
<label htmlFor="search" className="text-gray-700 font-[poppins] whitespace-nowrap">Search:</label>
<input
type="text"
id="search"
className="border border-gray-300 font-[poppins] rounded p-2"
value={search}
onChange={handleSearchChange}
/>
</div>
</div>

{/* Table */}
<div className="overflow-x-auto">
<table className="min-w-full bg-white table-auto">
<thead>
<tr>
<th className="border text-center text-base bg-primary font-[poppins] text-white px-4 py-2">Date</th>
<th className="border text-center text-base bg-primary font-[poppins]  text-white px-4 py-2">Tested</th>
<th className="border text-center text-base bg-primary font-[poppins] text-white px-4 py-2">Completed</th>
<th className="border text-center text-base bg-primary font-[poppins] text-white px-4 py-2">Reworked</th>
</tr>
</thead>
<tbody>
{paginatedData.length === 0 ? (
<tr>
<td colSpan="4" className="text-center font-[poppins] py-4 text-gray-500">
No data available for the selected Month && Year or search.
</td>
</tr>
) : (
paginatedData.map((item, index) => (
<tr key={index}>
<td className="border text-center font-[poppins] px-4 py-2">{item.date}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.tested}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.completed}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.reworked}</td>
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
className="px-4 py-2 bg-white border font-[poppins] rounded disabled:opacity-50 shrink-0"
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
className="px-4 py-2 bg-white border font-[poppins] rounded disabled:opacity-50 shrink-0"
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
<h2 className="text-2xl font-bold font-[poppins] mb-1 text-primary">Monthly Report Chart</h2>
<p className="text-gray-500 text-sm font-[poppins] mb-2">Monthly analysis of meter testing</p>
<div className="relative w-full h-[300px] sm:h-[500px]">
<canvas ref={chartRef} className="absolute top-0 left-0 w-full h-full" />
</div>

<div className="mt-4">
<h2 className="text-xl font-bold text-primary font-[poppins] mb-2">Total Summary</h2>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-[poppins]">
<div className="bg-purple-100 text-purple-800 p-4 rounded shadow">
<p className="text-lg">Total Tested</p>
<p className="text-2xl font-bold mt-0">{totalTested}</p>
</div>
<div className="bg-green-100 text-green-800 p-4 rounded shadow">
<p className="text-lg">Total Completed</p>
<p className="text-2xl font-bold mt-0">{totalCompleted}</p>
</div>
<div className="bg-magenta-200 text-magenta-900 p-4 rounded shadow">
<p className="text-lg">Total Reworked</p>
<p className="text-2xl font-bold mt-0">{totalReworked}</p>
</div>
</div>
</div>
</div>
)}
</div>
</>
);
};

export default Monthly;
