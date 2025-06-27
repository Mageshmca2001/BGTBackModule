import React, { useState, useEffect } from 'react';
import StarCard from '../components/StarCard';
import { Pie, Bar } from 'react-chartjs-2';
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend,
ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const timeData = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00', '02:00', '04:00', '06:00'];

const metricsData = {
tested: [2000, 3500, 4500, 7000, 7000, 3000, 3500, 4500, 5000, 8000, 4000, 3000],
completed: [1000, 2500, 2500, 4000, 5000, 3500, 4500, 7000, 7000, 3000, 3500, 4500],
reworked: [500, 500, 1000, 2000, 1000, 3500, 4500, 7000, 7000, 3000, 3500, 4500],
};

const LoadingDots = () => (
<div className="flex justify-center items-center h-screen text-2xl text-blue-600 font-poppins">
Loading
<span className="dot">.</span>
<span className="dot">.</span>
<span className="dot">.</span>
<style>{`
.dot {
animation: blink 1.4s infinite;
margin-left: 3px;
}
.dot:nth-child(2) {
animation-delay: 0.2s;
}
.dot:nth-child(3) {
animation-delay: 0.4s;
}
@keyframes blink {
0%, 20% { opacity: 0; }
50% { opacity: 1; }
100% { opacity: 0; }
}
`}</style>
</div>
);

const Dashboard = () => {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchData = async () => {
try {
const res = await fetch('https://frontend-4iv0.onrender.com/0');
if (!res.ok) throw new Error('Network response was not ok');
const result = await res.json();
setData(result);
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchData();
const interval = setInterval(fetchData, 10000);
return () => clearInterval(interval);
}, []);

if (loading) return <LoadingDots />;
if (error) return <div className="text-center text-red-600 mt-10 font-semibold">Error: {error}</div>;

const { tested, completed, reworked } = metricsData;
const totalTested = tested.at(-1);
const totalCompleted = completed.at(-1);
const totalReworked = reworked.at(-1);
const inProgress = totalTested - totalCompleted - totalReworked;

const pieData = {
labels: ['Completed', 'Reworked', 'In Progress'],
datasets: [{
data: [totalCompleted, totalReworked, inProgress],
backgroundColor: ['rgba(22, 163, 74, 1)', 'rgba(239, 68, 68, 1)', 'rgba(59, 130, 246, 1)'],
}],
};

const barData = {
labels: timeData,
datasets: [
{
label: 'Tested',
data: tested,
backgroundColor: 'rgba(249, 115, 22, 1)',
borderColor: '#000',
borderWidth: 1,
},
{
label: 'Completed',
data: completed,
backgroundColor: 'rgba(22, 163, 74, 1)',
borderColor: '#000',
borderWidth: 1,
},
],
};

const chartOptions = {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
position: 'bottom',
labels: { font: { size: 12 } },
},
},
scales: {
y: { beginAtZero: true },
},
};

const cardData = [
{
data: data.presentDay,
bgColor: "bg-blue-400",
icon: "bx-timer text-5xl",
title: "Present Day"
},
{
data: data.presentWeek,
bgColor: "bg-purple-600",
icon: "bx-calendar text-5xl",
title: "Present Week"
},
{
data: data.presentMonth,
bgColor: "bg-pink-500",
icon: "bx-calendar text-5xl",
title: "Present Month"
},
{
data: data.presentYear,
bgColor: "bg-red-500",
icon: "bx-folder-minus text-5xl",
title: "Present Year"
},
];

return (
<main className="flex-1 px-2">
{/* Header */}
<div className="text-3xl font-poppins text-primary p-2">Dashboard</div>

{/* Summary Cards */}
<section className="bg-white rounded-lg shadow-lg p-4 md:p-6 mt-2">
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
{cardData.map((item, i) => (
<div
key={i}
className="transform transition duration-300 hover:scale-[1.03] hover:shadow-2xl rounded-2xl"
>
<StarCard
{...item.data}
bgColor={item.bgColor}
icon={item.icon}
title={item.title}
/>
</div>
))}
</div>
</section>

{/* Charts */}
<section className="bg-white rounded-lg shadow-lg p-6 mt-4">
<h2 className="text-2xl text-gray-700 font-bold text-center mb-6">
Meter Testing Analysis Dashboard
</h2>

<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
<div className="md:col-span-1 transform transition duration-500 hover:scale-105 hover:shadow-xl rounded-2xl bg-white p-4">
<h3 className="text-lg font-semibold mb-2">Status Distribution</h3>
<div className="h-[300px] relative">
<Pie data={pieData} options={chartOptions} />
</div>
</div>

<div className="md:col-span-4 transform transition duration-500 hover:scale-105 hover:shadow-xl rounded-2xl bg-white p-4">
<h3 className="text-lg font-semibold mb-2">Hourly Progress</h3>
<div className="h-[300px] relative">
<Bar data={barData} options={chartOptions} />
</div>
</div>
</div>
</section>
</main>
);
};

export default Dashboard;
