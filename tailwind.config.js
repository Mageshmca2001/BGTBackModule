/** @type {import('tailwindcss').Config} */
export default {
content: [
"./index.html",
"./src/**/*.{js,ts,jsx,tsx,css}",
],
theme: {
extend: {

animation: {
'fade-in': 'fadeIn 0.3s ease-out',
},
keyframes: {
fadeIn: {
'0%': { opacity: 0, transform: 'scale(0.95)' },
'100%': { opacity: 1, transform: 'scale(1)' },
},
},


colors: {
royalPurple: '#8a00c2',
primary: '#2b62a5',
Purple: '#4c00b0',
blue1: '#305CDE',
royalblue: '#4169E1',
magenta: {
50: '#fdf4ff',
100: '#fae8ff',
200: '#f5d0fe',
300: '#f0abfc',
400: '#e879f9',
500: '#d946ef',
600: '#c026d3',
700: '#a21caf',
800: '#86198f',
900: '#701a75',
},
},

backgroundImage: {
'custom-gradient': 'linear-gradient(319deg, #2b62a5 0%, rgba(43, 98, 165, 1) 20%, rgba(65, 105, 225, 0.7) 50%)',
},


fontSize: {
base: '14.3px', // Default font size
base1:'16px', // Default font size
base2:'23px', // Default font size
base4:'20px'
},

fontFamily: {
poppins: ['Poppins', 'sans-serif'],
inter: ['Inter', 'sans-serif'],
},

color:{
"dark-purple":"#081A51",
"light-white":"rgba(255,255,255,0.17)",
},


animation: {
'bounce-once': 'bounce-once 0.5s ease',
blink: 'blink 1s infinite',
},
keyframes: {
'bounce-once': {
'0%, 100%': { transform: 'translateY(0)' },
'50%': { transform: 'translateY(-10%)' },
},
blink: {
'0%, 100%': { borderColor: 'transparent' },
'50%': { borderColor: '#3b82f6' }, // blue-500 or your primary
},
},

animation: {
'fade-in-out': 'fadeInOut 2s ease-in-out infinite',
},

keyframes: {
fadeInOut: {

'0%, 100%': { opacity: 0 },
'50%': { opacity: 1 },
},
},
},
},

plugins: [],


};

