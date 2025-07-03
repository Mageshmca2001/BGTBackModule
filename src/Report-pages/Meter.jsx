import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StageOneFunctionalTest from '../stagescom/FunctionaTest';
import StageTwoCalibrationTest from '../stagescom/CalibartionTest';
import { toBinary } from '../utils/binary';

const Meter = () => {
const [data, setData] = useState([]);
const [criticalParameters, setCriticalParameters] = useState({});
const [finalParameters, setFinalParameters] = useState([]);
const [finalMatchedParameters, setFinalMatchedParameters] = useState(null);
const [matchedCalibration, setMatchedCalibration] = useState(null);
const [serialNumber, setSerialNumber] = useState('');
const [filteredData, setFilteredData] = useState([]);
const [dateTime, setDateTime] = useState(new Date());
const [notFoundMessage, setNotFoundMessage] = useState({ visible: false, message: '' });
const [showStageOne, setShowStageOne] = useState(false);
const [stageOneCollapsed, setStageOneCollapsed] = useState(true);
const [stageTwoCollapsed, setStageTwoCollapsed] = useState(true);
const [calibrationData, setCalibrationData] = useState([]);
const [loading, setLoading] = useState(false);
const maintenanceMode = true;

const isExportDisabled = filteredData.length === 0;

const hardwareKeys = [
'LCD', 'LED', 'Relay', 'EEPROM', 'Flash', 'Scroll',
'Coveropen', 'Magnet', 'TerminalCoveropen', 'NIC_CoMM',
'Reverse', 'Neutral', 'NeutralDisturbance', 'Earth',
'RTC_Battery', 'Backup_Battery'
];

const fetchData = useCallback(async () => {
try {
const res = await axios.get('http://localhost:5000/user/parameters');
const responseData = res.data;
setData(responseData?.data || []);
setFilteredData(responseData?.data || []);
setCriticalParameters(responseData?.criticalParameters?.[0] || {});
setFinalParameters(responseData?.finalParameters || []);
setCalibrationData(responseData?.calibration || []);
} catch (error) {
console.error('❌ API Fetch Error:', error);
}
}, []);

useEffect(() => {
document.title = 'BGT - Meter Report';
if (!maintenanceMode) {
fetchData();
}
}, [fetchData, maintenanceMode]);

useEffect(() => {
const interval = setInterval(() => setDateTime(new Date()), 1000);
return () => clearInterval(interval);
}, []);

const formattedDate = dateTime.toLocaleDateString('en-GB');
const formattedTime = dateTime.toLocaleTimeString();

const handleGenerateReport = () => {
const inputSN = serialNumber.trim().toLowerCase();
if (!inputSN) {
alert('Please enter a serial number.');
setShowStageOne(false);
setNotFoundMessage({ visible: false, message: '' });
return;
}

setLoading(true);
setTimeout(() => {
const matched = finalParameters.find(p => p?.PCBSerialNumber?.trim().toLowerCase() === inputSN);
const matchedCalib = calibrationData.find(c => c?.PCBSerialNumber?.trim().toLowerCase() === inputSN);

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

setLoading(false);
}, 3000);
};

const handleExport = () => {
console.log('📤 Exporting data:', filteredData);
};

let binaryHardwareStatus = '';
let mappedHardwareParameters = {};

if (finalMatchedParameters?.HardwareStatus) {
binaryHardwareStatus = toBinary(Number(finalMatchedParameters.HardwareStatus));
hardwareKeys.forEach((key, index) => {
const bit = binaryHardwareStatus[binaryHardwareStatus.length - 1 - index];
mappedHardwareParameters[key] = bit === '1' ? 'OK' : 'NOT OK';
});
}

// === Maintenance Mode UI ===
if (maintenanceMode) {
return (
<div className="flex items-center justify-center min-h-[70vh] text-center">
<div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-8 rounded-lg shadow">
<h2 className="text-2xl font-semibold mb-2">⚠️ Currently Under Maintenance</h2>
<p className="text-gray-700">We are working to improve your experience. Please check back later.</p>
</div>
</div>
);
}

// === Main Page UI ===
return (
<div className="w-full overflow-x-hidden px-0 pb-10">
<h1 className="text-3xl font-[poppins] text-primary">Meters Reports</h1>

<div className="flex justify-end space-x-2 items-center mt-2">
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-[poppins] w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Time: {formattedTime}
</p>
</div>

<div className="bg-primary p-4 rounded shadow-md mt-4">
<div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
<div className="w-full md:w-auto">
<label htmlFor="serialInput" className="block text-base1 text-white font-[poppins]">
Enter Serial Number
</label>
<input
id="serialInput"
type="text"
className="border border-gray-300 rounded p-2 w-full sm:w-64 mt-3"
value={serialNumber}
onChange={(e) => setSerialNumber(e.target.value)}
placeholder="Enter Serial Number"
/>
</div>

<div className="flex-grow text-right w-full md:w-auto">
<button
onClick={handleGenerateReport}
className="bg-green-600 text-white px-4 py-2 rounded mt-6 hover:bg-gray-400 w-full md:w-auto mr-1"
>
<i className="bx bx-cog mr-2"></i> Generate
</button>
<span title={isExportDisabled ? 'Generate report first' : ''}>
<button
onClick={handleExport}
disabled={isExportDisabled}
className={`px-4 py-2 rounded mt-6 w-full md:w-auto ${
isExportDisabled
? 'bg-gray-400 cursor-not-allowed'
: 'bg-green-600 hover:bg-gray-400 text-white'
}`}
>
<i className="bx bxs-file-export mr-2"></i> Export
</button>
</span>
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
{loading ? (
<div className="flex flex-col justify-center items-center py-16 animate-fadeIn">
<div className="relative">
<div className="w-16 h-16 rounded-full border-4 border-t-transparent border-b-transparent border-primary animate-spin"></div>
<div className="absolute inset-0 flex justify-center items-center">
<i className='bx bx-loader-alt text-4xl text-primary animate-pulse'></i>
</div>
</div>
<p className="mt-4 text-lg text-primary font-[poppins] animate-pulse">
Loading Meter Serial report...
</p>
<p className="text-sm text-gray-400 font-[poppins] mt-1">
Please wait while we fetch the data.
</p>
</div>
) : (
<>
{showStageOne && finalMatchedParameters && (
<StageOneFunctionalTest
filteredData={filteredData}
criticalParameters={criticalParameters}
finalParameters={finalMatchedParameters}
hardwareKeys={hardwareKeys}
mappedHardwareParameters={mappedHardwareParameters}
stageOneCollapsed={stageOneCollapsed}
setStageOneCollapsed={setStageOneCollapsed}
/>
)}

{showStageOne && matchedCalibration && (
<StageTwoCalibrationTest
filteredData={filteredData}
calibrationData={matchedCalibration}
serialNumber={serialNumber}
stageTwoCollapsed={stageTwoCollapsed}
setStageTwoCollapsed={setStageTwoCollapsed}
/>
)}
</>
)}

</div>
);
};

export default Meter;
