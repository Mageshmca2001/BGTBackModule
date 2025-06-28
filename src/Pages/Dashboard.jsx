import { useState, useEffect } from 'react';
import StarCard from '../components/StarCard';
import { Pie, Bar } from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const timeData = [
  '08:00', '10:00', '12:00', '14:00', '16:00', '18:00',
  '20:00', '22:00', '00:00', '02:00', '04:00', '06:00',
];

// const LoadingDots = () => {
// const [dots, setDots] = useState('');

// useEffect(() => {
// const interval = setInterval(() => {
// setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
// }, 500);
// return () => clearInterval(interval);
// }, []);

// return (
// <div
// style={{
// display: 'flex',
// justifyContent: 'center',
// alignItems: 'center',
// height: '100vh',
// fontSize: '24px',
// fontFamily: 'Poppins, sans-serif',
// color: '#2563eb',
// fontWeight: 'normal', // Not semibold
// }}
// >
// Loading{dots}
// </div>
// );
// };

const LoadingDots = () => (
<div
style={{
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
height: '100vh',
fontSize: '24px',
fontFamily: 'Poppins, sans-serif',
color: '#2563eb',
}}
>
Loading
<span className="dot">.</span>
<span className="dot">.</span>
<span className="dot">.</span>
</div>
);

const metricsData = {
  tested: [2000, 3500, 4500, 7000, 7000, 3000, 3500, 4500, 5000, 8000, 4000, 3000],
  completed: [1000, 2500, 2500, 4000, 5000, 3500, 4500, 7000, 7000, 3000, 3500, 4500],
  reworked: [500, 500, 1000, 2000, 1000, 3500, 4500, 7000, 7000, 3000, 3500, 4500],
};

const getWeekRange = (offset = 0) => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = ((day + 6) % 7) - 7 * offset;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const options = { day: '2-digit' };
  const fromDay = monday.toLocaleDateString('en-GB', options);
  const toDay = sunday.toLocaleDateString('en-GB', options);
  const month = sunday.toLocaleDateString('en-GB', { month: 'short' });
  const year = sunday.getFullYear();
  return `${fromDay}–${toDay} ${month} ${year}`;
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

  if (loading) return <LoadingDots />;
  if (error) return <div className="text-center text-red-600 mt-10 font-semibold font-poppins">Error: {error}</div>;

  const formattedDate = currentDate.toLocaleDateString('en-GB');
  const formattedTime = currentDate.toLocaleTimeString();
  const { completed, reworked } = metricsData;

  const pieData = {
    labels: ['Completed', 'Reworked'],
    datasets: [{
      data: [completed.at(-1), reworked.at(-1)],
      backgroundColor: ['rgba(22, 163, 74, 1)', 'rgba(239, 68, 68, 1)'],
    }],
  };

  const barData = {
    labels: timeData,
    datasets: [
      {
        label: 'Completed',
        data: completed,
        backgroundColor: 'rgba(22, 163, 74, 1)',
        type: 'bar',
      },
      {
        label: 'Completed (Line)',
        data: completed,
        borderColor: 'rgba(37, 99, 235, 1)',
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
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: { font: { size: 13 } },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const handleRangeChange = (e) => setSelectedRange(e.target.value);

  return (
    <main className="flex-1 px-2 font-poppins">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-2 mb-4">
        <div className="flex flex-col">
          <span className="text-3xl text-primary font-poppins mb-3">Dashboard</span>
          <div className="flex flex-row items-end space-x-6">
            <select
              value={selectedRange}
              onChange={handleRangeChange}
              className="border border-gray-300 rounded px-3 py-2 text-base w-36"
            >
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Threshold Point</label>
              <input
                type="number"
                value={redLineValue}
                onChange={(e) => setRedLineValue(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 w-32 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <div className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
            Date: {formattedDate}
          </div>
          <div className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
            Time: {formattedTime}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-lg p-4 md:p-6 mt-2 font-poppins">
        {selectedRange === 'Day' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <StarCard {...data?.presentDay} bgColor="bg-blue-400" icon="bx-sun text-5xl" title="Present Day" />
            <StarCard {...data?.presentDay} bgColor="bg-green-500" icon="bx-briefcase text-5xl" title="General Shift 1" />
            <StarCard {...data?.presentDay} bgColor="bg-yellow-500" icon="bx-sun text-5xl" title="General Shift 2" />
            <StarCard {...data?.presentDay} bgColor="bg-indigo-500" icon="bx-moon text-5xl" title="General Shift 3" />
          </div>
        )}
        {selectedRange === 'Week' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
            <StarCard {...data?.presentWeek} bgColor="bg-purple-600" icon="bx-calendar-week text-5xl" title={`Present Week: ${getWeekRange(0)}`} />
            <StarCard {...data?.previousWeek} bgColor="bg-yellow-600" icon="bx-calendar-week text-5xl" title={`Previous Week: ${getWeekRange(1)}`} />
          </div>
        )}
        {selectedRange === 'Month' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
            <StarCard {...data?.presentMonth} bgColor="bg-pink-500" icon="bx-calendar text-5xl" title={`Present Month: ${getMonthRangeLabel(0)}`} />
            <StarCard {...data?.previousMonth} bgColor="bg-orange-500" icon="bx-calendar text-5xl" title={`Previous Month: ${getMonthRangeLabel(1)}`} />
          </div>
        )}
        {selectedRange === 'Year' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
            <StarCard {...data?.presentYear} bgColor="bg-red-500" icon="bx-calendar-alt text-5xl" title={`This Year: ${getYearLabel(0)}`} />
            <StarCard {...data?.previousYear} bgColor="bg-gray-600" icon="bx-calendar-alt text-5xl" title={`Previous Year: ${getYearLabel(1)}`} />
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow-lg p-6 mt-4 font-poppins">
        <h2 className="text-2xl text-gray-700 font-bold text-center mb-6">
          Meter Testing Analysis Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1 bg-white p-4 rounded-xl shadow hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-2">Status Distribution</h3>
            <div className="h-[300px] relative">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>
          <div className="md:col-span-4 bg-white p-4 rounded-xl shadow hover:shadow-xl transition">
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
