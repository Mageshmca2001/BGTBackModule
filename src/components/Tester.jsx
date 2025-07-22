import React from 'react';

const TableViewer = ({ data }) => {
if (!data || data.length === 0) return <p>No data to display.</p>;

const headers = Object.keys(data[0]);

return (
<div className="overflow-auto">
<table className="min-w-full border text-sm border-gray-300">
<thead>
<tr className="bg-gray-100">
{headers.map((header) => (
<th key={header} className="px-4 py-2 border-b text-left font-medium">
{header}
</th>
))}
</tr>
</thead>
<tbody>
{data.map((row, idx) => (
<tr key={idx} className="odd:bg-white even:bg-gray-50">
{headers.map((col) => (
<td key={col} className="px-4 py-2 border-b">
{row[col]}
</td>
))}
</tr>
))}
</tbody>
</table>
</div>
);
};

export default TableViewer;
