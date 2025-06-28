const StageFourNICTest = ({
filteredData,
nicTestData,
serialNumber,
stageFourCollapsed,
setStageFourCollapsed,
}) => {
const matchedNIC = nicTestData.find(
(item) => item.PCBSerialNumber?.trim().toLowerCase() === serialNumber.trim().toLowerCase()
);

return (
<div className="mt-6">
{/* Section Header */}
<div
className="bg-primary text-white font-[poppins] p-4 rounded-t flex justify-between items-center cursor-pointer"
onClick={() => setStageFourCollapsed(!stageFourCollapsed)}
>
<span>Stage -4 NIC_COMM Test</span>
<span className="text-xl font-bold">{stageFourCollapsed ? '+' : '-'}</span>
</div>

{/* Collapsible Content */}
{!stageFourCollapsed && (
<div className="bg-white p-4 rounded-b shadow-md">
{/* User Details */}
<div className="bg-primary text-white font-[poppins] p-4 rounded-t">
User Details
</div>
<div className="overflow-x-auto space-y-6 mt-2">
{filteredData.length > 0 ? (
filteredData.map((item, index) => (
<div key={index} className="overflow-x-auto">
<table className="min-w-full table-fixed border border-gray-500 rounded text-sm sm:text-base">
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

{/* NIC Test Parameters */}
<div className="bg-primary text-white font-[poppins] p-4 rounded-t mt-8">
NIC Test Parameters
</div>
<div className="overflow-x-auto">
{matchedNIC ? (
<table className="min-w-full table-fixed border border-gray-500 rounded text-sm sm:text-base mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/2">NIC Test Key</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left">NIC Test Value</th>
</tr>
</thead>
<tbody>
{Object.entries(matchedNIC).map(([key, value], index) => (
<tr key={index}>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{key}</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{value}</td>
</tr>
))}
</tbody>
</table>
) : (
<p className="text-center text-gray-600">No NIC test data found for this Serial Number.</p>
)}
</div>
</div>
)}
</div>
);
};

export default StageFourNICTest;
