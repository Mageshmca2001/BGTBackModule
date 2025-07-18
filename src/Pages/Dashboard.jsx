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
import ChatBot from './chatbot';
import StarCard from '../components/StarCard';

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





const getWeekDates = (baseDate = new Date()) => {
const week = [];
const date = new Date(baseDate);
const day = date.getDay();
date.setDate(date.getDate() - day);
for (let i = 0; i < 7; i++) {
const d = new Date(date);
d.setDate(date.getDate() + i);
week.push(d);
}
return week;
};

const getCurrentMonthWeeks = () => {
const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const weeks = [];
let current = new Date(startOfMonth);

while (current <= endOfMonth) {
const weekStart = new Date(current);
const weekEnd = new Date(current);
weekEnd.setDate(weekStart.getDate() + 6);
if (weekEnd > endOfMonth) weekEnd.setTime(endOfMonth.getTime());
weeks.push({ start: weekStart, end: weekEnd });
current.setDate(current.getDate() + 7);
}

if (weeks.length > 1) {
const last = weeks[weeks.length - 1];
const daysInLast = Math.ceil((last.end - last.start) / (1000 * 60 * 60 * 24)) + 1;
if (daysInLast < 4) {
const prev = weeks[weeks.length - 2];
prev.end = new Date(last.end);
weeks.pop();
}
}

return weeks.map((week) => {
const label = `${week.start.getDate().toString().padStart(2, '0')} - ${week.end
.getDate()
.toString()
.padStart(2, '0')} ${week.end.toLocaleString('default', { month: 'short' })}`;
return { ...week, label };
});
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
const countRes = await fetch(`${API_BASE}/user/count`);
if (!countRes.ok) throw new Error('Failed to fetch counts');
const countJson = await countRes.json();

const presentWeekDates = getWeekDates();
const previousWeekDates = getWeekDates(new Date(Date.now() - 7 * 86400000));

const result = {
presentDay: {
total: countJson.data.TodayCount,
completed: countJson.data.TodayCompleted,
shift1: countJson.data.TodayShift1,
shift2: countJson.data.TodayShift2,
shift3: countJson.data.TodayShift3,
hourlyCompleted: [
400, 400, 400, 375, 400, 400, 375, 400, 200, 400, 400, 400,
200, 400, 300, 400, 400, 200, 400, 200, 300, 400, 400, 400,200
],
hourlyReworked: [100, 80, 70, 60, 90, 85, 70, 60, 40, 30, 25, 20, 15]
},
previousDay: {
total: countJson.data.YesterdayCount,
completed: countJson.data.YesterdayCompleted,
shift1: countJson.data.YesterdayShift1,
shift2: countJson.data.YesterdayShift2,
shift3: countJson.data.YesterdayShift3,
hourlyCompleted: [
400, 400, 400, 375, 400, 400, 375, 400, 200, 400, 400, 400,
200, 400, 300, 400, 400, 200, 400, 200, 300, 400, 400, 400,200
],
hourlyReworked: [60, 55, 50, 40, 35, 30, 25, 20, 18, 15, 10, 8, 5]
},
presentWeek: {
total: countJson.data.CurrentWeekCount,
completed: countJson.data.CurrentWeekCompleted,
dailyCompleted: presentWeekDates.map((date, i) => ({
date: date.toISOString(),
value: [800, 900, 950, 880, 1020, 970, 890][i],
reworked: [50, 40, 60, 45, 55, 50, 48][i]
}))
},
previousWeek: {
total: countJson.data.PreviousWeekCount,
completed: countJson.data.PreviousWeekCompleted,
dailyCompleted: previousWeekDates.map((date, i) => ({
date: date.toISOString(),
value: [700, 720, 690, 730, 710, 740, 720][i],
reworked: [60, 58, 65, 50, 55, 62, 59][i]
}))
},
previousWeeks: getCurrentMonthWeeks().map((week, i) => ({
...week,
total: 1800 + i * 500,
completed: 1500 + i * 400,
hourlyCompleted: Array(13).fill(100 + i * 10)
})),
firstFieldReport: {
passed: 780,
failed: 140,
reworked: 80,
},
dailyReport: {
passed: 820,
failed: 100,
reworked: 60,
},


hourlyDetails: [
{ time: '06:00', Functional: 100, Calibration: 40, Accuracy: 60, NIC: 20, FinalTest: 10 },
{ time: '07:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20 },
{ time: '08:00', Functional: 120, Calibration: 50, Accuracy: 70, NIC: 30, FinalTest: 15 },
{ time: '09:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20 },
{ time: '10:00', Functional: 130, Calibration: 60, Accuracy: 80, NIC: 25, FinalTest: 20 },
{ time: '11:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20},
{ time: '12:00', Functional: 110, Calibration: 55, Accuracy: 75, NIC: 35, FinalTest: 18 },
{ time: '13:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20},
{ time: '14:00', Functional: 140, Calibration: 60, Accuracy: 90, NIC: 28, FinalTest: 22 },
{ time: '15:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20},
{ time: '16:00', Functional: 135, Calibration: 50, Accuracy: 85, NIC: 32, FinalTest: 21 },
{ time: '17:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20 },
{ time: '18:00', Functional: 120, Calibration: 45, Accuracy: 70, NIC: 29, FinalTest: 19 },
{ time: '19:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20 },
{ time: '20:00', Functional: 115, Calibration: 40, Accuracy: 65, NIC: 25, FinalTest: 17 },
{ time: '21:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20},
{ time: '22:00', Functional: 100, Calibration: 35, Accuracy: 55, NIC: 20, FinalTest: 15 },
{ time: '23:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20 },
{ time: '00:00', Functional: 90, Calibration: 30, Accuracy: 50, NIC: 15, FinalTest: 10 },
{ time: '01:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20},
{ time: '02:00', Functional: 85, Calibration: 25, Accuracy: 45, NIC: 12, FinalTest: 8 },
{ time: '03:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20},
{ time: '04:00', Functional: 80, Calibration: 20, Accuracy: 40, NIC: 10, FinalTest: 5 },
{ time: '05:00', Functional: 200, Calibration: 100, Accuracy: 90, NIC: 40, FinalTest: 20 },
{ time: '06:00', Functional: 75, Calibration: 18, Accuracy: 35, NIC: 8, FinalTest: 4 }
]
};


setData(result);
setRefreshKey(prev => prev + 1);
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
}
};

fetchData(); // 🚀 initial fetch

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

if (selectedRange !== 'Day' || selectedShift === 'All') return data.hourlyDetails;

if (selectedShift === 'Shift1') {
return data.hourlyDetails.slice(0, 8); // 06:00 to 13:00
} else if (selectedShift === 'Shift2') {
return data.hourlyDetails.slice(8, 16); // 14:00 to 21:00
} else if (selectedShift === 'Shift3') {
return [...data.hourlyDetails.slice(16), ...data.hourlyDetails.slice(0, 2)]; // 22:00 to 05:00
}
return data.hourlyDetails;
}, [data, selectedRange, selectedShift]);




const breakdownFields = ['Functional', 'Calibration', 'Accuracy', 'NIC', 'FinalTest'];



const shiftTimes = {
Shift1: { start: '06:00', end: '14:00' },
Shift2: { start: '14:00', end: '22:00' },
Shift3: { start: '22:00', end: '06:00' },
};

const isTimeInShift = (time, shift) => {
if (shift === 'All') return true;
const { start, end } = shiftTimes[shift];
if (start < end) return time >= start && time < end;
return time >= start || time < end;
};

const labels = ['Present Week', 'Previous Week'].includes(selectedRange)
? (
data?.[
selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek'
]?.dailyCompleted?.map((d) =>
new Date(d.date).toLocaleDateString('en-GB', { weekday: 'long' })
) || []
)
: (() => {
// Step 1: Filter hourly data by shift
const shiftFiltered = filteredHourlyDetails.filter((item) =>
isTimeInShift(item.time, selectedShift)
);

// Step 2: Get correct number of hours
const hours = selectedShift === 'All'
? shiftFiltered.slice(0, 25) // ✅ Need 25 time points for 24 intervals
: shiftFiltered;

// Step 3: Build time labels
return hours.map((item, i) => {
const current = item.time;
const next = hours[i + 1]?.time;

// For final item in Shift1/2/3, hardcode end time
if (!next) {
if (selectedShift === 'Shift1') return `${current} - 14:00`;
if (selectedShift === 'Shift2') return `${current} - 22:00`;
if (selectedShift === 'Shift3') return `${current} - 06:00`;
return null; // For "All", no label for last lone point
}

return `${current} - ${next}`;
}).filter(Boolean); // remove null
})();



const completedData = ['Present Week', 'Previous Week'].includes(selectedRange)
? data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.dailyCompleted?.map((d) => d.value) || []
: filteredHourlyDetails
.filter((item) => isTimeInShift(item.time, selectedShift))
.map((item) =>
Object.values(item)
.filter((v) => typeof v === 'number' && !isNaN(v))
.reduce((a, b) => a + b, 0)
);

const breakdownData = ['Present Week', 'Previous Week'].includes(selectedRange)
? (() => {
const weekData =
data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.dailyCompleted || [];
const summary = weekData.reduce(
(acc, day) => {
acc.Functional.push(day.value * 0.4);
acc.Calibration.push(day.value * 0.2);
acc.Accuracy.push(day.value * 0.2);
acc.NIC.push(day.value * 0.1);
acc.FinalTest.push(day.value * 0.1);
return acc;
},
{
Functional: [],
Calibration: [],
Accuracy: [],
NIC: [],
FinalTest: [],
}
);
return summary;
})()
: breakdownFields.reduce((acc, key) => {
acc[key] = filteredHourlyDetails
.filter((item) => isTimeInShift(item.time, selectedShift))
.map((item) => item[key]);
return acc;
}, {});

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




const firstFieldPieData = useMemo(() => ({
labels: ['passed', 'failed'],
datasets: [{
data: data?.firstFieldReport
? [
data.firstFieldReport.passed,
data.firstFieldReport.failed,

]
: [0, 0, 0],
backgroundColor: ['rgba(11, 190, 77, 0.7)', '#EF4444'], // green, red, orange
borderColor: '#fff',
borderWidth: 2,
hoverOffset: 10,
}]
}), [data]);

const firstFieldPieOptions = {
responsive: true,
maintainAspectRatio: true,
plugins: {
datalabels: {
display: (ctx) => {
const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
const value = ctx.dataset.data[ctx.dataIndex];
return total > 0 && (value / total) * 100 >= 5; // Only show if slice ≥ 5%
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


const dailyReportPieData = useMemo(() => ({
labels: ['passed', 'failed', 'reworked'],
datasets: [{
data: data?.dailyReport
? [
data.dailyReport.passed,
data.dailyReport.failed,
data.dailyReport.reworked
]
: [0, 0, 0],
backgroundColor: ['rgba(11, 190, 77, 0.7)', '#EF4444', '#317ff5ff'],
borderColor: '#fff',
borderWidth: 2,
hoverOffset: 10,
}]
}), [data]);


const dailyReportPieOptions = {
responsive: true,
maintainAspectRatio: true,
plugins: {
datalabels: {
display: (ctx) => {
const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
const value = ctx.dataset.data[ctx.dataIndex];
return total > 0 && (value / total) * 100 >= 5; // Only show if slice ≥ 5%
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



// ⛔ Error or Loading
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
key={`${selectedRange}-${refreshKey}`} // ✅ Refreshed on 5min fetch
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
<StarCard
total={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.total || 0}
completed={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.completed || 0}
bgColor="from-sky-400 to-sky-600"
icon="calendar"
title={selectedRange}
/>
</motion.div>

{[1, 2, 3].map((i) => (
<motion.div key={i} variants={itemVariants}>
<StarCard
total={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.[`shift${i}`] || 0}
completed={data?.[selectedRange === 'Day' ? 'presentDay' : 'previousDay']?.completed || 0}
bgColor={["from-purple-400 to-purple-600", "from-yellow-400 to-yellow-600", "from-indigo-400 to-indigo-600"][i - 1]}
icon="calendar"
title={`Shift ${i}`}
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
<motion.div variants={itemVariants}>
<StarCard
total={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.total || 0}
completed={data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.completed || 0}
bgColor="from-cyan-500 to-blue-500"
icon="calendarWeek"
title={selectedRange}
disableHover
/>
</motion.div>

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
month: 'short'
});

return (
<motion.div key={i} variants={itemVariants}>
<StarCard
total={1000}
completed={item.value}
bgColor={colors[i]}
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
{ label: 'FinalTest', color: 'bg-purple-500' },
].map(({ label, color, border }) => (
<div
key={label}
onClick={() => toggleDataset(label)}
className="flex items-center gap-2 cursor-pointer"
>
<span
className={`w-4 h-3 rounded-sm ${color} ${
border || ''
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
<h3 className="text-base sm:text-lg font-semibold text-gray-700 text-center sm:text-left">
{['Present Week', 'Previous Week'].includes(selectedRange)
? 'Weekly Progress & Breakdown: '
: 'Hourly Progress & Breakdown: '}
<span className="inline-block text-primary break-words text-sm sm:text-base">
[Completed, Functional, Calibration, Accuracy, NIC, FinalTest]
</span>
</h3>

{selectedRange === 'Day' && (
<div className="sm:absolute sm:right-0 w-full sm:w-auto">
<select
value={selectedShift}
onChange={(e) => setSelectedShift(e.target.value)}
className="border border-gray-300 rounded px-3 py-2 text-sm bg-white shadow w-full sm:w-auto"
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

<section className="bg-white rounded-2xl shadow-lg p-6 mt-6 font-poppins">
<h2 className="text-2xl font-bold text-center text-gray-700 mb-8">Yield & Daily Reports</h2>

<motion.div
key={`dualPie-${refreshKey}`}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="grid grid-cols-1 md:grid-cols-2 gap-6"
>

{/* First Yield Report Box */}
<div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-center">
<h3 className="text-lg font-semibold text-gray-700 mb-4">First Yield Report</h3>
<div className="relative w-[280px] h-[280px]">
<Pie data={firstFieldPieData} options={firstFieldPieOptions} plugins={[ChartDataLabels]} />
</div>
</div>

{/* Daily Report Box */}
<div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-center">
<h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Report</h3>
<div className="relative w-[280px] h-[280px]">
<Pie data={dailyReportPieData} options={dailyReportPieOptions} plugins={[ChartDataLabels]} />
</div>
</div>
</motion.div>
</section>

<ChatBot />
</main>
</>
);
};

export default Dashboard;
