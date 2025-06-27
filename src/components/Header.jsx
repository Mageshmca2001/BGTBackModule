import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import 'boxicons/css/boxicons.min.css';

const Header = ({ toggleSidebar, isOpen }) => {
const navigate = useNavigate();
const channel = new BroadcastChannel('auth-channel');
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

const handleLogout = () => {
// Remove the session token cookie
Cookies.remove('token');
// Notify other tabs
channel.postMessage('logout');
// Redirect to the login page
navigate('/');
};

useEffect(() => {
const checkToken = () => {
const token = Cookies.get('token');
if (!token) {
navigate('/');
}
};

checkToken(); // Initial check for token

channel.onmessage = (event) => {
if (event.data === 'logout') {
navigate('/');
}
};

return () => {
channel.close();
};
}, [navigate]);

const toggleDropdown = () => {
setIsDropdownOpen((prev) => !prev);
};

return (

<header className="bg-primary relative w-full z-30">

<div className="flex items-center h-16 px-3 justify-between">

<button onClick={toggleSidebar} className="text-white text-2xl focus:outline-none mr-4">

<i className={`bx ${isOpen ? 'bx-chevron-left' : 'bx-chevron-right'}`}></i>

</button>
<h1 className="text-white text-base font-semibold font-['Poppins'] flex-1">


Welcome to BGT MIS

</h1>

</div>

<div className="fixed top-2 right-3 z-50 flex items-center space-x-2">
{/* Notification Button */}


{/* User Dropdown */}

<div className="relative inline-block w-full sm:w-auto">

<button

onClick={toggleDropdown}

className="flex items-center border border-white justify-between w-full sm:w-auto text-white hover:bg-custom-gradient rounded-lg p-2"
>

<i className="bx bxs-user-detail text-white text-2xl"></i>

<span className="ml-2 text-white font-medium hidden sm:inline">A</span>

<i className={`bx ml-2 text-white ${isDropdownOpen ? "bx-chevron-up" : "bx-chevron-down"}`}></i>

</button>
{isDropdownOpen && (
<ul className="absolute left-0 sm:right-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-lg">
<li>

<button
onClick={handleLogout}
className="block w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-200 rounded-t-lg flex items-center justify-center sm:justify-start"
>
<i className="bx bx-log-out text-xl sm:hidden"></i>
<span className="hidden sm:inline">Logout</span>
</button>

</li>
</ul>
)}

</div>
</div>

</header>
);
};

export default Header;