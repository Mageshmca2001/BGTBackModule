import { useState, useEffect, useCallback } from 'react';
import 'boxicons/css/boxicons.min.css';

const API_BASE = import.meta.env.VITE_API || 'http://localhost:5000';

const UsersDetails = () => {
const [search, setSearch] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingUser, setEditingUser] = useState(null);
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [maintenanceMode, setMaintenanceMode] = useState(false);
const [notification, setNotification] = useState({ visible: false, message: '', type: 'success' });

useEffect(() => {
document.title = 'BGT - User-Details';
}, []);

const showNotification = (message, type = 'success') => {
setNotification({ visible: true, message, type });
setTimeout(() => {
setNotification({ visible: false, message: '', type: 'success' });
}, 3000);
};

const fetchUsers = useCallback(async () => {
setLoading(true);
try {
const response = await fetch(`${API_BASE}/user/getusers`);
if (!response.ok) throw new Error('Network response was not ok');
const data = await response.json();
setUsers(data.users);
setMaintenanceMode(false);
} catch (error) {
console.error('Error fetching user data:', error);
showNotification('Failed to load users', 'error');
setMaintenanceMode(true);
} finally {
setLoading(false);
}
}, []);

useEffect(() => {
fetchUsers();
}, [fetchUsers]);

useEffect(() => {
if (maintenanceMode) {
const retry = setInterval(() => {
fetchUsers();
}, 10000);
return () => clearInterval(retry);
}
}, [maintenanceMode, fetchUsers]);

const handleAddUserClick = () => {
setEditingUser(null);
setIsModalOpen(true);
};

const handleEditUserClick = (user) => {
setEditingUser(user);
setIsModalOpen(true);
};

const handleCloseModal = () => {
setIsModalOpen(false);
setEditingUser(null);
};

const handleSubmit = async (e) => {
e.preventDefault();
const form = e.target;
const username = form.username.value.trim();
const password = form.password.value.trim();
const role = form.role.value;
const status = form.status.value;

if (!username || !password || !role || !status) {
showNotification('Please fill all fields', 'error');
return;
}

const userPayload = { username, password, role, status };
const endpoint = editingUser
? `${API_BASE}/user/putusers`
: `${API_BASE}/user/addusers`;

try {
const response = await fetch(endpoint, {
method: editingUser ? 'PUT' : 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(editingUser ? { ...userPayload, id: editingUser.id } : userPayload),
});

if (!response.ok) throw new Error('Failed to save user');
await fetchUsers();
handleCloseModal();
showNotification('User saved successfully');
} catch (error) {
console.error('Error saving user data:', error);
showNotification('An error occurred while saving user data.', 'error');
}
};

const deleteUserByUsername = async (usernameToDelete) => {
try {
const userToDelete = users.find((user) => user.username === usernameToDelete);
if (!userToDelete) {
showNotification('User not found', 'error');
return;
}

const response = await fetch(`${API_BASE}/user/deleteusers/${userToDelete.id}`, {
method: 'DELETE',
});

if (!response.ok) throw new Error('Failed to delete user');
await fetchUsers();
showNotification('User deleted successfully');
} catch (error) {
console.error('Error deleting user:', error);
showNotification('An error occurred while deleting the user.', 'error');
}
};

// -----------------------------
// MAINTENANCE MODE RENDER BLOCK
// -----------------------------
if (maintenanceMode) {
return (
<div className="flex items-center justify-center min-h-screen text-center">
<div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-8 rounded-lg shadow">
<h2 className="text-2xl font-semibold mb-2">⚠️ Currently Under Maintenance</h2>
<p className="text-gray-700">We’re working to restore the service. Please check back later.</p>
</div>
</div>
);
}

return (
<main>
{/* Header */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded shadow mb-6 gap-4">
<h2 className="text-primary text-3xl font-['Poppins']">Users Details</h2>
<div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
<div className="relative w-full sm:w-64">
<input
type="text"
placeholder="Search users..."
className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
value={search}
onChange={(e) => setSearch(e.target.value)}
/>
<i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
</div>
<button
onClick={handleAddUserClick}
className="bg-primary text-white px-4 py-2 rounded hover:bg-primary transition-colors flex items-center justify-center w-full sm:w-auto"
>
<i className="bx bx-plus mr-1"></i> Add User
</button>
</div>
</div>

{/* User Table */}
<div className="bg-white rounded shadow overflow-x-auto">
{loading ? (
<div className="text-center py-10 text-gray-500">Loading users...</div>
) : (
<table className="w-full text-sm border border-gray-200">
<thead className="bg-primary text-white">
<tr>
<th className="px-4 py-2 border font-poppins">S.No</th>
<th className="px-4 py-2 border font-poppins">Username</th>
<th className="px-4 py-2 border font-poppins">Password</th>
<th className="px-4 py-2 border font-poppins">Role</th>
<th className="px-4 py-2 border font-poppins">Status</th>
<th className="px-4 py-2 border font-poppins">Actions</th>
</tr>
</thead>
<tbody>
{[...users]
.filter((user) => user.username.toLowerCase().includes(search.toLowerCase()))
.sort((a, b) => a.username.localeCompare(b.username))
.map((user, index) => (
<tr key={user.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
<td className="px-4 py-2 border text-center">{index + 1}</td>
<td className="px-4 py-2 border text-center">{user.username}</td>
<td className="px-4 py-2 border text-center">••••••</td>
<td className="px-4 py-2 border text-center">{user.role}</td>
<td className="px-4 py-2 border text-center">
<span
className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
user.status === 'Active'
? 'bg-green-100 text-green-600'
: 'bg-red-100 text-red-600'
}`}
>
{user.status}
</span>
</td>
<td className="px-4 py-2 border text-center space-x-2">
<button
onClick={() => handleEditUserClick(user)}
className="text-blue-500 border border-blue-500 rounded px-2 py-1 hover:bg-blue-50"
>
<i className="bx bx-edit"></i>
</button>
<button
onClick={() => deleteUserByUsername(user.username)}
className="text-red-500 border border-red-500 rounded px-2 py-1 hover:bg-red-50"
>
<i className="bx bx-trash"></i>
</button>
</td>
</tr>
))}
</tbody>
</table>
)}
</div>

{/* Modal */}
{isModalOpen && (
<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
<div className="px-7 py-6 border-b border-gray-200">
<h3 className="text-xl font-semibold text-gray-900">
{editingUser ? 'Edit User' : 'Add User'}
</h3>
</div>

<form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
<div>
<label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
<div className="relative">
<i className="bx bx-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
<input
type="text"
id="username"
name="username"
defaultValue={editingUser?.username || ''}
required
className="block w-full pl-12 pr-4 py-3 border-2 rounded-lg"
placeholder="Enter username"
/>
</div>
</div>

<div>
<label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
<div className="relative">
<i className="bx bx-lock-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
<input
type="password"
id="password"
name="password"
defaultValue={editingUser?.password || ''}
required
className="block w-full pl-12 pr-4 py-3 border-2 rounded-lg"
placeholder="Enter password"
/>
</div>
</div>

<div>
<label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
<select
id="role"
name="role"
defaultValue={editingUser?.role || ''}
className="block w-full border-2 pl-3 pr-10 py-3 rounded-lg"
required
>
<option value="" disabled>Select role</option>
<option value="Planthead">Planthead</option>
<option value="Linehead">Linehead</option>
<option value="TestingEngineer">TestingEngineer</option>
</select>
</div>

<div>
<label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
<select
id="status"
name="status"
defaultValue={editingUser?.status || ''}
className="block w-full border-2 pl-3 pr-10 py-3 rounded-lg"
required
>
<option value="" disabled>Select status</option>
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>
</select>
</div>

<div className="flex justify-end space-x-4 pt-4">
<button
type="button"
onClick={handleCloseModal}
className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
>
Cancel
</button>
<button
type="submit"
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
>
Save
</button>
</div>
</form>
</div>
</div>
)}

{/* Notification */}
{notification.visible && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
<div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center border-t-4 ${
notification.type === 'success' ? 'border-green-500' : 'border-red-500'
}`}>
<h2 className={`text-lg font-semibold ${
notification.type === 'success' ? 'text-green-600' : 'text-red-600'
}`}>
{notification.type === 'success' ? 'Success' : 'Error'}
</h2>
<p className="text-gray-800 mt-2">{notification.message}</p>
<button
onClick={() => setNotification({ visible: false, message: '', type: 'success' })}
className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
OK
</button>
</div>
</div>
)}
</main>
);
};

export default UsersDetails;
