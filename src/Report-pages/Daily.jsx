import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import Chart from 'chart.js/auto';

const Daily = () => {
useEffect(() => {
document.title = 'BGT - Daily Report';
}, []);

const [selectedDay, setSelectedDay] = useState('');
const [entries, setEntries] = useState('10');
const [search, setSearch] = useState('');
const [filteredData, setFilteredData] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [dateTime, setDateTime] = useState(new Date());
const [loading, setLoading] = useState(false);

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
const totalPages = Math.ceil(filteredData.length / itemsPerPage);

const handleSelectDayChange = (event) => setSelectedDay(event.target.value);

const handleEntriesChange = (event) => {
const value = event.target.value;
setEntries(value);
setItemsPerPage(value === 'All' ? filteredData.length : parseInt(value, 10));
setCurrentPage(1);
};

const handleSearchChange = (event) => {
const searchValue = event.target.value.toLowerCase();
setSearch(searchValue);
const filtered = filteredData.filter((item) =>
item.hours.toLowerCase().includes(searchValue) ||
item.tested.toString().includes(searchValue) ||
item.completed.toString().includes(searchValue) ||
item.reworked.toString().includes(searchValue)
);
setFilteredData(filtered);
setCurrentPage(1);
};

const handleGenerateReport = async () => {
setLoading(true);
try {
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

setFilteredData(filteredByDay);
setCurrentPage(1);
} catch (error) {
console.error("Error fetching report data:", error);
} finally {
setLoading(false);
}
};

const handleExport = () => {
const worksheet = XLSX.utils.json_to_sheet(filteredData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Meter Reports');
XLSX.writeFile(workbook, 'MeterReports.xlsx');
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
backgroundColor: '#60a5fa',  // soft blue
borderColor: '#3b82f6',
borderWidth: 1
},
{
label: 'Meters Completed',
data: completed,
backgroundColor: '#34d399',  // mint green
borderColor: '#10b981',
borderWidth: 1
},
{
label: 'Meters Reworked',
data: reworked,
backgroundColor: '#fca5a5',  // rose
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
font: { size: 16, weight: 'bold' },
padding: { top: 10, bottom: 10 }
},
datalabels: {
display: false
}
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
grid: {
display: false
}
}
}
}
});
}, [filteredData]);

const totalTested = filteredData.reduce((acc, item) => acc + (parseInt(item.tested) || 0), 0);
const totalCompleted = filteredData.reduce((acc, item) => acc + (parseInt(item.completed) || 0), 0);
const totalReworked = filteredData.reduce((acc, item) => acc + (parseInt(item.reworked) || 0), 0);

return (
<div className="w-full overflow-x-hidden px-0 pb-10">
<h1 className="text-3xl font-[poppins] text-primary">Daily Report</h1>

<div className="flex justify-end space-x-2 items-center mt-4">
<p className="bg-primary text-white font-semibold w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-semibold w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Time: {formattedTime}
</p>
</div>

<div className="bg-primary p-4 rounded shadow-md mt-4">
<div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
<div className="w-full md:w-auto">
<label htmlFor="selectDay" className="block text-xl text-white font-[poppins]">
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
<button
onClick={handleExport}
className="bg-green-600 text-white px-4 py-2 rounded mt-6 hover:bg-gray-400 w-full md:w-auto"
>
<i className="bx bxs-file-export mr-2"></i> Export
</button>
</div>
</div>
</div>

<div className="bg-primary text-white font-[poppins] p-4 rounded-t mt-4">Daily Report</div>
<div className="bg-white p-4 rounded-b shadow-md">
<div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
<div className="flex items-center space-x-4">
<label htmlFor="entries" className="text-gray-700">Show</label>
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
<span className="text-gray-700">entries</span>
</div>

<div className="flex items-center space-x-4">
<label htmlFor="search" className="text-gray-700">Search:</label>
<input
type="text"
id="search"
className="border border-gray-300 rounded p-2"
value={search}
onChange={handleSearchChange}
/>
</div>
</div>

{loading ? (
<div className="flex justify-center items-center py-10">
<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
<span className="ml-4 text-primary font-semibold">Loading...</span>
</div>
) : (
<div className="overflow-x-auto">
<table className="min-w-full bg-white table-auto">
<thead>
<tr>
<th className="border text-center bg-primary text-white px-4 py-2">Hours</th>
<th className="border text-center bg-primary text-white px-4 py-2">Tested</th>
<th className="border text-center bg-primary text-white px-4 py-2">Completed</th>
<th className="border text-center bg-primary text-white px-4 py-2">Reworked</th>
</tr>
</thead>
<tbody>
{paginatedData.map((item, index) => (
<tr key={index}>
<td className="border text-center px-4 py-2">{item.hours}</td>
<td className="border text-center px-4 py-2">{item.tested}</td>
<td className="border text-center px-4 py-2">{item.completed}</td>
<td className="border text-center px-4 py-2">{item.reworked}</td>
</tr>
))}
</tbody>
</table>
</div>
)}

<div className="flex justify-between items-center mt-4">
<span className="text-sm text-gray-700">
Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
</span>

<div className="flex space-x-2">
<button
onClick={() => handlePageChange(currentPage - 1)}
disabled={currentPage === 1}
className="px-4 py-2 bg-white border rounded disabled:opacity-50"
>
Previous
</button>

{Array.from({ length: totalPages }, (_, index) => (
<button
key={index}
onClick={() => handlePageChange(index + 1)}
className={`px-4 py-2 border rounded ${currentPage === index + 1 ? 'bg-primary text-white' : 'bg-white'}`}
>
{index + 1}
</button>
))}

<button
onClick={() => handlePageChange(currentPage + 1)}
disabled={currentPage === totalPages}
className="px-4 py-2 bg-white border rounded disabled:opacity-50"
>
Next
</button>
</div>
</div>
</div>

{filteredData.length > 0 && (
<div className="bg-white p-4 mt-6 border-t pt-6 rounded shadow-md w-full overflow-hidden">
<h2 className="text-2xl font-bold font-[poppins] mb-1 text-primary">Daily Report Chart</h2>
<p className="text-gray-500 text-sm font-[poppins] mb-2">Daily analysis of meter testing</p>
<div className="relative w-full h-[500px]">
<canvas ref={chartRef} className="absolute top-0 left-0 w-full h-full" />
</div>

<div className="mt-4">
<h2 className="text-xl font-bold text-primary font-[poppins] mb-2">Total Summary</h2>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-[poppins]">
<div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
<p className="text-lg font-semibold">Total Tested</p>
<p className="text-2xl font-bold mt-0">{totalTested}</p>
</div>
<div className="bg-green-100 text-green-800 p-4 rounded shadow">
<p className="text-lg font-semibold">Total Completed</p>
<p className="text-2xl font-bold mt-0">{totalCompleted}</p>
</div>
<div className="bg-red-100 text-red-800 p-4 rounded shadow">
<p className="text-lg font-semibold">Total Reworked</p>
<p className="text-2xl font-bold mt-0">{totalReworked}</p>
</div>
</div>
</div>
</div>
)}
</div>
);
};

export default Daily;
