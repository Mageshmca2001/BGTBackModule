import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import 'boxicons/css/boxicons.min.css';

const Header = ({ toggleSidebar, isOpen }) => {
const navigate = useNavigate();
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

const userName = Cookies.get('userName') || 'Unknown';
const userRole = Cookies.get('userRole') || 'User';

const channel = new BroadcastChannel('auth-channel');

const handleLogout = () => {
Cookies.remove('token');
Cookies.remove('userName');
Cookies.remove('userRole');
channel.postMessage('logout');
navigate('/');
};

useEffect(() => {
const checkToken = () => {
const token = Cookies.get('token');
if (!token) navigate('/');
};

checkToken();

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
<button
onClick={toggleSidebar}
className="text-white text-2xl focus:outline-none mr-4"
>
<i className={`bx ${isOpen ? 'bx-chevron-left' : 'bx-chevron-right'}`}></i>
</button>
<h1 className="text-white text-base font-semibold font-['Poppins'] flex-1">
Welcome to BGT MIS
</h1>
</div>

<div className="fixed top-2 right-3 z-50 flex items-center space-x-2">
<div className="relative inline-block">
<button
onClick={toggleDropdown}
className="flex items-center border border-white text-white hover:bg-white/10 rounded-lg px-3 py-2"
>
<i className="bx bxs-user text-2xl"></i>
<span className="ml-2 hidden sm:inline font-medium">{userName}</span>
<i
className={`bx ml-2 ${
isDropdownOpen ? 'bx-chevron-up' : 'bx-chevron-down'
}`}
></i>
</button>

{isDropdownOpen && (
<ul className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
<li className="px-4 py-2 text-gray-700 font-semibold border-b">
Role: {userRole}
</li>
<li>
<button
onClick={handleLogout}
className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium"
>
<i className="bx bx-log-out mr-2"></i> Logout
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
