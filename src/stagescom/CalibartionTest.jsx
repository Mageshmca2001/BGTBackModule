
const StageTwoCalibrationTest = ({
filteredData,
calibrationData,
stageTwoCollapsed,
setStageTwoCollapsed,
}) => {
return (
<div className="mt-6">
{/* Section Header */}
<div
className="bg-primary text-white font-[poppins] p-4 rounded-t flex justify-between items-center cursor-pointer"
onClick={() => setStageTwoCollapsed(!stageTwoCollapsed)}
>
<span>Stage -2 Calibration Test</span>
<span className="text-xl font-bold">{stageTwoCollapsed ? "+" : "-"}</span>
</div>

{/* Collapsible Content */}
{!stageTwoCollapsed && (
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
<p className="text-center text-gray-600">No data found.</p>
)}
</div>

{/* Calibration & Final Parameters */}
<div className="bg-primary text-white font-[poppins] p-4 rounded-t mt-8">
Calibration Parameters
</div>
<div className="overflow-x-auto">
<table className="min-w-full table-fixed border border-gray-500 rounded text-sm sm:text-base mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">Calibration Key</th>
<th className="border border-gray-500 px-2 sm:px-4 py-2 text-left w-1/4">Calibration Value</th>
</tr>
</thead>
<tbody>
{Array.from({
length: Math.max(
Object.keys(calibrationData).length,

),
}).map((_, index) => {
const cKey = Object.keys(calibrationData)[index];
const cVal = calibrationData[cKey];

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
