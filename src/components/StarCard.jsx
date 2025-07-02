import {
FaSun,
FaBriefcase,
FaMoon,
FaCalendarAlt,
FaCalendarWeek,
FaCalendar,
} from 'react-icons/fa';

const iconMap = {
sun: <FaSun className="text-white text-4xl drop-shadow-lg" />,
briefcase: <FaBriefcase className="text-white text-4xl drop-shadow-lg" />,
moon: <FaMoon className="text-white text-4xl drop-shadow-lg" />,
calendar: <FaCalendar className="text-white text-4xl drop-shadow-lg" />,
calendarAlt: <FaCalendarAlt className="text-white text-4xl drop-shadow-lg" />,
calendarWeek: <FaCalendarWeek className="text-white text-4xl drop-shadow-lg" />,
};

const StarCard = ({
total = 0,
completed = 0,
bgColor = 'from-blue-500 to-blue-700',
icon = 'sun',
title = 'Shift',
}) => {
const IconComponent = iconMap[icon] || iconMap['sun'];

return (
<div
className={`p-6 rounded-3xl bg-gradient-to-br ${bgColor} text-white shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]`}
>
<div className="flex justify-between items-center mb-4">
<div>
<p className="text-4xl font-bold drop-shadow-sm">{total}</p>
<p className="text-lg font-semibold opacity-90">{title}</p>
</div>
<div className="bg-white/20 p-4 rounded-full shadow-inner backdrop-blur-sm">
{IconComponent}
</div>
</div>
<div className="mt-4">
<span className="inline-block bg-green-500 text-white font-poppins text-sm px-4 py-2 rounded shadow-md hover:bg-teal-600 transition">
Completed: {completed}
</span>
</div>
</div>
);
};

export default StarCard;
