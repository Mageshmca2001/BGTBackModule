import { useState, useEffect, useCallback } from 'react';
import 'boxicons/css/boxicons.min.css';

const UsersDetails = () => {
const [search, setSearch] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingUser, setEditingUser] = useState(null);
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
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
const response = await fetch('http://localhost:5000/user/getusers');
if (!response.ok) throw new Error('Network response was not ok');
const data = await response.json();
setUsers(data.users);
} catch (error) {
console.error('Error fetching user data:', error);
showNotification('Failed to load users', 'error');
} finally {
setLoading(false);
}
}, []);

useEffect(() => {
fetchUsers();
}, [fetchUsers]);

const handleSearchChange = useCallback((e) => {
setSearch(e.target.value);
}, []);

const handleAddUserClick = useCallback(() => {
setEditingUser(null);
setIsModalOpen(true);
}, []);

const handleCloseModal = useCallback(() => {
setIsModalOpen(false);
setEditingUser(null);
}, []);

const handleEditUserClick = (user) => {
setEditingUser(user);
setIsModalOpen(true);
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
? `http://localhost:5000/user/putusers`
: `http://localhost:5000/user/addusers`;

try {
const response = await fetch(endpoint, {
method: editingUser ? 'PUT' : 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(editingUser ? { ...userPayload, id: editingUser.id } : userPayload),
});

if (!response.ok) throw new Error('Failed to save user');

await fetchUsers();
handleCloseModal();
showNotification('User saved successfully', 'success');
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

const response = await fetch(
`http://localhost:5000/user/deleteusers/${userToDelete.id}`,
{ method: 'DELETE' }
);

if (!response.ok) throw new Error('Failed to delete user');

await fetchUsers();
showNotification('User deleted successfully', 'success');
} catch (error) {
console.error('Error deleting user:', error);
showNotification('An error occurred while deleting the user.', 'error');
}
};

return (
<main>
{/* Header */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded shadow mb-6 gap-4">
<h2 className="text-primary text-3xl text-gray-800 font-['Poppins']">Users Details</h2>
<div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
<div className="relative w-full sm:w-64">
<input
type="text"
placeholder="Search users..."
className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
value={search}
onChange={handleSearchChange}
/>
<i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
</div>
<button
onClick={handleAddUserClick}
className="bg-primary font-[poppins] text-white px-4 py-2 rounded hover:bg-primary transition-colors flex items-center justify-center w-full sm:w-auto"
>
<i className="bx bx-plus mr-1"></i> Add User
</button>
</div>
</div>

{/* Table */}
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
.filter((user) =>
user.username.toLowerCase().includes(search.toLowerCase())
)
.sort((a, b) => a.username.localeCompare(b.username))
.map((user, index) => (
<tr key={user.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
<td className="px-4 py-2 border text-center">{index + 1}</td>
<td className="px-4 py-2 border text-center">{user.username}</td>
<td className="px-4 py-2 border text-center">{user.password}</td>
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
<label htmlFor="role" className="block text-sm font-medium text-gray-700">Designation</label>
<div className="relative">
<i className="bx bx-user-circle absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
<select
id="role"
name="role"
required
defaultValue={editingUser?.role || ''}
className="block w-full pl-12 pr-10 py-3 border-2 rounded-lg"
>
<option value="" disabled>Select designation</option>
<option value="Planthead">Planthead</option>
<option value="Linehead">Linehead</option>
<option value="TestingEngineer">TestingEngineer</option>
</select>
</div>
</div>


<div>
<label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
<div className="relative">
<i className="bx bx-toggle-right absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
<select
id="status"
name="status"
required
defaultValue={editingUser?.status || ''}
className="block w-full pl-12 pr-10 py-3 border-2 rounded-lg"
>
<option value="" disabled>Select status</option>
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>
</select>
</div>
</div>

<div className="flex justify-end space-x-4 pt-6">
<button
type="button"
onClick={handleCloseModal}
className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
>
Cancel
</button>
<button
type="submit"
className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors flex items-center justify-center"
>
Save
</button>
</div>
</form>
</div>
</div>
)}

{/* Notification Modal */}
{notification.visible && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
<div
className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center transform transition-all duration-300 ease-out
${notification.visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4'}
${notification.type === 'success' ? 'border-green-500' : 'border-red-500'} border-t-4`}
>
<h2
className={`text-lg font-semibold mb-2 ${
notification.type === 'success' ? 'text-green-600' : 'text-red-600'
}`}
>
{notification.type === 'success' ? 'Success' : 'Error'}
</h2>
<p className="text-gray-800">{notification.message}</p>
<button
onClick={() =>
setNotification({ visible: false, message: '', type: 'success' })
}
className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
