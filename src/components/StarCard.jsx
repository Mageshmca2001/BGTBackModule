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
disableHover = false,
}) => {
const IconComponent = iconMap[icon] || iconMap['sun'];

return (
<div
className={`p-4 sm:p-5 md:p-6 rounded-3xl bg-gradient-to-br ${bgColor} text-white shadow-xl transition-all duration-300 transform
${disableHover ? '' : 'hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]'}
flex flex-col justify-between h-full`}
>
<div className="flex justify-between items-center mb-3 md:mb-4">
<div>
<p className="text-3xl md:text-4xl font-bold drop-shadow-sm">{total}</p>
<p className="text-base md:text-lg font-semibold opacity-90">{title}</p>
</div>
<div className="bg-white/20 p-3 md:p-4 rounded-full shadow-inner backdrop-blur-sm">
{IconComponent}
</div>
</div>
<div className="mt-4">
<span className="inline-block bg-green-500 text-white text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 rounded shadow-md hover:bg-green-600 transition">
Completed: {completed}
</span>
</div>
</div>
);
};

export default StarCard;
