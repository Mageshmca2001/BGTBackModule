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
Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
// import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
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

const timeData = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00', '02:00', '04:00', '06:00'];

const LoadingDots = () => (
<div className="flex justify-center items-center h-screen text-2xl text-blue-600 font-poppins">
Loading
<span className="animate-bounce mx-1">.</span>
<span className="animate-bounce mx-1 delay-150">.</span>
<span className="animate-bounce mx-1 delay-300">.</span>
</div>
);

const containerVariants = {
hidden: {},
visible: {
transition: {
staggerChildren: 0.15,
delayChildren: 0.1,
},
},
};

const popUpCardVariants = {
hidden: {
opacity: 0,
scale: 0.8,
y: 30,
},
visible: {
opacity: 1,
scale: 1,
y: 0,
transition: {
type: 'spring',
stiffness: 120,
damping: 14,
},
},
};

const metricsData = {
tested: [2000, 3500, 4500, 7000, 7000, 3000, 3500, 4500, 5000, 8000, 4000, 3000],
completed: [1000, 2500, 2500, 4000, 5000, 3500, 4500, 7000, 7000, 3000, 3500, 4500],
reworked: [500, 500, 1000, 2000, 1000, 3500, 4500, 7000, 7000, 3000, 3500, 4500],
};

const getWeeklyRangesOfMonth = () => {
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);
let weeks = [];
let start = new Date(firstDay);

while (start <= lastDay) {
let end = new Date(start);
end.setDate(end.getDate() + 6);
if (end > lastDay) end = new Date(lastDay);
weeks.push({ from: new Date(start), to: new Date(end) });
start.setDate(end.getDate() + 1);
}

return weeks.map(({ from, to }) => {
const fromStr = from.toLocaleDateString('en-GB', { day: '2-digit' });
const toStr = to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
return `${fromStr}–${toStr}`;
});
};

const getMonthRangeLabel = (offset = 0) => {
const now = new Date();
const currentMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);
return currentMonth.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const getYearLabel = (offset = 0) => {
const now = new Date();
return (now.getFullYear() - offset).toString();
};

const Dashboard = () => {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedRange, setSelectedRange] = useState('Day');
const [currentDate, setCurrentDate] = useState(new Date());
const [redLineValue, setRedLineValue] = useState(5000);
const [showCelebration, setShowCelebration] = useState(false);
const [width, height] = useWindowSize();

const { completed, reworked } = metricsData;
const formattedDate = currentDate.toLocaleDateString('en-GB');
const formattedTime = currentDate.toLocaleTimeString();
const monthWeeks = getWeeklyRangesOfMonth();

const weeklyData = monthWeeks.map(() => ({
total: Math.floor(Math.random() * 3000) + 2000,
completed: Math.floor(Math.random() * 2000) + 1000,
}));

useEffect(() => {
const interval = setInterval(() => setCurrentDate(new Date()), 1000);
return () => clearInterval(interval);
}, []);

useEffect(() => {
const fetchData = async () => {
try {
const res = await fetch('https://frontend-4iv0.onrender.com/0');
if (!res.ok) throw new Error('Network response was not ok');
const result = await res.json();
result.previousWeek = { total: 2000, completed: 1800 };
result.previousMonth = { total: 5000, completed: 4500 };
result.previousYear = { total: 80000, completed: 75000 };
setData(result);
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
}
};

fetchData();
const interval = setInterval(fetchData, 10000);
return () => clearInterval(interval);
}, []);

// 🥳 Trigger celebration if threshold reached and > 0
useEffect(() => {
if (redLineValue <= 0) return;
const reached = completed.some((value) => value >= redLineValue);
if (reached) {
setShowCelebration(true);
const timer = setTimeout(() => setShowCelebration(false), 5000);
return () => clearTimeout(timer);
}
}, [completed, redLineValue]);

const barData = useMemo(() => ({
labels: timeData,
datasets: [
{
label: 'Completed',
data: completed,
backgroundColor: 'rgba(34, 197, 94, 0.7)',
borderColor: 'rgba(22, 163, 74, 1)',
borderWidth: 1,
borderRadius: 6,
type: 'bar',
},
{
label: 'Completed (Line)',
data: completed,
borderColor: 'rgba(59, 130, 246, 1)',
borderWidth: 2,
fill: false,
type: 'line',
tension: 0.4,
pointRadius: 3,
},
{
label: `Threshold (${redLineValue})`,
data: Array(timeData.length).fill(redLineValue),
borderColor: 'rgba(239, 68, 68, 1)',
borderWidth: 2,
borderDash: [5, 5],
pointRadius: 0,
type: 'line',
},
],
}), [completed, redLineValue]);

const chartOptions = {
responsive: true,
maintainAspectRatio: false,
interaction: { mode: 'index', intersect: false },
plugins: {
datalabels: { display: false },
tooltip: { enabled: true },
legend: {
position: 'bottom',
labels: { font: { size: 13 } },
},
},
scales: { y: { beginAtZero: true } },
animation: {
duration: 800,
easing: 'easeOutQuart',
},
};

const pieData = {
labels: ['Completed', 'Reworked'],
datasets: [{
data: [completed.at(-1), reworked.at(-1)],
backgroundColor: ['rgba(34, 197, 94, 0.9)', 'rgba(239, 68, 68, 0.9)'],
borderWidth: 1,
}],
};

if (loading) return <LoadingDots />;
if (error) return <div className="text-center text-red-600 mt-10 font-semibold font-poppins">Error: {error}</div>;

return (
<>
{/* {showCelebration && (
<>
<Confetti
width={width}
height={height}
numberOfPieces={150}
recycle={false}
gravity={0.3}
initialVelocityY={10}
confettiSource={{ x: 0, y: 0, w: 10, h: 10 }}
/>
<Confetti
width={width}
height={height}
numberOfPieces={150}
recycle={false}
gravity={0.3}
initialVelocityY={10}
confettiSource={{ x: width - 10, y: 0, w: 10, h: 10 }}
/>
</> */}



<main className="flex-1 px-2 sm:px-4 md:px-2 pb-8 overflow-x-hidden font-poppins">
{/* Header */}
<div className="flex flex-col sm:flex-row justify-between sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 p-2 mb-4">
<div>
<h1 className="text-2xl sm:text-3xl text-primary font-[poppins]">Dashboard</h1>
<div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
<select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-base w-full sm:w-36">
<option value="Day">Day</option>
<option value="Week">Week</option>
<option value="Month">Month</option>
<option value="Year">Year</option>
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
<div className="bg-primary text-white px-4 py-2 text-base1 rounded-lg shadow text-center">Date: {formattedDate}</div>
<div className="bg-primary text-white px-4 py-2 text-base1 rounded-lg shadow text-center">Time: {formattedTime}</div>
</div>
</div>

{/* Cards */}
<section className="bg-white rounded-2xl shadow-lg p-6 mb-6 transition-all">
{['Day', 'Week', 'Month', 'Year'].includes(selectedRange) && (
<motion.div
className={`grid gap-4 ${selectedRange === 'Year' ? 'grid-cols-1 sm:grid-cols-2' : selectedRange === 'Week' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'}`}
variants={containerVariants}
initial="hidden"
animate="visible"
>
{selectedRange === 'Day' &&
['Present Day', 'Shift 1', 'Shift 2', 'Shift 3'].map((title, i) => (
<motion.div
key={i}
variants={popUpCardVariants}
// whileHover={{ scale: 1.01 }}
>
<StarCard
{...data?.presentDay}
bgColor={[
'from-sky-400 to-sky-600',
'from-purple-400 to-purple-600',
'from-yellow-400 to-yellow-600',
'from-indigo-400 to-indigo-600',
][i]}
icon={['sun', 'briefcase', 'sun', 'moon'][i]}
title={title}
/>
</motion.div>
))}

{selectedRange === 'Week' &&
getWeeklyRangesOfMonth().map((label, i) => (
<motion.div
key={i}
variants={popUpCardVariants}
// whileHover={{ scale: 1.01 }}
>
<StarCard
{...weeklyData[i] || { total: 0, completed: 0 }}
bgColor={[
'from-sky-400 to-sky-600',
'from-purple-400 to-purple-600',
'from-yellow-400 to-yellow-600',
'from-indigo-400 to-indigo-600',
'from-pink-400 to-pink-600',
][i % 5]}
icon="calendarWeek"
title={`Week ${i + 1}: ${label}`}
/>
</motion.div>
))}

{selectedRange === 'Month' &&
Array.from({ length: 4 }).map((_, i) => (
<motion.div
key={i}
variants={popUpCardVariants}
// whileHover={{ scale: 1.01 }}
>
<StarCard
{...{ total: 4000 + i * 500, completed: 3000 + i * 400 }}
bgColor={[
'from-sky-400 to-sky-600',
'from-purple-400 to-purple-600',
'from-yellow-400 to-yellow-600',
'from-indigo-400 to-indigo-600',
][i]}
icon="calendar"
title={`Month: ${getMonthRangeLabel(i)}`}
/>
</motion.div>
))}

{selectedRange === 'Year' &&
['presentYear', 'previousYear'].map((key, i) => (
<motion.div
key={i}
variants={popUpCardVariants}
// whileHover={{ scale: 1.01 }}
>
<StarCard
{...data?.[key]}
bgColor={['from-red-500 to-red-700', 'from-gray-500 to-gray-700'][i]}
icon="calendarAlt"
title={`${i === 0 ? 'This Year' : 'Previous Year'}: ${getYearLabel(i)}`}
/>
</motion.div>
))}
</motion.div>
)}
</section>

{/* Charts */}
<section className="bg-white rounded-2xl shadow-lg p-6 mt-4">
<h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Meter Analysis Dashboard</h2>
<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
<div className="md:col-span-1 p-4 rounded-xl bg-gray-50 hover:bg-white transition shadow">
<h3 className="text-lg font-semibold text-gray-700 mb-4">Status Pie</h3>
<div className="h-[250px]"><Pie data={pieData} options={chartOptions} /></div>
</div>
<div className="md:col-span-4 p-4 rounded-xl bg-gray-50 hover:bg-white transition shadow">
<h3 className="text-lg font-semibold text-gray-700 mb-4">Hourly Progress</h3>
<div className="h-[250px]"><Bar data={barData} options={chartOptions} /></div>
</div>
</div>
</section>
</main>
</>
);
};

export default Dashboard;
