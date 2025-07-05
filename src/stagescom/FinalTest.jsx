import { toBinary } from "../utils/binary.js";

const StagefiveFinalTest = ({
filteredData,
finalTestData,
serialNumber,
stagefiveCollapsed,
setStagefiveCollapsed,
}) => {
const matchedFinal = finalTestData.find(
(item) =>
item.PCBSerialNumber?.trim().toLowerCase() === serialNumber.trim().toLowerCase()
);

return (
<div className="mt-6">
{/* Section Header */}
<div
className="bg-primary text-white font-[poppins] p-4 rounded-t flex justify-between items-center cursor-pointer"
onClick={() => setStagefiveCollapsed(!stagefiveCollapsed)}
>
<span>Stage -5 Final Test</span>
<span className="text-xl font-bold">{stagefiveCollapsed ? "+" : "-"}</span>
</div>

{/* Collapsible Content */}
{!stagefiveCollapsed && (
<div className="bg-white p-4 rounded-b shadow-md">
{/* User Details */}
<div className="bg-primary text-white p-3 sm:p-4 rounded-t mt-6 text-sm sm:text-base">
User Details
</div>
<div className="overflow-x-auto space-y-6 mt-2">
{filteredData.length > 0 ? (
filteredData.map((item, index) => (
<div key={index} className="overflow-x-auto">
<table className="min-w-full table-auto border border-gray-500 rounded text-xs sm:text-sm mb-4">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/2">Users Key</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left">Users Value</th>
</tr>
</thead>
<tbody>
<tr>
<td className="border border-gray-400 px-2 sm:px-4 py-2">User Name</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{item.userName}</td>
</tr>
<tr>
<td className="border border-gray-400 px-2 sm:px-4 py-2">Testjig ID</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{item.testjigId}</td>
</tr>
<tr>
<td className="border border-gray-400 px-2 sm:px-4 py-2">Test Start Time</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">
{new Date(item.testStartTime).toLocaleString()}
</td>
</tr>
<tr>
<td className="border border-gray-400 px-2 sm:px-4 py-2">Test End Time</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">
{new Date(item.testEndTime).toLocaleString()}
</td>
</tr>
</tbody>
</table>
</div>
))
) : (
<p className="text-center text-gray-600">No user data found.</p>
)}
</div>

{/* Final Parameters */}
<div className="bg-primary text-white font-[poppins] p-4 rounded-t mt-8">
Final Parameters
</div>
<div className="overflow-x-auto">
{matchedFinal ? (
<table className="min-w-full table-fixed border border-gray-500 rounded text-sm sm:text-base mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">Final Key</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">Final Value</th>
</tr>
</thead>
<tbody>
{Object.entries(matchedFinal).map(([key, value], index) => (
<tr key={index}>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{key}</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{value}</td>
</tr>
))}
</tbody>
</table>
) : (
<p className="text-center text-gray-600">
No final test data found for this Serial Number.
</p>
)}
</div>
</div>
)}
</div>
);
};

export default StagefiveFinalTest;
