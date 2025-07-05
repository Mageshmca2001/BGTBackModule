const StageFourNICTest = ({
NICParameters,
stageFourCollapsed,
setStageFourCollapsed,
}) => {


return (
<div className="mt-6 font-[poppins]">
{/* Section Header */}
<div
className="bg-primary text-white font-[poppins] p-4 rounded-t flex justify-between items-center cursor-pointer"
onClick={() => setStageFourCollapsed(!stageFourCollapsed)}
>
<span className="text-sm sm:text-base">Stage -4 NIC Test</span>
<span className="text-xl font-bold">{stageFourCollapsed ? "+" : "-"}</span>
</div>

{/* Collapsible Content */}
{!stageFourCollapsed && (
<div className="bg-white p-4 rounded-b shadow-md">
{/* User Details */}

{/* NIC Test Parameters */}
<div className="bg-primary text-white p-3 sm:p-4 rounded-t mt-4 text-sm sm:text-base">
NIC Parameters
</div>
<div className="overflow-x-auto">
<table className="min-w-full table-auto border border-gray-500 rounded text-xs sm:text-sm mb-4">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">NIC Key</th>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">NIC Value</th>
</tr>
</thead>
<tbody>
{Array.from({
length: Math.max(
Object.keys(NICParameters).length,

),
}).map((_, index) => {
const cKey = Object.keys(NICParameters)[index];
const cVal = NICParameters[cKey];

return (
<tr key={index}>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{cKey || ""}</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{cVal || ""}</td>
</tr>
);
})}
</tbody>
</table>
</div>


</div>
)}
</div>
);
};

export default StageFourNICTest;
