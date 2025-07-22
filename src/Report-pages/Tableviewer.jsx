import { useEffect, useState } from 'react';
import TableViewer from '../components/Tester';

const API_BASE = import.meta.env.VITE_API;

export default function App() {
const [tableName, setTableName] = useState('');
const [tableData, setTableData] = useState([]);
const [loading, setLoading] = useState(false);
const [heading, setHeading] = useState('Waiting for Incoming Data...');

const fetchTableData = async () => {
if (!tableName.trim()) return;

setLoading(true);
setHeading(`Loading "${tableName}"...`);

try {
const res = await fetch(`${API_BASE}/tables/${tableName}`);
if (!res.ok) throw new Error('Table not found or error in API');
const json = await res.json();
setTableData(json.rows || []);
setHeading(`Data from "${tableName}"`);
} catch (err) {
console.error('Error fetching table data:', err);
setHeading(`Failed to load "${tableName}"`);
setTableData([]);
} finally {
setLoading(false);
}
};

return (
<div className="p-6 max-w-6xl mx-auto font-sans">
<h1 className="text-2xl font-bold mb-4 text-blue-700">{heading}</h1>

<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
<input
type="text"
value={tableName}
onChange={(e) => setTableName(e.target.value)}
placeholder="Enter table name (e.g., TestJigDetails)"
className="border rounded px-4 py-2 w-full sm:w-auto"
/>
<button
onClick={fetchTableData}
className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
Fetch
</button>
</div>

{loading ? (
<p>Loading table data...</p>
) : (
<TableViewer data={tableData} />
)}
</div>
);
}
