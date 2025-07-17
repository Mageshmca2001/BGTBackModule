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

const timeData = [
'06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00',
'10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
'14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
'18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00',
'22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00', '01:00 - 02:00',
'02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00'
];

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
const [selectedRange, setSelectedRange] = useState('Present Day');
const [currentDate, setCurrentDate] = useState(new Date());
const [redLineValue, setRedLineValue] = useState(1000);
const [lastUpdated, setLastUpdated] = useState(null);
const [refreshKey, setRefreshKey] = useState(0);


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
const countRes = await fetch(`${API_BASE}/user/today-count`);
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
  300, 350, 400, 375, 350, 325, 300, 275, 250, 225, 200, 190,
  180, 165, 150, 145, 140, 135, 130, 125, 120, 110, 100, 95,200
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
300, 350, 400, 375, 350, 325, 300, 275, 250, 225, 200, 190,
180, 165, 150, 145, 140, 135, 130, 125, 120, 110, 100, 95,200
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

// const getPieStats = () => {
// if (!data) return { completed: 0, reworked: 0 };

// if (selectedRange === 'Present Day' || selectedRange === 'Previous Day') {
// const selected = selectedRange === 'Present Day' ? data.presentDay : data.previousDay;
// const completed = selected.hourlyCompleted?.reduce((a, b) => a + b, 0);
// const reworked = selected.hourlyReworked?.reduce((a, b) => a + b, 0);
// return { completed, reworked };
// }

// if (selectedRange === 'Present Week') {
// const completed = data.presentWeek?.dailyCompleted?.reduce((sum, d) => sum + (d.value || 0), 0);
// const reworked = data.presentWeek?.dailyCompleted?.reduce((sum, d) => sum + (d.reworked || 0), 0);
// return { completed, reworked };
// }

// if (selectedRange === 'Previous Week') {
// const completed = data.previousWeek?.dailyCompleted?.reduce((sum, d) => sum + (d.value || 0), 0);
// const reworked = data.previousWeek?.dailyCompleted?.reduce((sum, d) => sum + (d.reworked || 0), 0);
// return { completed, reworked };
// }

// return { completed: 0, reworked: 0 };
// };


// const { completed, reworked } = getPieStats();

// const pieData = useMemo(() => ({
// labels: ['Completed', 'Reworked'],
// datasets: [
// {
// data: [completed, reworked],
// backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(239, 68, 68, 0.85)'],
// borderColor: '#fff',
// borderWidth: 2,
// hoverOffset: 10
// }
// ]
// }), [completed, reworked]);

// const pieChartOptions = {
// responsive: true,
// maintainAspectRatio: false,
// cutout: '60%',
// plugins: {
// datalabels: {
// display: (ctx) => {
// const value = ctx.dataset.data[ctx.dataIndex];
// const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
// return total > 0 && (value / total) * 100 >= 1;
// },
// formatter: (value, context) => {
// const data = context.dataset.data;
// const total = data.reduce((a, b) => a + b, 0);
// return total === 0 ? '' : `${((value / total) * 100).toFixed(1)}%`;
// },
// color: '#fff',
// font: { weight: 'bold', size: 14, family: 'Poppins' },
// anchor: 'center', // ✅ ADD THIS
// align: 'center',  // ✅ ADD THIS
// clamp: true,      // ✅ OPTIONAL: prevents overflow
// },
// tooltip: {
// enabled: true
// },
// legend: {
// position: 'bottom',
// labels: { font: { family: 'Poppins', size: 13 }, color: '#4B5563' }
// },
// beforeDraw: (chart) => {
// const { width, height, ctx } = chart;
// ctx.restore();
// const fontSize = (height / 130).toFixed(2);
// ctx.font = `${fontSize}em Poppins`;
// ctx.textBaseline = 'middle';
// const percent = completed + reworked > 0 ? ((completed / (completed + reworked)) * 100).toFixed(0) : 0;
// const text = `${percent}% Done`;
// const textX = Math.round((width - ctx.measureText(text).width) / 2);
// const textY = height / 2;
// ctx.fillStyle = '#1F2937';
// ctx.fillText(text, textX, textY);
// ctx.save();
// }
// }
// };

// const barData = useMemo(() => {
// let labels = timeData;
// let dataPoints = [];

// if (selectedRange === 'Present Day') {
// dataPoints = data?.presentDay?.hourlyCompleted || [];
// } else if (selectedRange === 'Previous Day') {
// dataPoints = data?.previousDay?.hourlyCompleted || [];
// } else if (selectedRange === 'Present Week') {
// labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// dataPoints = data?.presentWeek?.dailyCompleted?.map(d => d.value) || [];
// } else if (selectedRange === 'Previous Week') {
// labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// dataPoints = data?.previousWeek?.dailyCompleted?.map(d => d.value) || [];
// } else if (selectedRange === 'Previous Weeks') {
// labels = data?.previousWeeks?.map((w, i) => `Week ${i + 1}`);
// dataPoints = data?.previousWeeks?.map(
// (w) => Math.round((w.hourlyCompleted?.reduce((a, b) => a + b, 0) || 0) / 13)
// );
// }

// return {
// labels,
// datasets: [
// {
// label: 'Completed',
// data: dataPoints,
// backgroundColor: 'rgba(34, 197, 94, 0.7)',
// borderColor: 'rgba(22, 163, 74, 1)',
// borderWidth: 1,
// borderRadius: 6,
// type: 'bar'
// },
// {
// label: 'Threshold',
// data: Array(dataPoints.length).fill(redLineValue),
// borderColor: 'rgba(239, 68, 68, 1)',
// borderWidth: 2,
// borderDash: [5, 5],
// pointRadius: 0,
// fill: false,
// type: 'line'
// },
// {
// label: 'Tracking Line',
// data: dataPoints,
// borderColor: 'rgba(59, 130, 246, 1)',
// backgroundColor: 'transparent',
// borderWidth: 2,
// pointRadius: 3,
// tension: 0.3,
// type: 'line'
// }
// ]
// };
// }, [selectedRange, data, redLineValue]);

const LoadingDots = () => (
<div className="flex justify-center items-center h-screen text-2xl text-blue-600 font-poppins">
Loading<span className="animate-bounce mx-1">.</span>
<span className="animate-bounce mx-1 delay-150">.</span>
<span className="animate-bounce mx-1 delay-300">.</span>
</div>
);

const breakdownFields = ['Functional', 'Calibration', 'Accuracy', 'NIC', 'FinalTest'];

const hourlyLabels = timeData.map((time, i) => ({
time,
Functional: Math.floor(Math.random() * 50) + 50,
Calibration: Math.floor(Math.random() * 30) + 20,
Accuracy: Math.floor(Math.random() * 40) + 30,
NIC: Math.floor(Math.random() * 20) + 10,
FinalTest: Math.floor(Math.random() * 15) + 5,
}));


// const barDataHourlyDetails = {
// labels: hourlyLabels,
// datasets: breakdownFields.map((key, i) => ({
// label: key,
// data: data?.hourlyDetails?.map(item => item[key]) || [],
// backgroundColor: [
// '#3B82F6', // Functional
// '#F59E0B', // Calibration
// '#10B981', // Accuracy
// '#EF4444', // NIC
// '#8B5CF6'  // FinalInit
// ][i],
// barThickness: 16,         // ✅ Set individual bar thickness
// categoryPercentage: 0.7,  // ✅ Space between groups
// barPercentage: 0.9,       // ✅ Space between bars inside group
// borderRadius: 4,
// }))
// };


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
<option value="Present Day">Present Day</option>
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
<div className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow text-center min-w-[200px]">
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
{(selectedRange === 'Present Day' || selectedRange === 'Previous Day') && (
<motion.div
variants={containerVariants}
initial="hidden"
animate="visible"
exit="hidden"
className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
>
<motion.div variants={itemVariants}>
<StarCard
total={data?.[selectedRange === 'Present Day' ? 'presentDay' : 'previousDay']?.total || 0}
completed={data?.[selectedRange === 'Present Day' ? 'presentDay' : 'previousDay']?.completed || 0}
bgColor="from-sky-400 to-sky-600"
icon="calendar"
title={selectedRange}
/>
</motion.div>

{[1, 2, 3].map((i) => (
<motion.div key={i} variants={itemVariants}>
<StarCard
total={data?.[selectedRange === 'Present Day' ? 'presentDay' : 'previousDay']?.[`shift${i}`] || 0}
completed={data?.[selectedRange === 'Present Day' ? 'presentDay' : 'previousDay']?.completed || 0}
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
"from-sky-400 to-sky-600", "from-purple-400 to-purple-600", "from-yellow-400 to-yellow-600",
"from-indigo-400 to-indigo-600", "from-rose-300 to-rose-600", "from-pink-400 to-pink-600", "from-blue-400 to-blue-600"
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

<section className="bg-white rounded-2xl shadow-lg p-6 mt-4 font-poppins">
  <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Meter Analysis Dashboard</h2>

<div className="grid grid-cols-1 gap-6 font-poppins">
{/* ✅ Unified Hourly/Weekly Chart */}
<div className="md:col-span-4 p-4 rounded-xl bg-gray-50 shadow">
<h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
{['Present Week', 'Previous Week'].includes(selectedRange)
? 'Weekly Progress & Breakdown: '
: 'Hourly Progress & Breakdown: '}
<span className="inline-block text-primary">
[Completed, Functional, Calibration, Accuracy, NIC, FinalTest]
</span>
</h3>

<motion.div
key={`${selectedRange}-chart-${refreshKey}`}
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.4 }}
>
<div className="w-full overflow-x-auto py-6">
<div className="min-w-[2400px] h-[300px]">
<Bar
data={{
labels: ['Present Week', 'Previous Week'].includes(selectedRange)
? data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
?.dailyCompleted?.map(d =>
new Date(d.date).toLocaleDateString('en-GB', { weekday: 'long' })
) || []
: data?.hourlyDetails?.map(item => item.time).filter((v, i, arr) => i === 0 || v !== arr[0]) || [],
datasets: (() => {
const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const completedData = ['Present Week', 'Previous Week'].includes(selectedRange)
? data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
?.dailyCompleted?.map(d => d.value) || []
: data?.presentDay?.hourlyCompleted || [];

const breakdownData = ['Present Week', 'Previous Week'].includes(selectedRange)
? (() => {
const weekData =
    data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
    ?.dailyCompleted || [];
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
acc[key] = data?.hourlyDetails?.map(item => item[key]) || [];
return acc;
}, {});

return [
{
label: 'Completed',
data: completedData,
backgroundColor: 'rgba(34, 197, 94, 0.7)',
borderColor: 'rgba(22, 163, 74, 1)',
borderWidth: 1,
barThickness: 18,
categoryPercentage: 0.7,
barPercentage: 0.9,
borderRadius: 0,
},
...breakdownFields.map((key, i) => ({
label: key,
data: breakdownData[key] || [],
backgroundColor: colors[i],
barThickness: 18,
categoryPercentage: 0.7,
barPercentage: 0.9,
borderRadius: 0,
})),
{
label: 'Tracking Line',
data: completedData,
borderColor: 'rgba(59, 130, 246, 1)',
backgroundColor: 'transparent',
borderWidth: 2,
pointRadius: 3,
tension: 0.3,
type: 'line',
},
{
label: 'Threshold',
data: Array(completedData.length).fill(redLineValue),
borderColor: 'rgba(239, 68, 68, 1)',
borderWidth: 2,
borderDash: [5, 5],
pointRadius: 0,
fill: false,
type: 'line',
},
];
})(),
}}
options={{
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
position: 'top',
labels: {
font: { family: 'Poppins', size: 13 },
},
},
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
footerFont: { family: 'Poppins', size: 12 },
titleAlign: 'center',
bodyAlign: 'left',
backgroundColor: 'rgba(255, 255, 255, 0.95)',
titleColor: '#111827',
bodyColor: '#1F2937',
borderColor: '#E5E7EB',
borderWidth: 1,
padding: 10,
cornerRadius: 8,
boxPadding: 4,
},
datalabels: {
display: false,
},
},
interaction: {
mode: 'index',
intersect: false,
},
scales: {
x: {
ticks: {
font: { family: 'Poppins' },
},
},
y: {
beginAtZero: true,
suggestedMax: redLineValue + 500,
ticks: {
stepSize: 200,
font: { family: 'Poppins' },
},
},
},
}}
/>
</div>
</div>
</motion.div>
</div>
</div>
</section>


<ChatBot />
</main>
</>
);
};

export default Dashboard;
