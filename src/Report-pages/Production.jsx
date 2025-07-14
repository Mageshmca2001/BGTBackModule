import { useState, useEffect } from 'react';
import axios from 'axios';
import { toBinary } from '../utils/binary';

const Production = () => {
// Maintenance Mode Toggle
const maintenanceMode = false; // Change to false to show full app

const [finalParameters, setFinalParameters] = useState([]);
const [finalMatchedParameters, setFinalMatchedParameters] = useState(null);
const [filteredData, setFilteredData] = useState([]);
const [dateTime, setDateTime] = useState(new Date());
const [notFoundMessage, setNotFoundMessage] = useState({ visible: false, message: '' });
const [calibrationData, setCalibrationData] = useState([]);
const [selectedLine, setSelectedLine] = useState('');
const [selectedBench, setSelectedBench] = useState('');
const [selectedNIC, setSelectedNIC] = useState('');
const [showStageOne, setShowStageOne] = useState(false);
const [matchedCalibration, setMatchedCalibration] = useState(null);

useEffect(() => {
document.title = 'BGT - Meter Report';

if (!maintenanceMode) {
const fetchData = async () => {
try {
const res = await axios.get('http://localhost:5000/user/parameters');
const responseData = res.data;
setFilteredData(responseData?.data || []);
setFinalParameters(responseData?.finalParameters || []);
setCalibrationData(responseData?.calibration || []);
} catch (error) {
console.error('❌ API Fetch Error:', error);
}
};

fetchData();
}
}, [maintenanceMode]);

useEffect(() => {
const interval = setInterval(() => setDateTime(new Date()), 1000);
return () => clearInterval(interval);
}, []);

const formattedDate = dateTime.toLocaleDateString('en-GB');
const formattedTime = dateTime.toLocaleTimeString();

const handleGenerateReport = () => {
if (!selectedLine || !selectedBench || !selectedNIC) {
alert('Please select Line, Bench, and NIC.');
setShowStageOne(false);
setNotFoundMessage({ visible: false, message: '' });
return;
}

const generatedSerial = `${selectedLine}${selectedBench}${selectedNIC}`.replace(/\s+/g, '').toLowerCase();

const matched = finalParameters.find(p =>
p?.PCBSerialNumber?.trim().toLowerCase() === generatedSerial
);
const matchedCalib = calibrationData.find(c =>
c?.PCBSerialNumber?.trim().toLowerCase() === generatedSerial
);

if (matched) {
setFinalMatchedParameters(matched);
setMatchedCalibration(matchedCalib || null);
setShowStageOne(true);
setNotFoundMessage({ visible: false, message: '' });
} else {
setFinalMatchedParameters(null);
setMatchedCalibration(null);
setShowStageOne(false);
setNotFoundMessage({ visible: true, message: 'Serial Number was not found in records.' });
}
};

const handleExport = () => {
console.log('📤 Exporting data:', filteredData);
};

return (
<div className="w-full overflow-x-hidden px-0 pb-10">
{maintenanceMode ? (
<div className="flex items-center justify-center min-h-[70vh] text-center">
<div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-8 rounded-lg shadow">
<h2 className="text-2xl font-semibold mb-2">⚠️ Currently Under Maintenance</h2>
<p className="text-gray-700">We are working to improve your experience. Please check back later.</p>
</div>
</div>
) : (
<>
<h1 className="text-3xl font-[poppins] text-primary">Production Line</h1>

<div className="flex justify-end space-x-2 items-center mt-3">
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Time: {formattedTime}
</p>
</div>

<div className="bg-primary p-4 rounded shadow-md mt-4">
<div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4 items-end">
<div className="w-full md:w-1/3">
<label className="block text-white font-[poppins]">Line</label>
<select
value={selectedLine}
onChange={(e) => setSelectedLine(e.target.value)}
className="border border-gray-300 rounded p-2 w-full mt-2"
>
<option value="">Select Line</option>
<option value="Line1">Line 1</option>
<option value="Line2">Line 2</option>
</select>
</div>

<div className="w-full md:w-1/3">
<label className="block text-white font-[poppins]">Bench</label>
<select
value={selectedBench}
onChange={(e) => setSelectedBench(e.target.value)}
className="border border-gray-300 rounded p-2 w-full mt-2"
>
<option value="">Select Bench</option>
<option value="Bench1">Bench 1</option>
<option value="Bench2">Bench 2</option>
</select>
</div>

<div className="w-full md:w-1/3">
<label className="block text-white font-[poppins]">NIC</label>
<select
value={selectedNIC}
onChange={(e) => setSelectedNIC(e.target.value)}
className="border border-gray-300 rounded p-2 w-full mt-2"
>
<option value="">Select NIC</option>
<option value="NIC1">NIC 1</option>
<option value="NIC2">NIC 2</option>
</select>
</div>

<div className="w-full md:w-auto flex space-x-2 mt-6">
<button
onClick={handleGenerateReport}
className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-all duration-200"
>
<i className="bx bx-cog text-lg"></i>
<span>Generate</span>
</button>

<button
onClick={handleExport}
className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-all duration-200"
>
<i className="bx bxs-file-export text-lg"></i>
<span>Export</span>
</button>
</div>
</div>
</div>

{notFoundMessage.visible && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
<h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
<p className="text-gray-800 mb-6">{notFoundMessage.message}</p>
<button
onClick={() => setNotFoundMessage({ visible: false, message: '' })}
className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
>
OK
</button>
</div>
</div>
)}

{showStageOne && finalMatchedParameters && (
<div className="mt-6">
<h2 className="text-2xl font-semibold text-green-700">
Report Found for {selectedLine} {selectedBench} {selectedNIC}
</h2>
{/* Render your Stage components here */}
</div>
)}
</>
)}
</div>
);
};

export default Production;
