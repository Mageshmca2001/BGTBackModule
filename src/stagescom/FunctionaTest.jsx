import { toBinary } from "../utils/binary.js";

const StageOneFunctionalTest = ({
FunctionalParameters = {},
hardwareKeys = [],
mappedHardwareParameters = {},
stageOneCollapsed,
setStageOneCollapsed,
}) => {
return (
<div className="mt-6 font-[poppins]">
{/* Section Header */}
<div
className="bg-primary text-white font-[poppins] p-4 rounded-t flex justify-between items-center cursor-pointer"
onClick={() => setStageOneCollapsed(!stageOneCollapsed)}
>
<span className="text-sm sm:text-base">Stage -1 Functional Test</span>
<span className="text-xl font-bold">{stageOneCollapsed ? "+" : "-"}</span>
</div>

{/* Collapsible Content */}
{!stageOneCollapsed && (
<div className="bg-white p-4 rounded-b shadow-md">
{/* Functional Parameters */}
<div className="bg-primary text-white p-3 sm:p-4 rounded-t mt-4 text-sm sm:text-base">
Functional Parameters
</div>
<div className="overflow-x-auto">
<table className="min-w-full table-auto border border-gray-500 rounded text-xs sm:text-sm mb-4">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">Functional Key</th>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">Functional Value</th>
</tr>
</thead>
<tbody>
{(() => {
const finalEntries = Object.entries(FunctionalParameters || {});
const maxLength = Math.max(finalEntries.length);

return Array.from({ length: maxLength }).map((_, index) => {
const [fKey, fValRaw] = finalEntries[index] || [];

const fVal =
fKey === "HardwareStatus"
? toBinary(Number(fValRaw))
: typeof fValRaw === "object" && fValRaw !== null
? JSON.stringify(fValRaw)
: String(fValRaw ?? "");

return (
<tr key={index}>
<td className="border border-gray-400 px-2 py-2 break-words">{fKey || ""}</td>
<td className="border border-gray-400 px-2 py-2 break-words">{fVal}</td>
</tr>
);
});
})()}
</tbody>
</table>
</div>

{/* Hardware Status */}
<div className="bg-primary text-white p-3 sm:p-4 rounded-t mt-6 text-sm sm:text-base">
Hardware Status
</div>
<div className="overflow-x-auto">
<table className="min-w-full table-auto border border-gray-500 rounded text-xs sm:text-sm mb-4">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">
Hardware Parameter
</th>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">Status</th>
</tr>
</thead>
<tbody>
{hardwareKeys.map((key, index) => (
<tr key={index}>
<td className="border border-gray-400 px-2 py-2 break-words">{key}</td>
<td className="border border-gray-400 px-2 py-2 break-words">
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
