import { useState, useEffect } from 'react';
import axios from 'axios';
import StageOneFunctionalTest from '../stagescom/FunctionaTest';
import StageTwoCalibrationTest from '../stagescom/CalibartionTest';
import StageThreeAccuracyTest from '../stagescom/AccuracyTest';
import StagefourNicTest from '../stagescom/NICTest';
import StagefiveFinalTest from '../stagescom/FinalTest';
import { toBinary } from '../utils/binary';

const Meter = () => {
const [data, setData] = useState([]);
const [criticalParameters, setCriticalParameters] = useState({});
const [finalParameters, setFinalParameters] = useState([]);
const [finalMatchedParameters, setFinalMatchedParameters] = useState(null);
const [serialNumber, setSerialNumber] = useState('');
const [filteredData, setFilteredData] = useState([]);
const [dateTime, setDateTime] = useState(new Date());
const [notFoundMessage, setNotFoundMessage] = useState({ visible: false, message: '' });
const [showStageOne, setShowStageOne] = useState(false);
const [stageOneCollapsed, setStageOneCollapsed] = useState(true);
const [stageTwoCollapsed, setStageTwoCollapsed] = useState(true);
const [stageThreeCollapsed, setStageThreeCollapsed] = useState(true);
const [stagefourCollapsed, setStagefourCollapsed] = useState(true);
const [stagefiveCollapsed, setStagefiveCollapsed] = useState(true);

const hardwareKeys = [
'LCD', 'LED', 'Relay', 'EEPROM', 'Flash', 'Scroll',
'Coveropen', 'Magnet', 'TerminalCoveropen', 'NIC_CoMM',
'Reverse', 'Neutral', 'NeutralDisturbance', 'Earth',
'RTC_Battery', 'Backup_Battery'
];

useEffect(() => {
document.title = 'BGT - Meter Report';

const fetchData = async () => {
try {
const [dataRes, criticalRes, finalRes] = await Promise.all([
axios.get('http://192.168.29.50:7000/api/data'),
axios.get('http://192.168.29.50:7000/api/Criticalcomponents'),
axios.get('http://192.168.29.50:7000/api/finalparameters')
]);

setData(dataRes.data?.data || []);
setFilteredData(dataRes.data?.data || []);
setCriticalParameters(criticalRes.data?.criticalParameters?.[0] || {});
setFinalParameters(finalRes.data?.finalParameters || []);
} catch (error) {
console.error('❌ API Fetch Error:', error);
}
};

fetchData();
}, []);

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

const matched = finalParameters.find(p => p.SerialNo?.trim().toLowerCase() === inputSN);

if (matched) {
setFinalMatchedParameters(matched);
setShowStageOne(true);
setNotFoundMessage({ visible: false, message: '' });
} else {
setFinalMatchedParameters(null);
setShowStageOne(false);
setNotFoundMessage({ visible: true, message: 'Serial Number was not found in records.' });
}
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

return (
<div className="p-4 font-[poppins]">
<h1 className="text-3xl text-primary">Meter Reports</h1>

{/* Time and Date */}
<div className="flex justify-end space-x-2 items-center mt-4">
<p className="bg-primary text-white font-semibold w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Date: {formattedDate}
</p>
<p className="bg-primary text-white font-semibold w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Time: {formattedTime}
</p>
</div>

{/* Serial Number Input */}
<div className="bg-primary p-4 rounded shadow-md mt-4">
<div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
<div className="w-full md:w-auto">
<label htmlFor="serialInput" className="block text-xl text-white font-semibold">
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
<button
onClick={handleExport}
className="bg-green-600 text-white px-4 py-2 rounded mt-6 hover:bg-gray-400 w-full md:w-auto"
>
<i className="bx bxs-file-export mr-2"></i> Export
</button>
</div>
</div>
</div>

{/* Error Message Modal */}
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

{/* Show Test Stages */}
{showStageOne && finalMatchedParameters && (
<>
<StageOneFunctionalTest
filteredData={filteredData}
criticalParameters={criticalParameters}
finalParameters={finalMatchedParameters}
hardwareKeys={hardwareKeys}
mappedHardwareParameters={mappedHardwareParameters}
stageOneCollapsed={stageOneCollapsed}
setStageOneCollapsed={setStageOneCollapsed}
/>
<StageTwoCalibrationTest
filteredData={filteredData}
criticalParameters={criticalParameters}
finalParameters={finalMatchedParameters}
hardwareKeys={hardwareKeys}
mappedHardwareParameters={mappedHardwareParameters}
stageTwoCollapsed={stageTwoCollapsed}
setStageTwoCollapsed={setStageTwoCollapsed}
/>
<StageThreeAccuracyTest
filteredData={filteredData}
criticalParameters={criticalParameters}
finalParameters={finalMatchedParameters}
hardwareKeys={hardwareKeys}
mappedHardwareParameters={mappedHardwareParameters}
stageThreeCollapsed={stageThreeCollapsed}
setStageThreeCollapsed={setStageThreeCollapsed}
/>
<StagefourNicTest
filteredData={filteredData}
criticalParameters={criticalParameters}
finalParameters={finalMatchedParameters}
hardwareKeys={hardwareKeys}
mappedHardwareParameters={mappedHardwareParameters}
stagefourCollapsed={stagefourCollapsed}
setStagefourCollapsed={setStagefourCollapsed}
/>
<StagefiveFinalTest
filteredData={filteredData}
criticalParameters={criticalParameters}
finalParameters={finalMatchedParameters}
hardwareKeys={hardwareKeys}
mappedHardwareParameters={mappedHardwareParameters}
stagefiveCollapsed={stagefiveCollapsed}
setStagefiveCollapsed={setStagefiveCollapsed}
/>
</>
)}
</div>
);
};

export default Meter;
