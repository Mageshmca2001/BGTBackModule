import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

import '../css/Sidebar.css';
import logoImage from '../assets/Bright.png';
import bg from '../assets/Mac.jpg';

// Loading dots animation
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

const Login = () => {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [rememberMe, setRememberMe] = useState(false);
const [errors, setErrors] = useState({ username: '', password: '' });
const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [isPageLoading, setIsPageLoading] = useState(true);
const [showInactiveModal, setShowInactiveModal] = useState(false);

const navigate = useNavigate();

useEffect(() => {
document.title = 'BGT - Login';
const timer = setTimeout(() => setIsPageLoading(false), 800);

const savedUsername = Cookies.get('loginName');
const savedPassword = Cookies.get('loginPassword');

if (savedUsername && savedPassword) {
setUsername(savedUsername);
setPassword(savedPassword);
setRememberMe(true);
}

return () => clearTimeout(timer);
}, []);

const handleLogin = async (e) => {
e.preventDefault();
setErrors({ username: '', password: '' });

if (!username || !password) {
if (!username) setErrors((prev) => ({ ...prev, username: 'Username is required' }));
if (!password) setErrors((prev) => ({ ...prev, password: 'Password is required' }));
return;
}

setIsLoading(true);

const attemptLogin = async (url) => {
return await axios.post(url, { username, password });
};

try {
let response;
let usedEndpoint = '';

try {
response = await attemptLogin('http://localhost:3000/auth/login');
usedEndpoint = 'auth';
} catch (primaryError) {
console.warn('Primary login failed, trying secondary...');
try {
response = await attemptLogin('http://localhost:3000/user/login');
usedEndpoint = 'user';
} catch (secondaryError) {
if (secondaryError.response?.status === 403) {
setShowInactiveModal(true);
setIsLoading(false);
return;
}
throw secondaryError;
}
}

const { user, token } = response.data;

if (usedEndpoint === 'user' && user.status?.toLowerCase() !== 'active') {
setShowInactiveModal(true);
setIsLoading(false);
return;
}

const safeUserName = user.username || user.name || 'Guest';
const safeUserRole = user.role || 'User';

Cookies.set('token', token);
Cookies.set('userName', safeUserName);
Cookies.set('userRole', safeUserRole);

if (rememberMe) {
Cookies.set('loginName', username);
Cookies.set('loginPassword', password); // Dev only
} else {
Cookies.remove('loginName');
Cookies.remove('loginPassword');
}

setLoginSuccessMessage('Login Successful!');
setIsLoading(false);

const role = safeUserRole.toLowerCase();

if (role === 'admin' || role === 'planthead') {
navigate('/admin');
} else if (['user', 'linehead', 'testingengineer'].includes(role)) {
navigate('/users');
} else {
setErrors((prev) => ({ ...prev, password: 'Unauthorized role' }));
}
} catch (error) {
setIsLoading(false);
const msg = error.response?.data?.message || 'Login failed.';
setErrors((prev) => ({ ...prev, password: msg }));
}
};

return (
<div className="relative h-screen w-full flex items-start justify-center bg-gray-100 pt-[20px] p-5">
{/* Background */}
<div
className="absolute top-0 left-0 w-full h-full bg-cover bg-center zoom-animation"
style={{
backgroundImage: `linear-gradient(to right, rgba(139, 139, 139, 0.30), rgba(33, 88, 255, 0.65)), url(${bg})`,
opacity: 0.3,
}}
></div>

{/* Loading Overlay */}
{(isPageLoading || isLoading) && (
<div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex items-center justify-center">
<LoadingDots />
</div>
)}

{/* Inactive Modal */}
{showInactiveModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
<div className="bg-white rounded-2xl p-8 w-[90%] max-w-sm text-center shadow-2xl">
<div className="text-yellow-400 text-5xl mb-4">⚠️</div>
<h2 className="text-2xl font-bold text-gray-800 mb-2">Account Inactive</h2>
<p className="text-gray-600 mb-6">
Your account is currently inactive. Please contact your administrator to continue.
</p>
<button
onClick={() => setShowInactiveModal(false)}
className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
>
OK
</button>
</div>
</div>
)}

{/* Login Form */}
<div className="bg-white shadow-md p-8 w-full max-w-md text-center z-10">
<div className="flex flex-wrap items-center justify-center gap-2 mb-4">
<img src={logoImage} alt="Logo" className="h-10 w-auto sm:h-12" />
<span className="text-sm sm:text-2xl font-poppins text-gray-800">
BrightGrid Technologies LLP
</span>
</div>

<div className="text-2xl font-poppins mb-5">Sign In</div>

<form onSubmit={handleLogin} className="text-left space-y-4">
<div>
<label className="block text-base font-poppins text-gray-600">Login Name</label>
<input
type="text"
value={username}
onChange={(e) => setUsername(e.target.value)}
className="w-full border-b-2 focus:outline-none focus:border-primary focus:animate-pulse"
/>
{errors.username && (
<p className="text-red-500 text-base font-poppins">{errors.username}</p>
)}
</div>

<div>
<label className="block text-base font-poppins text-gray-600">Password</label>
<input
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full border-b-2 focus:outline-none focus:border-primary focus:animate-pulse"
/>
{errors.password && (
<p className="text-red-500 text-base font-poppins">{errors.password}</p>
)}
</div>

<div className="flex items-center">
<input
type="checkbox"
id="rememberMe"
checked={rememberMe}
onChange={(e) => setRememberMe(e.target.checked)}
className="mr-2"
/>
<label htmlFor="rememberMe" className="text-base text-gray-700 font-poppins">
Remember me
</label>
</div>

<button
type="submit"
className="bg-primary text-white font-poppins w-full py-4 rounded-full transform transition duration-200 hover:scale-105 hover:shadow-lg"
>
Check In
</button>

<p className="text-gray-500 text-base mt-4">
By signing in, you agree to our Terms of Service and Privacy Policy.
</p>

{loginSuccessMessage && (
<p className="text-green-600 text-center font-poppins mt-4">{loginSuccessMessage}</p>
)}
</form>
</div>
</div>
);
};

export default Login;
