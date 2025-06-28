import { useState, useEffect } from 'react';
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

const timeData = [
'08:00', '10:00', '12:00', '14:00', '16:00', '18:00',
'20:00', '22:00', '00:00', '02:00', '04:00', '06:00',
];

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
const [selectedRange, setSelectedRange] = useState('Day');
const [currentDate, setCurrentDate] = useState(new Date());

useEffect(() => {
const interval = setInterval(() => setCurrentDate(new Date()), 1000);
return () => clearInterval(interval);
}, []);

const formattedDate = currentDate.toLocaleDateString('en-GB');
const formattedTime = currentDate.toLocaleTimeString();

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
if (error) return (
<div className="text-center text-red-600 mt-10 font-semibold font-poppins">
Error: {error}
</div>
);

const { completed, reworked } = metricsData;
const totalCompleted = completed.at(-1);
const totalReworked = reworked.at(-1);
const inProgress = totalCompleted - totalReworked;

const pieData = {
labels: ['Completed', 'Reworked'],
datasets: [
{
data: [totalCompleted, totalReworked, inProgress],
backgroundColor: ['rgba(22, 163, 74, 1)', 'rgba(239, 68, 68, 1)'],
},
],
};

const barData = {
labels: timeData,
datasets: [
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
labels: { font: { size: 13 } },
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

const handleRangeChange = (e) => {
setSelectedRange(e.target.value);
console.log("Selected Range:", e.target.value);
};

return (
<main className="flex-1 px-2 font-poppins">
{/* Header with title, dropdown BELOW, and date/time */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between p-2 mb-4">
{/* Left: Title & Dropdown below */}
<div className="flex flex-col">
<span className="text-3xl text-primary font-poppins mb-2">Dashboard</span>
<select
value={selectedRange}
onChange={handleRangeChange}
className="border border-gray-300 rounded px-3 py-2 text-base w-35"
>
<option value="Day">Day</option>
<option value="Week">Week</option>
<option value="Month">Month</option>
<option value="Year">Year</option>
</select>
</div>

{/* Right: Date & Time */}
<div className="flex space-x-4 mt-4 md:mt-0">
<div className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
Date: {formattedDate}
</div>
<div className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
Time: {formattedTime}
</div>
</div>
</div>

{/* Summary Cards */}
<section className="bg-white rounded-lg shadow-lg p-4 md:p-6 mt-2 font-poppins">
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
<section className="bg-white rounded-lg shadow-lg p-6 mt-4 font-poppins">
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
