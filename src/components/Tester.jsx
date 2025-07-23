import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API;

const TableViewer = () => {
useEffect(() => {
document.title = 'BGT - Tableview';
}, []);


const [tableList, setTableList] = useState([]);
const [selectedTable, setSelectedTable] = useState('');
const [fromDate, setFromDate] = useState('');
const [toDate, setToDate] = useState('');
const [tableData, setTableData] = useState([]);
const [loading, setLoading] = useState(false);
const [modalMessage, setModalMessage] = useState('');





const fetchTableList = async () => {
try {
const res = await axios.get(`${API_BASE}/user/tables`);
setTableList(res.data);
} catch (err) {
console.error(err);
setModalMessage('❌ Failed to load table list.');
}
};

const handleViewTableData = async () => {
if (!selectedTable) {
setModalMessage('❗ Please select a table.');
return;
}

if (!fromDate || !toDate) {
setModalMessage('❗ Please select both from and to dates.');
return;
}

try {
setLoading(true);
setModalMessage('');

const res = await axios.get(`${API_BASE}/user/tables/${selectedTable}`, {
params: {
fromDate,
toDate,
},
});

const data = Array.isArray(res.data) ? res.data : res.data.data || [];
setTableData(data);
} catch (err) {
console.error(err);
setModalMessage('❌ Failed to fetch table data.');
setTableData([]);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchTableList();
}, []);

return (
<div className="w-full p-4">
<h1 className="text-2xl font-bold mb-4 text-primary font-[poppins]">📋 Table Viewer</h1>

<div className="bg-primary text-white font-[poppins] p-4 rounded shadow-md mb-4">
<div className="flex flex-col md:flex-row flex-wrap gap-4 items-end">
<div className="w-full md:w-1/4">
<label className="block mb-3">Select Table</label>
<select
className="p-2 rounded text-primary w-full"
value={selectedTable}
onChange={(e) => setSelectedTable(e.target.value)}
>
<option value="">-- Select Table --</option>
{tableList.map((table, idx) => (
<option key={idx} value={table}>{table}</option>
))}
</select>
</div>

<div className="w-full md:w-1/4">
<label className="block mb-3">From Date</label>
<input
type="date"
className="p-2 rounded text-primary w-full"
value={fromDate}
onChange={(e) => setFromDate(e.target.value)}
/>
</div>

<div className="w-full md:w-1/4">
<label className="block mb-3">To Date</label>
<input
type="date"
className="p-2 rounded text-primary w-full"
value={toDate}
onChange={(e) => setToDate(e.target.value)}
/>
</div>

<div className="w-full md:w-auto">
<button
onClick={handleViewTableData}
className="bg-white text-primary border border-white hover:bg-gray-100 px-4 py-2 rounded w-full"
>
Fetch Table
</button>
</div>
</div>
</div>

{modalMessage && (
<div className="bg-red-100 text-red-700 p-4 rounded mb-4">{modalMessage}</div>
)}

{loading && (
<div className="text-center py-6">
<div className="animate-spin inline-block w-6 h-6 border-4 border-current border-t-transparent text-primary rounded-full" />
<p className="mt-2 font-[poppins] text-sm text-gray-600">Loading table data...</p>
</div>
)}

{!loading && tableData.length > 0 && (
<div className="bg-white p-4 rounded shadow-md overflow-x-auto w-full max-h-[70vh]">
<h2 className="text-lg font-bold mb-3 text-primary font-[poppins]">
Table: {selectedTable}
</h2>
<table className="min-w-full border text-sm border-gray-300">
<thead>
<tr className="bg-gray-100">
{Object.keys(tableData[0]).map((header) => (
<th key={header} className="px-4 py-2 border-b text-left font-medium">
{header}
</th>
))}
</tr>
</thead>
<tbody>
{tableData.map((row, idx) => (
<tr key={idx} className="odd:bg-white even:bg-gray-50">
{Object.keys(row).map((col) => (
<td key={col} className="px-4 py-2 border-b">
{row[col]}
</td>
))}
</tr>
))}
</tbody>
</table>
</div>
)}
</div>
);
};

export default TableViewer;
