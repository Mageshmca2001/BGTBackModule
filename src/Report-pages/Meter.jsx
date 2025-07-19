import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StageOneFunctionalTest from '../stagescom/FunctionaTest';
import StageTwoCalibrationTest from '../stagescom/CalibartionTest';
import StageThreeAccuracyTest from '../stagescom/AccuracyTest';
import StageFourNICTest from '../stagescom/NICTest';
import StageFiveFinaltest from '../stagescom/FinalTest';
import { toBinary } from '../utils/binary';

const API_BASE = import.meta.env.VITE_API;

const Meter = () => {
const [filteredData, setFilteredData] = useState([]);
const [functionalParameters, setFunctionalParameters] = useState([]);
const [functionalMatchedParameters, setFunctionalMatchedParameters] = useState(null);
const [CalibParameters, setCalibParameters] = useState([]);
const [CalibMatchedParameters, setCalibMatchedParameters] = useState(null);
const [AcParameters, setAcParameters] = useState([]);
const [AcMatchedParameters, setAcMatchedParameters] = useState(null);
const [NICParameters, setNICParameters] = useState([]);
const [NICMatchedParameters, setNICMatchedParameters] = useState(null);
const [FinalParameter, setFinalParameter] = useState(null);
const [FinalMatchedParameters, setFinalMatchedParameters] = useState(null);
const [serialNumber, setSerialNumber] = useState('');
const [dateTime, setDateTime] = useState(new Date());
const [notFoundMessage, setNotFoundMessage] = useState({ visible: false, message: '' });
const [stageOneCollapsed, setStageOneCollapsed] = useState(true);
const [stageTwoCollapsed, setStageTwoCollapsed] = useState(true);
const [stageThreeCollapsed, setStageThreeCollapsed] = useState(true);
const [stageFourCollapsed, setStageFourCollapsed] = useState(true);
const [stageFiveCollapsed, setStageFiveCollapsed] = useState(true);
const [loading, setLoading] = useState(false);
const [maintenanceMode, setMaintenanceMode] = useState(false);



const isExportDisabled = filteredData.length === 0;

const hardwareKeys = [
'LCD', 'LED', 'Relay', 'EEPROM', 'Flash', 'Scroll',
'Coveropen', 'Magnet', 'TerminalCoveropen', 'NIC_CoMM',
'Reverse', 'Neutral', 'NeutralDisturbance', 'Earth',
'RTC_Battery', 'Backup_Battery'
];

const fetchData = useCallback(async () => {
let isFunctionalOk = false;
let isCalibrationOk = false;
let isAccuracyOk = false;
let isNICOk = false;
let isFinalOk = false;

try {
const res = await axios.get(`${API_BASE}/user/Functional`);
if (Array.isArray(res.data?.users)) {
setFunctionalParameters(res.data.users);
isFunctionalOk = true;
}
} catch (err) {
console.error('❌ Functional API Error:', err);
}

try {
const res = await axios.get(`${API_BASE}/user/Calibration`);
if (Array.isArray(res.data?.users)) {
setCalibParameters(res.data.users);
isCalibrationOk = true;
}
} catch (err) {
console.error('❌ Calibration API Error:', err);
}

try {
const res = await axios.get(`${API_BASE}/user/Accuracy`);
if (Array.isArray(res.data?.users)) {
setAcParameters(res.data.users);
isAccuracyOk = true;
}
} catch (err) {
console.error('❌ Accuracy API Error:', err);
}

try {
const res = await axios.get(`${API_BASE}/user/NIC`);
if (Array.isArray(res.data?.users)) {
setNICParameters(res.data.users);
isNICOk = true;
}
} catch (err) {
console.error('❌ NIC API Error:', err);
}

try {
const res = await axios.get(`${API_BASE}/user/NIC`);
if (Array.isArray(res.data?.users)) {
setFinalParameter(res.data.users);
isFinalOk = true;
}
} catch (err) {
console.error('❌Final API Error:', err);
}


const allFailed = !isFunctionalOk && !isCalibrationOk && !isAccuracyOk && !isNICOk && !isFinalOk;
setMaintenanceMode(allFailed);
}, []);


useEffect(() => {
document.title = 'BGT - Meter Report';
const initFetch = async () => {
await fetchData();
};

initFetch();
const retryInterval = setInterval(() => {
if (maintenanceMode) {
fetchData();
}
}, 10000);

return () => clearInterval(retryInterval);
}, [fetchData, maintenanceMode]);

useEffect(() => {
const interval = setInterval(() => setDateTime(new Date()), 1000);
return () => clearInterval(interval);
}, []);

useEffect(() => {
if (!maintenanceMode) {
setSerialNumber('');
setFilteredData([]);
setFunctionalMatchedParameters(null);
setCalibMatchedParameters(null);
setAcMatchedParameters(null);
setNICMatchedParameters(null);
setFinalMatchedParameters(null);
}
}, [maintenanceMode]);

// Optional: Disable right click for UX security
useEffect(() => {
const handleContextMenu = (e) => e.preventDefault();
document.addEventListener('contextmenu', handleContextMenu);
return () => document.removeEventListener('contextmenu', handleContextMenu);
}, []);

const formattedDate = dateTime.toLocaleDateString('en-GB');
const formattedTime = dateTime.toLocaleTimeString();

const handleGenerateReport = () => {
let inputSN = serialNumber.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
if (!inputSN || inputSN.length < 5) {
alert('Please enter a valid serial number (min 5 alphanumeric characters).');
setNotFoundMessage({ visible: false, message: '' });
return;
}

setLoading(true);
setTimeout(() => {
const matched = functionalParameters.find(
(p) => p?.PCBSerialNumber?.trim().toLowerCase() === inputSN
);
const matchedcalib = CalibParameters.find(
(c) => c?.PCBSerialNumber?.trim().toLowerCase() === inputSN
);
const matchedAc = AcParameters.find(
(a) => a?.PCBSerialNo?.trim().toLowerCase() === inputSN
);
const matchedNIC = NICParameters.find(
(n) => n?.PCBSerialNumber?.trim().toLowerCase() === inputSN
);
const matchedFinal = FinalParameter.find(
(F) => F?.PCBSerialNumber?.trim().toLowerCase() === inputSN
);

const anyMatched = matched || matchedcalib || matchedAc || matchedNIC || matchedFinal;

if (anyMatched) {
setFunctionalMatchedParameters(matched || null);
setCalibMatchedParameters(matchedcalib || null);
setAcMatchedParameters(matchedAc || null);
setNICMatchedParameters(matchedNIC || null);
setFinalMatchedParameters(matchedFinal || null);
setFilteredData([matched, matchedcalib, matchedAc, matchedNIC,matchedFinal].filter(Boolean));
setNotFoundMessage({ visible: false, message: '' });
} else {
setFunctionalMatchedParameters(null);
setCalibMatchedParameters(null);
setAcMatchedParameters(null);
setNICMatchedParameters(null);
setAcMatchedParameters(null);
setFinalMatchedParameters(null);
setFilteredData([]);
setNotFoundMessage({ visible: true, message: 'Serial Number was not found in records.' });
}

setLoading(false);
}, 3000);
};

const handleExport = () => {
console.log('📤 Exporting data:', filteredData);
// TODO: Implement secure export logic
};

let binaryHardwareStatus = '';
let mappedHardwareParameters = {};

if (functionalMatchedParameters?.HardwareStatus) {
binaryHardwareStatus = toBinary(Number(functionalMatchedParameters.HardwareStatus));
hardwareKeys.forEach((key, index) => {
const bit = binaryHardwareStatus[binaryHardwareStatus.length - 1 - index];
mappedHardwareParameters[key] = bit === '1' ? 'OK' : 'NOT OK';
});
}

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
<div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
<h2 className="text-xl font-bold text-center text-red-600 mb-4 font-[poppins]">Error</h2>
<p className="text-gray-800 text-center font-[poppins]">{notFoundMessage.message}</p>
<div className="flex justify-center mt-4">
<button
onClick={() => setNotFoundMessage({ visible: false, message: '' })}
className="bg-primary text-white px-6 py-2 rounded hover:bg-gray-700 font-[poppins]"
>
OK
</button>
</div>
</div>
</div>
)}

{loading ? (
<div className="flex flex-col justify-center items-center py-16 animate-fadeIn">
<div className="relative">
<div className="w-16 h-16 rounded-full border-4 border-t-transparent border-b-transparent border-primary animate-spin"></div>
<div className="absolute inset-0 flex justify-center items-center">
<i className="bx bx-loader-alt text-4xl text-primary animate-pulse"></i>
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
{functionalMatchedParameters && (
<StageOneFunctionalTest
filteredData={filteredData}
FunctionalParameters={functionalMatchedParameters}
hardwareKeys={hardwareKeys}
mappedHardwareParameters={mappedHardwareParameters}
stageOneCollapsed={stageOneCollapsed}
setStageOneCollapsed={setStageOneCollapsed}
/>
)}

{CalibMatchedParameters && (
<StageTwoCalibrationTest
filteredData={filteredData}
CalibParameters={CalibMatchedParameters}
stageTwoCollapsed={stageTwoCollapsed}
setStageTwoCollapsed={setStageTwoCollapsed}
/>
)}

{AcMatchedParameters && (
<StageThreeAccuracyTest
filteredData={filteredData}
AcParameters={AcMatchedParameters}
stageThreeCollapsed={stageThreeCollapsed}
setStageThreeCollapsed={setStageThreeCollapsed}
/>
)}

{NICMatchedParameters && (
<StageFourNICTest
filteredData={filteredData}
NICParameters={NICMatchedParameters}
stageFourCollapsed={stageFourCollapsed}
setStageFourCollapsed={setStageFourCollapsed}
/>
)}

{FinalMatchedParameters && (
<StageFiveFinaltest
filteredData={filteredData}
FinalParameters={FinalMatchedParameters}
stageFiveCollapsed={stageFiveCollapsed}
setStageFiveCollapsed={setStageFiveCollapsed}
/>
)}
</>
)}
</div>

);
};

export default Meter;
