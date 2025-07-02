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
<div className="flex justify-center items-center h-screen text-2xl font-poppins text-blue-600">
Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
</div>
);

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

weeks.push({
from: new Date(start),
to: new Date(end),
});

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
<main className="flex-1 px-4 sm:px-6 md:px-2 pb-8 overflow-x-hidden font-poppins">
{/* Header */}
<div className="flex flex-col sm:flex-row justify-between sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 p-2 mb-4">
<div>
<h1 className="text-2xl sm:text-3xl text-primary font-[poppins]">Dashboard</h1>
<div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
<select
value={selectedRange}
onChange={(e) => setSelectedRange(e.target.value)}
className="border border-gray-300 rounded-lg px-3 py-2 text-base w-full sm:w-36"
>
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
<div className="bg-primary text-white px-4 py-2 text-base1 rounded-lg shadow text-center">
Date: {formattedDate}
</div>
<div className="bg-primary text-white px-4 py-2 text-base1 rounded-lg shadow text-center">
Time: {formattedTime}
</div>
</div>
</div>

{/* Cards Section */}
<section className="bg-white rounded-lg shadow-lg p-4 md:p-6 mt-2">
{selectedRange === 'Day' && (
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
<StarCard {...data?.presentDay} bgColor="from-sky-400 to-sky-600" icon="sun" title="Present Day" />
<StarCard {...data?.presentDay} bgColor="from-purple-400 to-purple-600" icon="briefcase" title="Shift 1" />
<StarCard {...data?.presentDay} bgColor="from-yellow-400 to-yellow-600" icon="sun" title="Shift 2" />
<StarCard {...data?.presentDay} bgColor="from-indigo-400 to-indigo-600" icon="moon" title="Shift 3" />
</div>
)}

{selectedRange === 'Week' && (
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
{getWeeklyRangesOfMonth().map((label, i) => {
const colors = [
'from-sky-400 to-sky-600',
'from-purple-400 to-purple-600',
'from-yellow-400 to-yellow-600',
'from-indigo-400 to-indigo-600',
'from-pink-400 to-pink-600',
];
const color = colors[i % colors.length];
return (
<StarCard
key={i}
{...weeklyData[i] || { total: 0, completed: 0 }}
bgColor={color}
icon="calendarWeek"
title={`Week ${i + 1}: ${label}`}
/>
);
})}
</div>
)}

{selectedRange === 'Month' && (
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
{Array.from({ length: 4 }).map((_, i) => {
const monthLabel = getMonthRangeLabel(i);
const staticData = {
total: 4000 + i * 500,
completed: 3000 + i * 400,
};
const colors = [
'from-sky-400 to-sky-600',
'from-purple-400 to-purple-600',
'from-yellow-400 to-yellow-600',
'from-indigo-400 to-indigo-600',
];
const color = colors[i % colors.length];
return (
<StarCard
key={i}
{...staticData}
bgColor={color}
icon="calendar"
title={`Month: ${monthLabel}`}
/>
);
})}
</div>
)}

{selectedRange === 'Year' && (
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<StarCard {...data?.presentYear} bgColor="from-red-500 to-red-700" icon="calendarAlt" title={`This Year: ${getYearLabel(0)}`} />
<StarCard {...data?.previousYear} bgColor="from-gray-500 to-gray-700" icon="calendarAlt" title={`Previous Year: ${getYearLabel(1)}`} />
</div>
)}
</section>

{/* Chart Section */}
<section className="bg-white rounded-lg shadow-lg p-6 mt-4">
<h2 className="text-xl sm:text-2xl text-gray-700 font-bold text-center mb-6">Meter Testing Analysis Dashboard</h2>
<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
<div className="md:col-span-1 bg-white p-4 rounded-xl shadow hover:shadow-xl transition">
<h3 className="text-lg font-semibold mb-2">Status Distribution</h3>
<div className="h-[250px] sm:h-[300px]">
<Pie data={pieData} options={chartOptions} />
</div>
</div>
<div className="md:col-span-4 bg-white p-4 rounded-xl shadow hover:shadow-xl transition">
<h3 className="text-lg font-semibold mb-2">Hourly Progress</h3>
<div className="h-[250px] sm:h-[300px]">
<Bar data={barData} options={chartOptions} />
</div>
</div>
</div>
</section>
</main>
);
};

export default Dashboard;
