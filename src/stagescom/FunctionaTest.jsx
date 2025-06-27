import { toBinary } from "../utils/binary.js";

const StageOneFunctionalTest = ({
filteredData = [],
criticalParameters = {},
finalParameters = {},
hardwareKeys = [],
mappedHardwareParameters = {},
stageOneCollapsed,
setStageOneCollapsed,
}) => {
return (
<div className="mt-6 font-[poppins]">
{/* Section Header */}
<div
className="bg-primary text-white p-4 rounded-t flex justify-between items-center cursor-pointer"
onClick={() => setStageOneCollapsed(!stageOneCollapsed)}
>
<span>Stage -1 Functional Test</span>
<span className="text-xl font-bold">{stageOneCollapsed ? "+" : "-"}</span>
</div>

{/* Collapsible Content */}
{!stageOneCollapsed && (
<div className="bg-white p-4 rounded-b shadow-md">
{/* User Details */}
<div className="bg-primary text-white p-4 rounded-t">User Details</div>
<div className="overflow-x-auto space-y-6 mt-2">
{filteredData.length > 0 ? (
filteredData.map((item, index) => (
<div key={index} className="overflow-x-auto">
<table className="min-w-full table-fixed border border-gray-500 rounded text-sm sm:text-base">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/2">
Users Key
</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left">
Users Value
</th>
</tr>
</thead>
<tbody>
<tr>
<td className="border border-gray-400 px-2 sm:px-4 py-2">User Name</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">
{item.userName}
</td>
</tr>
<tr>
<td className="border border-gray-400 px-2 sm:px-4 py-2">Testjig ID</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">
{item.testjigId}
</td>
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
<p className="text-center text-gray-600">No data found.</p>
)}
</div>

{/* Critical & Final Parameters */}
<div className="bg-primary text-white p-4 rounded-t mt-8">
Critical & Final Parameters
</div>
<div className="overflow-x-auto">
<table className="min-w-full table-fixed border border-gray-500 rounded text-sm sm:text-base mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">
Critical Key
</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">
Critical Value
</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">
Functional Key
</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">
Functional Value
</th>
</tr>
</thead>
<tbody>
{(() => {
const criticalEntries = Object.entries(criticalParameters || {});
const finalEntries = Object.entries(finalParameters || {});
const maxLength = Math.max(criticalEntries.length, finalEntries.length);

return Array.from({ length: maxLength }).map((_, index) => {
const [cKey, cValRaw] = criticalEntries[index] || [];
const [fKey, fValRaw] = finalEntries[index] || [];

const cVal =
typeof cValRaw === "object" && cValRaw !== null
? JSON.stringify(cValRaw)
: String(cValRaw ?? "");

const fVal =
fKey === "HardwareStatus"
? toBinary(Number(fValRaw))
: typeof fValRaw === "object" && fValRaw !== null
? JSON.stringify(fValRaw)
: String(fValRaw ?? "");

return (
<tr key={index}>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{cKey || ""}</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{cVal}</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{fKey || ""}</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{fVal}</td>
</tr>
);
});
})()}
</tbody>
</table>
</div>

{/* Hardware Status */}
<div className="bg-primary text-white p-4 rounded-t mt-8">Hardware Status</div>
<div className="overflow-x-auto">
<table className="min-w-full table-fixed border border-gray-500 rounded text-sm sm:text-base mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/2">
Hardware Parameter
</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/2">
Status
</th>
</tr>
</thead>
<tbody>
{hardwareKeys.map((key, index) => (
<tr key={index}>
<td className="border border-gray-400 px-2 sm:px-4 py-2">{key}</td>
<td className="border border-gray-400 px-2 sm:px-4 py-2">
{mappedHardwareParameters[key]}
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}
</div>
);
};

export default StageOneFunctionalTest;
