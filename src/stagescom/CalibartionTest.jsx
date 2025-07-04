
const StageTwoCalibrationTest = ({
CalibParameters,
stageTwoCollapsed,
setStageTwoCollapsed,
}) => {
return (
<div className="mt-6 font-[poppins]">
{/* Section Header */}
<div
className="bg-primary text-white font-[poppins] p-4 rounded-t flex justify-between items-center cursor-pointer"
onClick={() => setStageTwoCollapsed(!stageTwoCollapsed)}
>
<span className="text-sm sm:text-base">Stage -2 Calibration Test</span>
<span className="text-xl font-bold">{stageTwoCollapsed ? "+" : "-"}</span>
</div>

{/* Collapsible Content */}
{!stageTwoCollapsed && (
<div className="bg-white p-4 rounded-b shadow-md">
{/* User Details */}

{/* Calibration & Final Parameters */}
<div className="bg-primary text-white font-[poppins] p-4 rounded-t mt-8">
Calibration Parameters
</div>
<div className="overflow-x-auto">
<table className="min-w-full table-auto border border-gray-500 rounded text-xs sm:text-sm mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">Calibration Key</th>
<th className="border border-gray-500 px-2 py-2 text-left whitespace-nowrap">Calibration Value</th>
</tr>
</thead>
<tbody>
{Array.from({
length: Math.max(
Object.keys(CalibParameters).length,

),
}).map((_, index) => {
const cKey = Object.keys(CalibParameters)[index];
const cVal = CalibParameters[cKey];

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

export default StageTwoCalibrationTest;
