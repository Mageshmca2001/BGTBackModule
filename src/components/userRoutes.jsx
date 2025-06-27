import React, { useState, useEffect } from 'react';

import { useLocation, Link } from 'react-router-dom';

import logo from '../assets/logo1.png';

import 'boxicons/css/boxicons.min.css';

import Header from './Header';

import '../css/Sidebar.css';

const UserSidebar = ({ children }) => {

const [isOpen, setIsOpen] = useState(true);

const [isDropdownOpen, setIsDropdownOpen] = useState(false);

const [isMobile, setIsMobile] = useState(false);

const location = useLocation();

useEffect(() => {

const handleResize = () => {

setIsMobile(window.innerWidth < 768);

};

handleResize();

window.addEventListener('resize', handleResize);

return () => {

window.removeEventListener('resize', handleResize);

};
}, 

[]);

useEffect(() => {

if (isMobile) {

setIsOpen(false);

}

else {

setIsOpen(true);
}
}, [isMobile]);

const toggleSidebar = () => {

setIsOpen(!isOpen);

if (isOpen) {

setIsDropdownOpen(false);

}
};

const toggleDropdown = () => {

if (isOpen) {

setIsDropdownOpen(!isDropdownOpen);

}
};

return (
<div className="flex h-screen">
<aside
id="sidebar"
className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out ${
isMobile ? (isOpen ? 'w-64' : 'w-0') : isOpen ? 'w-64' : 'w-16'
} overflow-hidden md:overflow-visible sidebar-style`}
>
{isMobile && isOpen && (
<button
onClick={toggleSidebar}
className="absolute top-4 right-4 text-white text-2xl"
>
<i className="bx bx-x"></i>
</button>
)}

<div
className={`logo-container flex items-center justify-between p-2 border-b border-white ${
!isOpen && 'justify-center'
}`}
>
<div className="flex items-center min-w-0">
<div className="flex-shrink-0 bg-white p-2 shadow-md">
<img src={logo} alt="Logo" className="h-9 w-auto sm:h-9 object-cover" />
</div>

{isOpen && (
<span className="nav-text ml-3 px-3 text-white text-center text-1xl font-['Poppins'] truncate">
BGT LLP MIS
</span>
)}
</div>
</div>

<div className="h-full px-3 py-4 overflow-y-auto">

<ul className="space-y-2">
{/* General Category */}
{isOpen && (
<li className="px-3 py-1 text-base font-semibold text-white  uppercase select-none">
General
</li>
)}

{/* Dashboard */}
<li>
<Link
to="/users"
className="flex items-center p-3 text-white rounded-lg hover:bg-gray-200 group"
>
<i className="bx bxs-dashboard text-xl text-white group-hover:text-black flex-shrink-0"></i>
{isOpen && (
<span className="nav-text ml-3 text-white group-hover:text-black font-['Poppins'] truncate">
Dashboard
</span>
)}
</Link>
</li>

{/* Reports Dropdown */}
<li className="relative">
<button
onClick={toggleDropdown}
className="flex items-center w-full p-3 text-white rounded-lg hover:bg-gray-200 group"
>
<i className="bx bxs-file text-xl text-white group-hover:text-black flex-shrink-0"></i>
{isOpen && (
<span className="nav-text ml-3 text-white group-hover:text-black font-['Poppins'] truncate">
Reports
</span>
)}
{isOpen && (
<i className="bx bx-chevron-down ml-auto text-white group-hover:text-black"></i>
)}
</button>

{isDropdownOpen && isOpen && (
<ul className="mt-2 space-y-2 bg-gray-200 rounded-lg">
<li>
<Link
to="/userpages/Daily"
className="flex items-center px-3 py-2 text-gray-800 rounded-lg hover:bg-white"
>

<i className="bx bx-timer text-base text-gray-800 flex-shrink-0"></i>
<span className="nav-text ml-2 truncate">
Daily Reports
</span>
</Link>
</li>
<li>
<Link
to="/userpages/Monthly"
className="flex items-center p-2 text-gray-800 rounded-lg hover:bg-white"
>
<i className="bx bx-calendar-week text-lg text-gray-800"></i>
<span className="ml-2">Monthly Reports</span>
</Link>
</li>
<li>
<Link
to="/userpages/Meter"
className="flex items-center p-2 text-gray-800 rounded-lg hover:bg-white"
>
<i className="bx bx-calendar-star text-lg text-gray-800"></i>
<span className="ml-2">Meter Reports</span>
</Link>
</li>

</ul>
)}

</li>

{/* Configuration Category */}
{/* {isOpen && (
<li className="px-3 py-1 mt-4 text-base font-semibold text-white uppercase select-none">
Configuration
</li>
)} */}

</ul>
</div>
</aside>
<div
className={`transition-all duration-300 ease-in-out ${
isMobile ? 'ml-0' : isOpen ? 'ml-64' : 'ml-16'
} w-full flex flex-col`}
>
<Header isOpen={isOpen} toggleSidebar={toggleSidebar} />
<main className="flex-1 bg-gray-100 p-4 overflow-y-auto">
{children}
</main>
</div>
</div>

);
};

export default UserSidebar;
