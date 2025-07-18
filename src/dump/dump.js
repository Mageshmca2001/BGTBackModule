import { useState, useEffect } from 'react';

const ProductionLineSection = () => {
const [formattedDate, setFormattedDate] = useState('');
const [formattedTime, setFormattedTime] = useState('');
const [selectedLine, setSelectedLine] = useState([]);
const [selectedBench, setSelectedBench] = useState([]);
const [selectedNIC, setSelectedNIC] = useState([]);
const [dummyData, setDummyData] = useState(null);
const [isExportDisabled, setIsExportDisabled] = useState(true);
const [maintenanceMode, setMaintenanceMode] = useState(false);

const lineOptions = ['Production Line 1', 'Production Line 2', 'Production Line 3'];
const benchOptions = ['Geni Bench 1', 'Geni Bench 2', 'Songyang Bench 1','Songyang Bench 2','Songyang Bench 3','Songyang Bench 4'];
const nicOptions = ['NIC Geni Bench 1 ', 'NIC Geni Bench 2', 'NIC Songyang Bench 1','NIC Songyang Bench 2','NIC Songyang Bench 3','NIC Songyang Bench 4'];

useEffect(() => {
const now = new Date();
setFormattedDate(now.toLocaleDateString());
setFormattedTime(now.toLocaleTimeString());
}, []);

useEffect(() => {
document.title = 'BGT - Production Line';
}, []);

const handleGenerate = () => {
const data = {
Line: selectedLine.join(', ') || 'None',
Bench: selectedBench.join(', ') || 'None',
NIC: selectedNIC.join(', ') || 'None',
};
setDummyData(data);
setIsExportDisabled(false);
};

const handleExport = () => {
alert('Exporting Report...');
};

const renderCheckboxColumn = (label, options, selected, setSelected) => (
<td className="border px-4 py-2">
<div className="flex flex-col gap-2 items-center">
{options.map((option) => (
<label key={option} className="flex items-center gap-2">
<input
type="checkbox"
checked={selected.includes(option)}
onChange={(e) => {
const newSelection = e.target.checked
? [...selected, option]
: selected.filter((item) => item !== option);
setSelected(newSelection);
}}
className="form-checkbox h-4 w-4 text-green-600"
/>
<span>{option}</span>
</label>
))}
</div>
</td>
);

return (
<div className="w-full overflow-x-auto px-4 pb-10">
<h1 className="text-3xl font-[poppins] text-primary mb-3 text-left">
Production Line
</h1>

{/* Date & Time Display */}
<div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 items-center mb-6">
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center text-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center text-center">
Time: {formattedTime}
</p>
</div>

{/* Responsive Table with Centered Checkboxes */}
<div className="overflow-auto bg-white shadow rounded">
<table className="table-auto min-w-full text-center border border-gray-300">
<thead className="bg-primary text-white">
<tr>
<th className="border px-4 py-2 text-base font-[poppins]">Production Lines</th>
<th className="border px-4 py-2 text-base font-[poppins]">Calibration Benches</th>
<th className="border px-4 py-2 text-base font-[poppins]">NIC Cards</th>
</tr>
</thead>
<tbody>
<tr className="border font-[poppins]">
{renderCheckboxColumn('Line', lineOptions, selectedLine, setSelectedLine)}
{renderCheckboxColumn('Bench', benchOptions, selectedBench, setSelectedBench)}
{renderCheckboxColumn('NIC', nicOptions, selectedNIC, setSelectedNIC)}
</tr>
</tbody>
</table>
</div>

{/* Buttons */}
<div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
<button
onClick={handleGenerate}
className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-48"
>
<i className="bx bx-cog mr-2"></i> Generate
</button>
<button
onClick={handleExport}
disabled={isExportDisabled}
className={`px-6 py-2 rounded w-48 ${
isExportDisabled
? 'bg-gray-400 cursor-not-allowed text-white'
: 'bg-blue-600 text-white hover:bg-blue-700'
}`}
>
<i className="bx bxs-file-export mr-2"></i> Export
</button>
</div>

{/* Report Output */}
{dummyData && (
<div className="mt-6 bg-white p-4 rounded shadow w-full sm:w-1/2 mx-auto">
<h2 className="text-xl font-semibold text-green-700 mb-4 text-center">
Generated Report
</h2>
{Object.entries(dummyData).map(([key, value]) => (
<p key={key} className="text-gray-800 text-center">
<strong>{key}:</strong> {value}
</p>
))}
</div>
)}
</div>
);
};

export default ProductionLineSection;
