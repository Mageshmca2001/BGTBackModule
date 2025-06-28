import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animates only changed digits
const AnimatedDigit = ({ digit, uniqueKey }) => (
<motion.span
key={uniqueKey}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.2 }}
className="inline-block"
>
{digit}
</motion.span>
);

// Splits number into animated digits, only animating the changed ones
const AnimatedValue = ({ value }) => {
const [prevDigits, setPrevDigits] = useState(String(value).split(''));

useEffect(() => {
const newDigits = String(value).split('');
if (newDigits.join('') !== prevDigits.join('')) {
setPrevDigits(newDigits);
}
}, [value]);

const currentDigits = String(value).split('');

return (
<span className="inline-flex">
{currentDigits.map((digit, index) => (
<AnimatePresence key={index} mode="wait">
<AnimatedDigit
digit={digit}
uniqueKey={digit !== prevDigits[index] ? `${digit}-${index}` : `static-${index}`}
/>
</AnimatePresence>
))}
</span>
);
};

const StarCard = ({ bgColor, icon, title, value, tested, completed }) => {
const [prevTested, setPrevTested] = useState(tested);
const [prevCompleted, setPrevCompleted] = useState(completed);

useEffect(() => {
if (tested !== prevTested) setPrevTested(tested);
if (completed !== prevCompleted) setPrevCompleted(completed);
}, [tested, completed]);

return (
<div className={`relative ${bgColor} p-4 md:p-6 rounded-lg shadow-xl hover:scale-105 transform transition duration-300 ease-in-out font-poppins`}>
<div className="absolute top-4 right-4">
<i className={`bx ${icon} text-black text-4xl md:text-6xl opacity-40`}></i>
</div>

<div>
<h2 className="text-lg md:text-xl font-bold text-white">{value}</h2>
<p className="text-base md:text-lg font-semibold text-white">{title}</p>
</div>

<div className="container mx-auto p-4">
<div className="mt-4 flex flex-wrap justify-center gap-2">
{/* <div className="bg-orange-500/100 border-white border-[1px] text-white text-xs font-semibold w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Tested:&nbsp;<AnimatedValue value={tested} />
</div> */}

<div className="bg-green-600/100 border-white border-[1px] text-white text-xs font-semibold w-60 h-10 rounded-lg shadow-lg flex items-center justify-center">
Completed:&nbsp;<AnimatedValue value={completed} />
</div>
</div>
</div>
</div>
);
};

export default StarCard;
