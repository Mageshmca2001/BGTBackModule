// DailyReports.jsx
import { useState, useEffect, useRef,useMemo  } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';
import { format, subDays } from 'date-fns';


const API_BASE = import.meta.env.VITE_API;

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
const [modalMessage, setModalMessage] = useState('');
const [showModal, setShowModal] = useState(false);
const isExportDisabled = filteredData.length === 0;

const chartRef = useRef(null);
const chartInstanceRef = useRef(null);

// ⏰ Clock update every second
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

// 📅 Summary label for report heading
const getDaySummary = () => {
const today = new Date();
const previousDay = subDays(today, 1);
const startDate = subDays(today, 7);

if (selectedDay === '01') {
return `${format(today, 'EEEE dd/MM/yyyy ')}`;
}
if (selectedDay === '02') {
return `${format(previousDay, 'EEEE dd/MM/yyyy')}`;
}
if (selectedDay === '03') {
return `From ${format(startDate, 'EEEE dd/MM/yyyy')} to ${format(previousDay, 'EEEE dd/MM/yyyy')}`;
}
return '';
};

const daySummary = getDaySummary();

// 📊 Totals at the top
const totalTested = filteredData.reduce((sum, item) => sum + (parseInt(item.tested) || 0), 0);
const totalCompleted = filteredData.reduce((sum, item) => sum + (parseInt(item.completed) || 0), 0);
const totalReworked = filteredData.reduce((sum, item) => sum + (parseInt(item.reworked) || 0), 0);

// 🔢 Pagination logic
const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const paginatedData = useMemo(() => {
const start = (currentPage - 1) * itemsPerPage;
const end = start + itemsPerPage;
return filteredData.slice(start, end);
}, [filteredData, currentPage, itemsPerPage]);

// 🗓️ Dropdown handler
const handleSelectDayChange = (event) => {
setSelectedDay(event.target.value);
};

// 🔢 Entries per page
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

// 🔍 Search filter
const handleSearchChange = (event) => {
const value = event.target.value.toLowerCase();
setSearch(value);

const filtered = originalData.filter((item) => {
return (
item.hours.toLowerCase().includes(value) ||
item.functional?.toString().includes(value) ||
item.functionalCompleted?.toString().includes(value) ||
item.calibration?.toString().includes(value) ||
item.calibrationCompleted?.toString().includes(value) ||
item.accuracy?.toString().includes(value) ||
item.accuracyCompleted?.toString().includes(value) ||
item.nic?.toString().includes(value) ||
item.nicCompleted?.toString().includes(value) ||
item.finalInit?.toString().includes(value) ||
item.finalInitCompleted?.toString().includes(value) ||
item.tested?.toString().includes(value) ||
item.completed?.toString().includes(value) ||
item.reworked?.toString().includes(value)
);
});

setFilteredData(filtered);
setCurrentPage(1);
};

const handleGenerateReport = async () => {
if (!selectedDay) {
setModalMessage('❗ Please select the day to generate the report.');
setShowModal(true);
return;
}

try {
setLoading(true);
const res = await axios.get(`${API_BASE}/user/hourly`);
const apiData = res.data;

const rawData =
selectedDay === '01'
? apiData?.data?.current?.fullData
: apiData?.data?.previous?.fullData;

if (!rawData || Object.keys(rawData).length === 0) {
setModalMessage('⚠️ No data found for the selected period.');
setShowModal(true);
setOriginalData([]);
setFilteredData([]);
return;
}

const testTypes = ['Functional', 'Calibration', 'Accuracy', 'NIC', 'FinalTest'];
const hourLabels = [
'06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
'12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
'18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
'00:00', '01:00', '02:00', '03:00', '04:00', '05:00'
];

const hourlyMap = {};
for (const type of testTypes) {
(rawData?.[type] || []).forEach(entry => {
const [hour] = entry.TimeSlot?.split('-') || [];
if (!hour) return;

if (!hourlyMap[hour]) {
hourlyMap[hour] = {
hours: hour,
functional: 0, functionalCompleted: 0,
calibration: 0, calibrationCompleted: 0,
accuracy: 0, accuracyCompleted: 0,
nic: 0, nicCompleted: 0,
finalInit: 0, finalInitCompleted: 0,
tested: 0,
completed: 0,
reworked: 0
};
}

const target = {
Functional: 'functional',
Calibration: 'calibration',
Accuracy: 'accuracy',
NIC: 'nic',
FinalTest: 'finalInit'
}[type];

if (entry.Status === 'Total') {
hourlyMap[hour][target] += entry.MeterCount || 0;
hourlyMap[hour].tested += entry.MeterCount || 0;
} else if (entry.Status === 'PASS') {
hourlyMap[hour][`${target}Completed`] += entry.MeterCount || 0;
hourlyMap[hour].completed += entry.MeterCount || 0;
} else if (entry.Status === 'REWORK') {
hourlyMap[hour].reworked += entry.MeterCount || 0;
}
});
}

const formatted = hourLabels.map(hour => hourlyMap[hour] || {
hours: hour,
functional: 0, functionalCompleted: 0,
calibration: 0, calibrationCompleted: 0,
accuracy: 0, accuracyCompleted: 0,
nic: 0, nicCompleted: 0,
finalInit: 0, finalInitCompleted: 0,
tested: 0,
completed: 0,
reworked: 0
});

setOriginalData(formatted);
setFilteredData(formatted);
setCurrentPage(1);
} catch (err) {
console.error("Hourly API fetch failed:", err);
setModalMessage('❌ Failed to fetch hourly report. Please try again later.');
setShowModal(true);
} finally {
setLoading(false);
}
};
const handleExport = async () => {
setLoading(true);
try {
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Hourly Report');

const header = [
'Hour', 'Functional', 'Functional Completed',
'Calibration', 'Calibration Completed',
'Accuracy', 'Accuracy Completed',
'NIC', 'NIC Completed',
'Final Test', 'Final Completed',
'Total Tested', 'Completed', 'Reworked'
];
worksheet.addRow(header).font = { bold: true };

filteredData.forEach(item => {
worksheet.addRow([
item.hours,
item.functional,
item.functionalCompleted,
item.calibration,
item.calibrationCompleted,
item.accuracy,
item.accuracyCompleted,
item.nic,
item.nicCompleted,
item.finalInit,
item.finalInitCompleted,
item.tested,
item.completed,
item.reworked
]);
});

const buffer = await workbook.xlsx.writeBuffer();
const blob = new Blob([buffer], { type: 'application/octet-stream' });
saveAs(blob, `Hourly_Report_${formattedDate}.xlsx`);
} catch (err) {
console.error("Export failed:", err);
} finally {
setLoading(false);
}
};


const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);


useEffect(() => {
if (!chartRef.current || filteredData.length === 0) return;

const ctx = chartRef.current.getContext('2d');

if (chartInstanceRef.current) {
chartInstanceRef.current.destroy();
}

const pageData = paginatedData;
const completedData = pageData.map(item => item.completed); // Tracking line source

chartInstanceRef.current = new Chart(ctx, {
type: 'bar',
data: {
labels: pageData.map(item => item.hours),
datasets: [
{
label: 'Functional',
data: pageData.map(item => item.functional),
backgroundColor: '#3B82F6',
},
{
label: 'Calibration',
data: pageData.map(item => item.calibration),
backgroundColor: '#F59E0B',
},
{
label: 'Accuracy',
data: pageData.map(item => item.accuracy),
backgroundColor: '#10B981',
},
{
label: 'NIC',
data: pageData.map(item => item.nic),
backgroundColor: '#EF4444',
},
{
label: 'Final Test',
data: pageData.map(item => item.finalInit),
backgroundColor: '#8B5CF6',
},
{
label: 'Total Tested',
data: pageData.map(item => item.tested),
backgroundColor: '#005c99ff',
},
{
label: 'Total Completed',
data: pageData.map(item => item.completed),
backgroundColor: 'rgba(34, 197, 94, 0.7)',
},
{
label: 'Total Reworked',
data: pageData.map(item => item.reworked),
backgroundColor: '#ff0000ff',
},
{
// ✅ Tracking Line Dataset
label: 'Tracking Line',
data: completedData,
type: 'line',
borderColor: 'rgba(59, 130, 246, 1)',
backgroundColor: 'transparent',
borderWidth: 2,
pointRadius: 3,
tension: 0.3,
order: 0,
datalabels: {
display: false,
},
skipLegend: true, // Custom flag to filter legend
},
],
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
display: true,
labels: {
font: {
    family: 'Poppins',
    size: 12,
},
filter: (legendItem) => legendItem.text !== 'Tracking Line', // ✅ Hide from legend
},
},
tooltip: {
enabled: true,
mode: 'index',
intersect: false,
callbacks: {
label: function (context) {
const label = context.dataset.label || '';
const value = context.parsed.y;
if (label === 'Tracking Line') return null; // ✅ Hide from tooltip
return `${label}: ${value}`;
},
},
titleFont: {
family: 'Poppins',
size: 14,
weight: 'bold',
},
bodyFont: {
family: 'Poppins',
size: 13,
},
backgroundColor: 'rgba(255, 255, 255, 0.95)',
titleColor: '#111827',
bodyColor: '#1F2937',
borderColor: '#E5E7EB',
borderWidth: 1,
padding: 10,
cornerRadius: 8,
boxPadding: 4,
},
datalabels: {
display: false,
},
},
interaction: {
mode: 'index',
intersect: false,
},
scales: {
x: {
stacked: false,
ticks: {
autoSkip: false,
font: {
    family: 'Poppins',
    size: 12,
},
},
grid: {
display: false,
},
},
y: {
beginAtZero: true,
suggestedMax: 1000,
ticks: {
stepSize: 200,
font: {
    family: 'Poppins',
},
},
grid: {
drawBorder: false,
},
},
},
},
});
}, [paginatedData]);




return (
<>
<div className="w-full overflow-x-hidden px-0 pb-10">
<h1 className="text-3xl font-[poppins] text-primary">Daily Report</h1>

{/* Date & Time Display */}
<div className="flex justify-end space-x-2 items-center mt-2">
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Time: {formattedTime}
</p>
</div>

<div className="bg-primary p-4 rounded shadow-md mt-4">
<div className="flex flex-col md:flex-row md:items-end gap-4">
<div className="w-full md:w-2/3">
<label htmlFor="selectDay" className="block text-base1 text-white font-[poppins] mb-2">
Select Day
</label>
<div className="flex flex-col sm:flex-row gap-2">
<select
id="selectDay"
className="border border-white font-[poppins] rounded p-2 w-full sm:w-60"
value={selectedDay}
onChange={handleSelectDayChange}
>
<option value="" disabled>Select Day</option>
<option value="01">Present Day</option>
<option value="02">Previous Day</option>
</select>
<input
type="text"
readOnly
value={daySummary}
placeholder="Select Date"
className="bg-white text-primary font-[poppins] border rounded p-2 w-full sm:w-60"
/>
</div>
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
className={`px-4 py-2 rounded mt-6 w-full md:w-auto ${isExportDisabled
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
<div className="overflow-x-auto w-full">
<table className="min-w-full bg-white table-auto">
<thead>
<tr>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">Hours</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">FunctionalTest</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">CalibrationTest</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">AccuracyTest</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">NICCOMTest</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">FinalTest</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">Tested</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">Completed</th>
<th className="border text-center text-base font-[poppins] bg-primary text-white px-4 py-2">Reworked</th>
</tr>
</thead>
<tbody>
{paginatedData.length === 0 ? (
<tr>
<td colSpan="10" className="text-center font-[poppins] py-4 text-gray-500">
No data available for the selected day or search.
</td>
</tr>
) : (
paginatedData.map((item, index) => (
<tr key={index}>
<td className="border text-center font-[poppins] px-4 py-2">{item.hours}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.functional}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.calibration}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.accuracy}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.nic}</td>
<td className="border text-center font-[poppins] px-4 py-2">{item.finalInit}</td>
<td className='boreder text-center font-[poppins] px-4 py-2'>{item.tested}</td>
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
className="px-4 py-2 bg-white  font-[poppins] border rounded disabled:opacity-50 shrink-0"
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
className="px-4 py-2 bg-white  font-[poppins] border rounded disabled:opacity-50 shrink-0"
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
{/* Insert this modal block at the very END */}
{showModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
<div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
<h2 className="text-xl font-bold text-red-600 mb-4 font-[poppins]">Alert</h2>
<p className="text-gray-800 font-[poppins]">{modalMessage}</p>
<div className="mt-4 flex justify-end">
<button
onClick={() => setShowModal(false)}
className="bg-primary text-white px-4 py-2 rounded hover:bg-gray-700 font-[poppins]"
>
Close
</button>
</div>
</div>
</div>
)}
</>
);
};

export default DailyReports;