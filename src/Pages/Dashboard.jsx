import { useState, useEffect, useMemo } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
LineElement,
PointElement,
ArcElement,
Title,
Tooltip,
Legend
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
// import ChatBot from './chatbot';
import StarCard from '../components/StarCard';
import StartCard1 from '../components/StartCardTotal'; // Assuming StartCard1 is for overall week/day total

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
ArcElement,
LineElement,
PointElement,
Title,
Tooltip,
Legend,
ChartDataLabels
);

import LoadingDots from '../components/Loading';

const API_BASE = import.meta.env.VITE_API || 'http://192.168.29.50:4000';

// Animation Variants
const containerVariants = {
hidden: {},
visible: {
transition: {
staggerChildren: 0.12,
delayChildren: 0.05
}
}
};

const itemVariants = {
hidden: { opacity: 0, y: 30 },
visible: {
opacity: 1,
y: 0,
transition: {
duration: 0.45,
ease: 'easeOut'
}
}
};

const extractShiftData = (dataSection) => {
const shifts = ['06-14', '14-22', '22-06'];
const testTypes = ['Functional', 'Calibration', 'Accuracy', 'NICComTest', 'FinalTest'];

return shifts.map((shift) => {
const shiftData = {
shift,
total: 0,
completed: 0,
functional: 0,
calibration: 0,
accuracy: 0,
nic: 0,
finalInit: 0
};

testTypes.forEach((type) => {
const testData = dataSection[type] || [];
const totalEntry = testData.find(e => e.Shift === shift && e.Status === 'Total');
const passEntry = testData.find(e => e.Shift === shift && e.Status === 'PASS');

const total = totalEntry?.MeterCount || 0;
const pass = passEntry?.MeterCount || 0;

shiftData.total += total;
shiftData.completed += pass;

// Ensure these are totals for the shift, not just passes
if (type === 'Functional') shiftData.functional += total;
if (type === 'Calibration') shiftData.calibration += total;
if (type === 'Accuracy') shiftData.accuracy += total;
if (type === 'NICComTest') shiftData.nic += total;
if (type === 'FinalTest') shiftData.finalInit += total;
});

return shiftData;
});
};

// NEW: Function to extract weekly data from /user/week endpoint
const extractWeeklyData = (weekData, startOfWeekDate) => {
// Corrected to match your JSON keys and `Final` test type
const testTypes = ['Functional', 'Calibration', 'Accuracy', 'NIC', 'Final'];

// Generate array of YYYY-MM-DD strings for the 7 days of the week
const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
const d = new Date(startOfWeekDate);
d.setDate(startOfWeekDate.getDate() + i);
return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
});

// Initialize daily breakdown for the week
const dailyCompleted = daysOfWeek.map((dateString) => ({
date: dateString,
total: 0,      // Sum of 'Total' meters for all types on this day
value: 0,      // Sum of 'PASS' meters for all types on this day (used for 'completed' in cards)
functional: 0, // Sum of 'Total' functional meters for this day
calibration: 0, // Sum of 'Total' calibration meters for this day
accuracy: 0,    // Sum of 'Total' accuracy meters for this day
nic: 0,         // Sum of 'Total' NIC meters for this day
finalInit: 0    // Sum of 'Total' final meters for this day
}));

// Process data for each test type
testTypes.forEach((testType) => {
const testData = weekData[testType] || []; // Get the array for the current testType

testData.forEach((entry) => {
const entryDate = entry.TestDate ? new Date(entry.TestDate).toISOString().split('T')[0] : null;

if (entryDate && daysOfWeek.includes(entryDate)) {
const dailyEntry = dailyCompleted.find(d => d.date === entryDate); // Find the correct day entry

if (dailyEntry) {
const meterCount = entry['Meter Count'] || 0;

if (entry.Status === 'Total') {
dailyEntry.total += meterCount; // Accumulate total meters for the day
// Accumulate total meters for specific test types (for breakdown)
if (testType === 'Functional') dailyEntry.functional += meterCount;
else if (testType === 'Calibration') dailyEntry.calibration += meterCount;
else if (testType === 'Accuracy') dailyEntry.accuracy += meterCount;
else if (testType === 'NIC') dailyEntry.nic += meterCount;
else if (testType === 'Final') dailyEntry.finalInit += meterCount;
}
if (entry.Status === 'PASS') {
dailyEntry.value += meterCount; // Accumulate completed (PASS) meters for the day
}
}
}
});
});

// Calculate overall weekly totals from the daily breakdown
const weeklyTotals = {
total: dailyCompleted.reduce((sum, day) => sum + day.total, 0),
completed: dailyCompleted.reduce((sum, day) => sum + day.value, 0),
functional: dailyCompleted.reduce((sum, day) => sum + day.functional, 0),
calibration: dailyCompleted.reduce((sum, day) => sum + day.calibration, 0),
accuracy: dailyCompleted.reduce((sum, day) => sum + day.accuracy, 0),
nic: dailyCompleted.reduce((sum, day) => sum + day.nic, 0),
finalInit: dailyCompleted.reduce((sum, day) => sum + day.finalInit, 0)
};

return {
...weeklyTotals,
dailyCompleted // This now holds correctly calculated daily totals, completed, and type breakdowns
};
};




const calculateDayTotalsFromShifts = (shiftCards) => {
return shiftCards.reduce(
(acc, shift) => {
acc.total += shift.total;
acc.completed += shift.completed;
acc.functional += shift.functional;
acc.calibration += shift.calibration;
acc.accuracy += shift.accuracy;
acc.nic += shift.nic;
acc.finalInit += shift.finalInit;
return acc;
},
{
total: 0,
completed: 0,
functional: 0,
calibration: 0,
accuracy: 0,
nic: 0,
finalInit: 0,
}
);
};

const Dashboard = () => {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedRange, setSelectedRange] = useState('Day');
const [currentDate, setCurrentDate] = useState(new Date());
const [redLineValue, setRedLineValue] = useState(1000);
const [lastUpdated, setLastUpdated] = useState(null);
const [refreshKey, setRefreshKey] = useState(0);
const [selectedShift, setSelectedShift] = useState('All');

const formattedDate = currentDate.toLocaleDateString('en-GB');
const formattedTime = currentDate.toLocaleTimeString();
const formattedLastUpdate = lastUpdated
? `${lastUpdated.toLocaleDateString('en-GB')}, ${lastUpdated.toLocaleTimeString()}`
: 'Fetching...';

useEffect(() => {
const interval = setInterval(() => setCurrentDate(new Date()), 1000);
return () => clearInterval(interval);
}, []);

useEffect(() => {


const fetchData = async () => {
try {
setLastUpdated(new Date());

// Fetch all required APIs in parallel
const [countRes, presentWeekRes, previousWeekRes, hourlyRes] = await Promise.all([
fetch(`${API_BASE}/user/count`),
fetch(`${API_BASE}/user/week`),
fetch(`${API_BASE}/user/week?previous=true`),
fetch(`${API_BASE}/user/hourly`),
]);

if (!countRes.ok || !presentWeekRes.ok || !hourlyRes.ok)
throw new Error("Failed to fetch one or more datasets");

const countJson = await countRes.json();
const presentWeekJson = await presentWeekRes.json();
const previousWeekJson = previousWeekRes.ok ? await previousWeekRes.json() : null;
const hourlyJson = await hourlyRes.json();


// Data assignment
const dailyData = countJson.data;
const rawPresentWeekData = presentWeekJson.data.currentWeek;
const rawPreviousWeekData = previousWeekJson?.data?.previousWeek || {
Functional: [],
Calibration: [],
Accuracy: [],
NIC: [],
Final: []
};

const testTypes = ['Functional', 'Calibration', 'Accuracy', 'NIC', 'FinalTest'];

const hours = [
'06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00',
'14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00',
'22:00','23:00','00:00','01:00','02:00','03:00','04:00','05:00',
'6.00'
];

const getTotalCount = (map, time, testType) =>
map[time]?.[testType]?.total || 0;

const getPassCount = (map, time, testType) =>
map[time]?.[testType]?.pass || 0;

const processHourlyData = (rawData) => {
const map = {};
testTypes.forEach(testType => {
const data = rawData[testType] || [];
data.forEach(entry => {
const [start] = entry.TimeSlot?.split('-') || [];
if (!start) return;

if (!map[start]) map[start] = {};
if (!map[start][testType]) map[start][testType] = { total: 0, pass: 0 };

if (entry.Status === 'Total') {
map[start][testType].total = entry.MeterCount || 0;
} else if (entry.Status === 'PASS') {
map[start][testType].pass = entry.MeterCount || 0;
}
});
});
return map;
};

const buildHourlyDetails = (map) => {
return hours.map(time => {
const totals = {};
let completedSum = 0;

testTypes.forEach(testType => {
const total = getTotalCount(map, time, testType);
const pass = getPassCount(map, time, testType);
totals[testType] = total;
completedSum += pass;
});

return {
time,
...totals,
completed: completedSum
};
});
};




// ✅ MAIN EXECUTION (replace `hourlyJson` with your actual API response)
// Converts raw API format to usable map format
const hourlyMapCurrent = processHourlyData(hourlyJson.data?.current?.fullData || {});
const hourlyMapPrevious = processHourlyData(hourlyJson.data?.previous?.fullData || {});

const hourlyDetailsCurrent = buildHourlyDetails(hourlyMapCurrent);
const hourlyDetailsPrevious = buildHourlyDetails(hourlyMapPrevious);




// ✅ You can now use these values in state or dashboard cards
console.log('Hourly Details (Present):', hourlyDetailsCurrent);
console.log('Hourly Details (Previous):', hourlyDetailsPrevious);


// Compute weekly date ranges
const today = new Date();
const startOfPresentWeek = new Date(today);
startOfPresentWeek.setDate(today.getDate() - today.getDay());
const startOfPreviousWeek = new Date(startOfPresentWeek);
startOfPreviousWeek.setDate(startOfPresentWeek.getDate() - 7);

// Extract shifts
const presentShiftCards = extractShiftData(dailyData.today);
const previousShiftCards = extractShiftData(dailyData.yesterday);

// Prepare final structured result
const result = {
presentDay: {
...calculateDayTotalsFromShifts(presentShiftCards),
shift1: presentShiftCards[0],
shift2: presentShiftCards[1],
shift3: presentShiftCards[2],
shiftCards: presentShiftCards,


},
previousDay: {
...calculateDayTotalsFromShifts(previousShiftCards),
shift1: previousShiftCards[0],
shift2: previousShiftCards[1],
shift3: previousShiftCards[2],
shiftCards: previousShiftCards,


},


presentWeek: extractWeeklyData(rawPresentWeekData, startOfPresentWeek),
previousWeek: extractWeeklyData(rawPreviousWeekData, startOfPreviousWeek),

hourlyDetails:{
current: hourlyDetailsCurrent,
previous: hourlyDetailsPrevious
},

};

setData(result);
setRefreshKey(prev => prev + 1);
setError(null);
} catch (err) {
console.error('Fetch error:', err);
setError(err.message);
} finally {
setLoading(false);
}
};

fetchData();

const now = new Date();
const delayToNext5Min =
(5 - (now.getMinutes() % 5)) * 60 * 1000 -
now.getSeconds() * 1000 -
now.getMilliseconds();

const timeoutId = setTimeout(() => {
fetchData(); // align first update
const intervalId = setInterval(fetchData, 5 * 60 * 1000); // 🔁 Every 5 min after that

// Store on cleanup
cleanupFns.current.push(() => clearInterval(intervalId));
}, delayToNext5Min);

const cleanupFns = { current: [] }; // track all timers for clean unmount

// ⛔ Cleanup on unmount
return () => {
clearTimeout(timeoutId);
cleanupFns.current.forEach(fn => fn());
};
}, []);

const filteredHourlyDetails = useMemo(() => {
if (!data?.hourlyDetails) return [];

let hourlyData = [];

if (selectedRange === 'Day') {
hourlyData = data.hourlyDetails.current || [];
} else if (selectedRange === 'Previous Day') {
hourlyData = data.hourlyDetails.previous || [];
} else {
return []; // only apply filtering for day-based views
}

if (selectedShift === 'All') return hourlyData;

// Shift 1: 06:00 - <14:00
if (selectedShift === 'Shift1') {
return hourlyData.filter(item => item.time >= '06:00' && item.time < '14:00');
}

// Shift 2: 14:00 - <22:00
if (selectedShift === 'Shift2') {
return hourlyData.filter(item => item.time >= '14:00' && item.time < '22:00');
}

// Shift 3: 22:00 - <06:00 (wraps around midnight)
if (selectedShift === 'Shift3') {
return hourlyData.filter(item => item.time >= '22:00' || item.time < '06:00');
}

return hourlyData;
}, [data, selectedRange, selectedShift]);


// This array defines the breakdown fields for both chart and summary.
// Ensure 'FinalTest' is used here to match what you want to display for Final.
const breakdownFields = ['Functional', 'Calibration', 'Accuracy', 'NIC', 'FinalTest'];

const getDailyReportTitle = () => {
switch (selectedRange) {
case 'Day':
return 'Today Reports';
case 'Previous Day':
return 'Yesterday Reports';
case 'Present Week':
return 'Weekly Reports';
case 'Previous Week':
return 'Previous Weekly Reports';
default:
return 'Daily Reports';
}
};


const shiftTimes = {
Shift1: { start: '06:00', end: '14:00' },
Shift2: { start: '14:00', end: '22:00' },
Shift3: { start: '22:00', end: '06:00' },
};

// Utility: Check if time is in selected shift
const isTimeInShift = (time, shift) => {
if (shift === 'All') return true;

const [hour, minute] = time.split(':').map(Number);
const timeInMinutes = hour * 60 + minute;

const { start, end } = shiftTimes[shift];
const [startHour, startMinute] = start.split(':').map(Number);
const startInMinutes = startHour * 60 + startMinute;
const [endHour, endMinute] = end.split(':').map(Number);
const endInMinutes = endHour * 60 + endMinute;

if (startInMinutes < endInMinutes) {
return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
} else {
// Wraps around midnight
return timeInMinutes >= startInMinutes || timeInMinutes < endInMinutes;
}
};

const labels = ['Present Week', 'Previous Week'].includes(selectedRange)
? (
data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
?.dailyCompleted?.map((d) =>
new Date(d.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short' })
) || []
)
: (() => {
const shiftFiltered = filteredHourlyDetails.filter((item) =>
isTimeInShift(item.time, selectedShift)
);

const hours = selectedShift === 'All'
? shiftFiltered
: shiftFiltered;

return hours.map((item, i) => {
const current = item.time;
const next = hours[i + 1]?.time;

if (!next) {
if (selectedShift === 'Shift1') return `${current} - 14:00`;
if (selectedShift === 'Shift2') return `${current} - 22:00`;
if (selectedShift === 'Shift3') return `${current} - 06:00`;
return null;
}

return `${current} - ${next}`;
}).filter(Boolean);
})();


const completedData =
['Present Week', 'Previous Week'].includes(selectedRange)
? (
data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
?.dailyCompleted?.map((d) => d.value) || []
)
: filteredHourlyDetails
.filter(item => isTimeInShift(item.time, selectedShift))
.map(item => item.completed || 0);


// Enhanced breakdown data for weekly view and hourly view

const breakdownData =
['Present Week', 'Previous Week'].includes(selectedRange)
? (() => {
const weekData =
data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek'];
if (!weekData?.dailyCompleted) return {};

return {
Functional: weekData.dailyCompleted.map((d) => d.functional || 0),
Calibration: weekData.dailyCompleted.map((d) => d.calibration || 0),
Accuracy: weekData.dailyCompleted.map((d) => d.accuracy || 0),
NIC: weekData.dailyCompleted.map((d) => d.nic || 0),
FinalTest: weekData.dailyCompleted.map((d) => d.finalInit || 0),
};
})()
: (() => {
const shiftFiltered = filteredHourlyDetails.filter(item =>
isTimeInShift(item.time, selectedShift)
);

return {
Functional: shiftFiltered.map((item) => item.Functional || 0),
Calibration: shiftFiltered.map((item) => item.Calibration || 0),
Accuracy: shiftFiltered.map((item) => item.Accuracy || 0),
NIC: shiftFiltered.map((item) => item.NIC || 0),
FinalTest: shiftFiltered.map((item) => item.FinalTest || 0),
};
})();


const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const datasets = [
// Static 'Completed' dataset
{
label: 'Completed',
data: completedData,
backgroundColor: 'rgba(34, 197, 94, 0.7)', // Green
borderColor: 'rgba(22, 163, 74, 1)',
borderWidth: 1,
barThickness: 18,
barPercentage: 0.7,
categoryPercentage: 0.9,   // controls spacing between bars in the same group
borderRadius: 0,
},

// Dynamically mapped breakdown bars
...breakdownFields.map((key, i) => ({
label: key,
data: breakdownData[key] || [],
backgroundColor: colors[i],
borderColor: colors[i],
borderWidth: 1,
barThickness: 18,
barPercentage: 0.7,
categoryPercentage: 0.9,
borderRadius: 0,
})),


// Tracking line
{
label: 'Tracking Line',
data: completedData,
borderColor: 'rgba(59, 130, 246, 1)', // Blue
backgroundColor: 'transparent',
borderWidth: 2,
pointRadius: 3,
tension: 0.3,
type: 'line',
},

// Threshold line
{
label: 'Threshold',
data: Array(completedData.length).fill(redLineValue),
borderColor: 'rgba(239, 68, 68, 1)', // Red
borderWidth: 2,
borderDash: [5, 5],
pointRadius: 0,
fill: false,
type: 'line',
},
];


const firstFieldPieData = useMemo(() => {
let report = { passed: 0, failed: 0 };

if (selectedRange === 'Day') {
report = {
passed: data?.presentDay?.completed || 0,
failed: (data?.presentDay?.total || 0) - (data?.presentDay?.completed || 0),
reworked: data?.dailyReport?.reworked || 0 // Use dailyReport for reworked if available
};
} else if (selectedRange === 'Previous Day') {
report = {
passed: data?.previousDay?.completed || 0,
failed: (data?.previousDay?.total || 0) - (data?.previousDay?.completed || 0),
reworked: 0 // Assuming reworked not available for previous day in provided structure
};
} else if (selectedRange === 'Present Week') {
const weekData = data?.presentWeek;
if (weekData) {
report = {
passed: weekData.completed || 0,
failed: (weekData.total || 0) - (weekData.completed || 0),
reworked: 0, // Assuming reworked is not directly calculated from week data
};
}
} else if (selectedRange === 'Previous Week') {
const weekData = data?.previousWeek;
if (weekData) {
report = {
passed: weekData.completed || 0,
failed: (weekData.total || 0) - (weekData.completed || 0),
reworked: 0,
};
}
}

return {
labels: ['passed', 'failed'],
datasets: [{
data: [report.passed, report.failed],
backgroundColor: ['rgba(11, 190, 77, 0.7)', '#EF4444'],
borderColor: '#fff',
borderWidth: 2,
hoverOffset: 10,
}]
};
}, [data, selectedRange]);


const firstFieldPieOptions = {
responsive: true,
maintainAspectRatio: true,
plugins: {
datalabels: {
display: (ctx) => {
const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
const value = ctx.dataset.data[ctx.dataIndex];
return total > 0 && (value / total) * 100 >= 5;
},
formatter: (value, context) => {
const total = context.dataset.data.reduce((a, b) => a + b, 0);
const percent = total ? (value / total) * 100 : 0;
return `${percent.toFixed(0)}%`;
},
color: '#fff',
font: { weight: 'bold', size: 14, family: 'Poppins' },
anchor: 'center',
align: 'center',
},
legend: {
position: 'bottom',
labels: {
font: { family: 'Poppins', size: 13 },
color: '#4B5563',
usePointStyle: true,
pointStyle: 'rectRounded',
},
},
tooltip: {
titleFont: { family: 'Poppins', size: 14, weight: 'bold' },
bodyFont: { family: 'Poppins', size: 13 },
callbacks: {
label: function (ctx) {
const label = ctx.label;
const value = ctx.formattedValue;
return `${label}: ${value}`;
}
}
},
}
};

const dailyReportPieData = useMemo(() => {
let report = { passed: 0, failed: 0, reworked: 0 };

if (selectedRange === 'Day') {
report = {
passed: data?.presentDay?.completed || 0,
failed: (data?.presentDay?.total || 0) - (data?.presentDay?.completed || 0),
reworked: data?.dailyReport?.reworked || 0 // Use dailyReport for reworked if available
};
} else if (selectedRange === 'Previous Day') {
report = {
passed: data?.previousDay?.completed || 0,
failed: (data?.previousDay?.total || 0) - (data?.previousDay?.completed || 0),
reworked: 0 // Assuming reworked not available for previous day in provided structure
};
} else if (selectedRange === 'Present Week') {
const weekData = data?.presentWeek;
if (weekData) {
report = {
passed: weekData.completed || 0,
failed: (weekData.total || 0) - (weekData.completed || 0),
reworked: 0, // Assuming reworked is not directly calculated from week data
};
}
} else if (selectedRange === 'Previous Week') {
const weekData = data?.previousWeek;
if (weekData) {
report = {
passed: weekData.completed || 0,
failed: (weekData.total || 0) - (weekData.completed || 0),
reworked: 0,
};
}
}

return {
labels: ['passed', 'failed', 'reworked'],
datasets: [{
data: [report.passed, report.failed, report.reworked],
backgroundColor: ['rgba(11, 190, 77, 0.7)', '#EF4444', '#317ff5ff'],
borderColor: '#fff',
borderWidth: 2,
hoverOffset: 10,
}]
};
}, [data, selectedRange]);

const dailyReportPieOptions = {
responsive: true,
maintainAspectRatio: true,
plugins: {
datalabels: {
display: (ctx) => {
const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
const value = ctx.dataset.data[ctx.dataIndex];
return total > 0 && (value / total) * 100 >= 5;
},
formatter: (value, context) => {
const total = context.dataset.data.reduce((a, b) => a + b, 0);
const percent = total ? (value / total) * 100 : 0;
return `${percent.toFixed(0)}%`;
},
color: '#fff',
font: { weight: 'bold', size: 14, family: 'Poppins' },
anchor: 'center',
align: 'center',
},
legend: {
position: 'bottom',
labels: {
font: { family: 'Poppins', size: 13 },
color: '#4B5563',
usePointStyle: true,
pointStyle: 'rectRounded',
},
},
tooltip: {
titleFont: { family: 'Poppins', size: 14, weight: 'bold' },
bodyFont: { family: 'Poppins', size: 13 },
callbacks: {
label: function (ctx) {
const label = ctx.label;
const value = ctx.formattedValue;
return `${label}: ${value}`;
}
}
},
}
};

const [visibleDatasets, setVisibleDatasets] = useState({
Completed: true,
Functional: true,
Calibration: true,
Accuracy: true,
NIC: true,
FinalTest: true,
});

const toggleDataset = (label) => {
setVisibleDatasets((prev) => ({
...prev,
[label]: !prev[label],
}));
};

const filteredDatasets = useMemo(() => {
return datasets.filter((ds) => visibleDatasets[ds.label] !== false);
}, [datasets, visibleDatasets]);

const fieldKeyMap = {
Functional: 'functional',
Calibration: 'calibration',
Accuracy: 'accuracy',
NIC: 'nic',
FinalTest: 'finalInit', // Use your backend's correct key
};

// Error or Loading
if (loading) return <LoadingDots />;
if (error) return <div className="text-center text-red-600 mt-10 font-semibold font-poppins">Error: {error}</div>;

return (
<>
<main className="flex-1 px-2 sm:px-4 md:px-2 pb-8 overflow-x-hidden font-poppins">
<div className="flex flex-col sm:flex-row justify-between sm:items-end p-2 mb-4 gap-4">
<div>
<h1 className="text-2xl sm:text-3xl text-primary">Dashboard</h1>
<div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-end">
<select
value={selectedRange}
onChange={(e) => setSelectedRange(e.target.value)}
className="border border-gray-300 rounded-lg px-3 py-2 text-base w-full sm:w-38"
>
<option value="Day">Present Day</option>
<option value="Previous Day">Previous Day</option>
<option value="Present Week">Present Week</option>
<option value="Previous Week">Previous Week</option>
</select>

<div className="flex flex-col w-full sm:w-auto">
<label className="text-sm font-medium text-gray-700 mb-1">Threshold Point</label>
<input
type="number"
value={redLineValue}
onChange={(e) => setRedLineValue(Number(e.target.value))}
className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-32 text-sm"
/>
</div>
</div>
</div>
<div className="flex flex-col sm:flex-row gap-2">
<div className="bg-primary text-white px-4 py-2 rounded-lg shadow text-center">
Date: {formattedDate}
</div>
<div className="bg-primary text-white px-4 py-2 rounded-lg shadow text-center">
Time: {formattedTime}
</div>
<div className="bg-primary text-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow text-center min-w-[200px]">
Last Update: {formattedLastUpdate}
</div>
</div>
</div>

<section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
<AnimatePresence mode="wait">
<motion.div
key={`${selectedRange}-${refreshKey}`}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.4 }}
>
{/* Present Day & Previous Day cards */}
{(selectedRange === 'Day' || selectedRange === 'Previous Day') && (
<motion.div
variants={containerVariants}
initial="hidden"
animate="visible"
exit="hidden"
className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
>
<motion.div variants={itemVariants}>
<StartCard1
total={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.total || 0}
completed={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.completed || 0}
functional={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.functional || 0}
calibration={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.calibration || 0}
accuracy={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.accuracy || 0}
nic={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.nic || 0}
finalInit={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.finalInit || 0}
bgColor="from-sky-400 to-sky-600"
icon="calendar"
title={selectedRange}
/>
</motion.div>

{data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.shiftCards?.map((shift, i) => (
<motion.div key={i} variants={itemVariants}>
<StarCard
total={shift.total}
completed={shift.completed}
functional={shift.functional}
calibration={shift.calibration}
accuracy={shift.accuracy}
nic={shift.nic}
finalInit={shift.finalInit}
bgColor={["from-purple-400 to-purple-600", "from-yellow-400 to-yellow-600", "from-indigo-400 to-indigo-600"][i]}
icon={["calendar", "calendar", "calendar"][i]}
title={`Shift ${i + 1}`}
/>
</motion.div>
))}
</motion.div>
)}

{/* Present Week & Previous Week cards */}
{(selectedRange === 'Present Week' || selectedRange === 'Previous Week') && (
<motion.div
variants={containerVariants}
initial="hidden"
animate="visible"
exit="hidden"
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
>
{/* Overall Week Card */}
<motion.div variants={itemVariants}>
<StartCard1
total={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.total || 0}
completed={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.completed || 0}
functional={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.functional || 0}
calibration={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.calibration || 0}
accuracy={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.accuracy || 0}
nic={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.nic || 0}
finalInit={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.finalInit || 0}
bgColor="from-cyan-500 to-blue-500"
icon="calendarWeek"
title={selectedRange}
disableHover
/>
</motion.div>

{/* Daily Cards within the Week */}
{data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.dailyCompleted?.map((item, i) => {
const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const colors = [
"from-teal-400 to-teal-600", "from-purple-400 to-purple-600", "from-rose-400 to-rose-600",
"from-indigo-400 to-indigo-600", "from-yellow-400 to-yellow-600", "from-pink-400 to-pink-600", "from-blue-400 to-blue-600"
];
const dateObj = new Date(item.date);
const dayName = labels[dateObj.getDay()];
const dayDate = dateObj.toLocaleDateString('en-GB', {
day: '2-digit',
month: 'short',
year: 'numeric' // <-- added year
});

return (
<motion.div key={i} variants={itemVariants}>
<StarCard
total={item.total} // Pass the daily total (sum of all 'Total' statuses for the day)
completed={item.value} // Pass the daily completed (sum of all 'PASS' statuses for the day)
functional={item.functional} // Pass daily functional total
calibration={item.calibration} // Pass daily calibration total
accuracy={item.accuracy} // Pass daily accuracy total
nic={item.nic} // Pass daily NIC total
finalInit={item.finalInit} // Pass daily finalInit total
bgColor={colors[i % colors.length]}
icon="calendar"
title={`${dayDate} - ${dayName}`}
disableHover
/>
</motion.div>
);
})}
</motion.div>
)}
</motion.div>
</AnimatePresence>
</section>

<section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-4 font-poppins">
<h2 className="text-xl sm:text-2xl font-bold text-center text-gray-700 mb-4 sm:mb-6">
Meter Analysis Dashboard
</h2>

{/* 📌 Custom Legend Block with Toggle */}
<div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700 mb-4">
{[
{ label: 'Completed', color: 'bg-green-400', border: 'border-green-600' },
{ label: 'Functional', color: 'bg-blue-500' },
{ label: 'Calibration', color: 'bg-orange-400' },
{ label: 'Accuracy', color: 'bg-emerald-500' },
{ label: 'NIC', color: 'bg-red-500' },
{ label: 'FinalTest', color: 'bg-purple-500' }, // Label for Final
].map(({ label, color, border }) => (
<div
key={label}
onClick={() => toggleDataset(label)}
className="flex items-center gap-2 cursor-pointer"
>
<span
className={`w-4 h-3 rounded-sm ${color} ${border || ''
} border ${visibleDatasets[label] ? '' : '!bg-gray-200 !border-gray-400'}`}
></span>
<span className={`${visibleDatasets[label] ? '' : 'text-gray-400 line-through'}`}>
{label}
</span>
</div>
))}
{/* Static lines for Tracking & Threshold */}
<div className="flex items-center gap-2">
<span className="w-4 h-0.5 border border-blue-500"></span> Tracking Line
</div>
<div className="flex items-center gap-2">
<span className="w-4 h-0.5 border border-red-500 border-dashed"></span> Threshold
</div>
</div>

<div className="grid grid-cols-1 gap-4 sm:gap-6">
<div className="relative flex flex-col sm:flex-row justify-center items-center gap-2 mb-4">
<h3 className="text-base sm:text-lg font-semibold text-primary text-center sm:text-left">
{['Present Week', 'Previous Week'].includes(selectedRange)
? 'Weekly Progress: '
: 'Hourly Progress: '}
<span className="inline-block text-primary break-words text-sm sm:text-base">
[Completed, Functional, Calibration & Accuracy, NIC, FinalTest]
</span>
</h3>

{(selectedRange === 'Day' || selectedRange === 'Previous Day') && (
<div className="sm:absolute sm:right-0 w-full sm:w-auto">
<select
value={selectedShift}
onChange={(e) => setSelectedShift(e.target.value)}
className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-primary shadow w-full sm:w-auto"
>
<option value="All">All Shifts</option>
<option value="Shift1">06:00 - 14:00</option>
<option value="Shift2">14:00 - 22:00</option>
<option value="Shift3">22:00 - 06:00</option>
</select>
</div>
)}

</div>

<motion.div
key={`${selectedRange}-chart-${refreshKey}`}
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.4 }}
>
<div className="w-full overflow-x-auto pb-4">
<div
className="h-[300px]"
style={{
minWidth: `${Math.max(labels.length * 140, 1000)}px`,
}}
>
<Bar
data={{ labels, datasets: filteredDatasets }}
options={{
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: { display: false },
tooltip: {
enabled: true,
mode: 'index',
intersect: false,
callbacks: {
label: function (context) {
const label = context.dataset.label || '';
const value = context.parsed.y;
if (label === 'Tracking Line') return '';
if (label === 'Threshold') return `🔴 ${label}: ${value}`;
if (label === 'Completed') return `🟢 ${label}: ${value}`;
return `${label}: ${value}`;
},
},
titleFont: { family: 'Poppins', size: 14, weight: 'bold' },
bodyFont: { family: 'Poppins', size: 13 },
backgroundColor: 'rgba(255, 255, 255, 0.95)',
titleColor: '#111827',
bodyColor: '#1F2937',
borderColor: '#E5E7EB',
borderWidth: 1,
padding: 10,
cornerRadius: 8,
boxPadding: 4,
},
datalabels: { display: false },
},
interaction: {
mode: 'index',
intersect: false,
},
scales: {
x: {
stacked: false,
ticks: {
autoSkip: false,
font: { family: 'Poppins', size: 12 },
},
grid: { display: false },
},
y: {
beginAtZero: true,
suggestedMax: redLineValue + 500,
ticks: {
stepSize: 200,
font: { family: 'Poppins' },
},
grid: { drawBorder: false },
},
},
}}
/>
</div>
</div>
</motion.div>
</div>
</section>




<section className='bg-white rounded-2xl shadow-lg p-6 mt-6 font-poppins'>
<motion.div>
<h3 className="text-2xl font-semibold text-primary text-center mb-8">
Total Summary
</h3>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center justify-center">

{/* ✅ Completed Total */}
<div className="bg-white shadow rounded-lg p-4 border border-gray-200">
<div className="text-sm font-medium text-gray-600">Completed</div>
<div className="text-xl font-bold text-green-600">
{['Present Week', 'Previous Week'].includes(selectedRange)
? (
  data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
    ?.dailyCompleted?.reduce((sum, day) => sum + (day.value || 0), 0) || 0
)
: filteredHourlyDetails.reduce((sum, item) => sum + (item.completed || 0), 0)}
</div>
</div>

{/* ✅ Functional to FinalTest Totals */}
{breakdownFields.map((field, index) => {
const backendKey = fieldKeyMap[field];

const total = ['Present Week', 'Previous Week'].includes(selectedRange)
? (
data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
  ?.dailyCompleted?.reduce((sum, day) => sum + (day[backendKey] || 0), 0) || 0
)
: (
filteredHourlyDetails.reduce((sum, item) => sum + (item[field] || 0), 0)
);

return (
<div key={field} className="bg-white shadow rounded-lg p-4 border border-gray-200">
<div className="text-sm font-medium text-gray-600">{field}</div>
<div className="text-xl font-bold" style={{ color: colors[index] }}>{total}</div>
</div>
);
})}
</div>
</motion.div>
</section>




<section className="bg-white rounded-2xl shadow-lg p-6 mt-6 font-poppins">
<h2 className="text-2xl font-bold text-center text-primary mb-8">First Yield & {getDailyReportTitle()}</h2>

<motion.div
key={`dualPie-${refreshKey}`}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="grid grid-cols-1 md:grid-cols-2 gap-6"
>

{/* First Yield Report Box */}
<div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col sm:flex-row-reverse items-center sm:items-center gap-6">

{/* Pie Chart on Right with Heading Inside */}
<div className="flex flex-col items-center w-[280px]">
<h3 className="text-lg font-semibold text-primary mb-4">First Yield Report</h3>
<div className="relative w-[280px] h-[280px]">
<Pie data={firstFieldPieData} options={firstFieldPieOptions} plugins={[ChartDataLabels]} />
</div>
</div>

{/* Total Tested on Left */}
<div className="flex-1 w-full sm:w-auto">
<div className="grid grid-cols gap-4 text-center">
<div className="bg-white border rounded px-2 p-4 shadow">
<div className="text-sm text-gray-600">Total Tested</div>
<div className="text-xl font-bold text-blue-600">
{((
(firstFieldPieData.datasets[0].data?.[0] ?? 0) +
(firstFieldPieData.datasets[0].data?.[1] ?? 0)
).toFixed(0))}
</div>
</div>
</div>
</div>
</div>



{/* Daily Report Box */}
<div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-center">
<h3 className="text-lg font-semibold text-primary mb-4">
{getDailyReportTitle()}
</h3>
<div className="relative w-[280px] h-[280px]">
<Pie data={dailyReportPieData} options={dailyReportPieOptions} plugins={[ChartDataLabels]} />
</div>
</div>
</motion.div>
</section>

<section className="bg-white rounded-2xl shadow-lg p-6 mt-6 font-poppins">

{/* 🔢 Total Summary Breakdown Section */}


{/* 📊 Total Summary Pie Chart Section */}
<motion.div>
<h3 className="text-2xl font-semibold text-primary text-center mt-12 mb-8">Total Summary Pie Chart</h3>

{/* 🟢 First Yield Report Totals */}
<div className="mb-6">
<h2 className="text-base4 font-bold text-left text-primary mb-6">
First Yield & {getDailyReportTitle()}
</h2>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
{/* Passed */}
<div className="bg-white border rounded p-4 shadow">
<div className="text-sm text-gray-600">Passed</div>
<div className="text-xl font-bold text-green-600">
{firstFieldPieData.datasets[0].data?.[0]?.toFixed(0) ?? 0}
</div>
</div>

{/* Failed */}
<div className="bg-white border rounded p-4 shadow">
<div className="text-sm text-gray-600">Failed</div>
<div className="text-xl font-bold text-red-500">
{firstFieldPieData.datasets[0].data?.[1]?.toFixed(0) ?? 0}
</div>
</div>

{/* Total Tested */}
<div className="bg-white border rounded p-4 shadow">
<div className="text-sm text-gray-600">Total Tested</div>
<div className="text-xl font-bold text-blue-600">
{((
(firstFieldPieData.datasets[0].data?.[0] ?? 0) +
(firstFieldPieData.datasets[0].data?.[1] ?? 0)
).toFixed(0))}
</div>
</div>
</div>
</div>


{/* 🔵 Daily Report Totals */}
<div className="mb-6">
<h4 className="text-base4 font-semibold text-primary mb-4">
{getDailyReportTitle()}
</h4>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
<div className="bg-white border rounded p-4 shadow">
<div className="text-sm text-gray-600">Passed</div>
<div className="text-xl font-bold text-green-600">
{dailyReportPieData.datasets[0].data?.[0]?.toFixed(0) ?? 0}
</div>
</div>
<div className="bg-white border rounded p-4 shadow">
<div className="text-sm text-gray-600">Failed</div>
<div className="text-xl font-bold text-red-500">
{dailyReportPieData.datasets[0].data?.[1]?.toFixed(0) ?? 0}
</div>
</div>
<div className="bg-white border rounded p-4 shadow">
<div className="text-sm text-gray-600">Reworked</div>
<div className="text-xl font-bold text-blue-600">
{dailyReportPieData.datasets[0].data?.[2]?.toFixed(0) ?? 0}
</div>
</div>
</div>
</div>
</motion.div>
</section>

</main>
</>
);
};

export default Dashboard;