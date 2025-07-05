import { useState, useEffect, useCallback } from 'react';
import 'boxicons/css/boxicons.min.css';

const API_BASE = import.meta.env.VITE_API || 'http://192.168.29.50:4000';

const TestJig = () => {
const [search, setSearch] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingJig, setEditingJig] = useState(null);
const [testJigs, setTestJigs] = useState([]);
const [loading, setLoading] = useState(true);
const [maintenanceMode, setMaintenanceMode] = useState(false);
const [notification, setNotification] = useState({ visible: false, message: '', type: 'success', autoClose: true });

useEffect(() => {
document.title = 'BGT - TestJig Details';
}, []);

const showNotification = (message, type = 'success', autoClose = true) => {
setNotification({ visible: true, message, type, autoClose });

if (autoClose) {
setTimeout(() => {
setNotification({ visible: false, message: '', type: 'success', autoClose: true });
}, 3000);
}
};

const fetchJigs = useCallback(async () => {
setLoading(true);
try {
const response = await fetch(`${API_BASE}/user/getTestjig`);
if (!response.ok) throw new Error('Network error');
const data = await response.json();
setTestJigs(data.users);
setMaintenanceMode(false);
} catch (error) {
console.error('Error fetching data:', error);
showNotification('Failed to load test jigs', 'error');
setMaintenanceMode(true);
} finally {
setLoading(false);
}
}, []);

useEffect(() => {
fetchJigs();
}, [fetchJigs]);

useEffect(() => {
if (maintenanceMode) {
const retry = setInterval(() => {
fetchJigs();
}, 10000);
return () => clearInterval(retry);
}
}, [maintenanceMode, fetchJigs]);

const handleAddClick = () => {
setEditingJig(null);
setIsModalOpen(true);
};

const handleEditClick = (jig) => {
setEditingJig(jig);
setIsModalOpen(true);
};

const handleCloseModal = () => {
setIsModalOpen(false);
setEditingJig(null);
};

const handleSubmit = async (e) => {
e.preventDefault();
const form = e.target;
const TestJigNumber = form.TestJigNumber.value.trim();
const JigDescription = form.JigDescription.value.trim();
const JigStatus = form.JigStatus.value;

if (!TestJigNumber || !JigDescription || !JigStatus) {
showNotification('Please fill all fields', 'error');
return;
}

const payload = { TestJigNumber, JigDescription, JigStatus };
const endpoint = editingJig
? `${API_BASE}/user/putTestjig`
: `${API_BASE}/user/postTestjig`;

try {
const response = await fetch(endpoint, {
method: editingJig ? 'PUT' : 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(editingJig ? { ...payload, id: editingJig.id } : payload),
});

if (!response.ok) throw new Error('Failed to save');
await fetchJigs();
handleCloseModal();
showNotification('TestJig saved successfully', 'success', false);
} catch (error) {
console.error('Error saving:', error);
showNotification('An error occurred while saving TestJig', 'error');
}
};

const handleDelete = async (id) => {
try {
const response = await fetch(`${API_BASE}/user/deleteTestjig/${id}`, {
method: 'DELETE',
});
if (!response.ok) throw new Error('Delete failed');
await fetchJigs();
showNotification('TestJig deleted successfully', 'success', false); // <-- Manual close
} catch (error) {
console.error('Delete error:', error);
showNotification('Error deleting TestJig', 'error', false); // <-- Manual close
}
};

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
<h2 className="text-primary text-3xl font-['Poppins']">TestJig Details</h2>
<div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
<div className="relative w-full sm:w-64">
<input
type="text"
placeholder="Search by description..."
className="w-full pl-10 pr-4 py-2 border rounded"
value={search}
onChange={(e) => setSearch(e.target.value)}
/>
<i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
</div>
<button
onClick={handleAddClick}
className="bg-primary text-white px-4 py-2 rounded hover:bg-primary transition-colors flex items-center justify-center w-full sm:w-auto"
>
<i className="bx bx-plus mr-1"></i> Add TestJig
</button>
</div>
</div>

{/* Table */}
<div className="bg-white rounded shadow overflow-x-auto">
{loading ? (
<div className="text-center py-10 text-gray-500">Loading test jigs...</div>
) : (
<table className="w-full text-sm border border-gray-200">
<thead className="bg-primary text-white">
<tr>
<th className="px-4 py-2 border font-poppins">S.No</th>
<th className="px-4 py-2 border font-poppins">TestJig Number</th>
<th className="px-4 py-2 border font-poppins">Description</th>
<th className="px-4 py-2 border font-poppins">Status</th>
<th className="px-4 py-2 border font-poppins">Actions</th>
</tr>
</thead>
<tbody>
{[...testJigs]
.filter((jig) =>
jig.JigDescription.toLowerCase().includes(search.toLowerCase())
)
.map((jig, index) => (
<tr key={jig.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
<td className="px-4 py-2 border text-center">{index + 1}</td>
<td className="px-4 py-2 border text-center">{jig.TestJigNumber}</td>
<td className="px-4 py-2 border text-center">{jig.JigDescription}</td>
<td className="px-4 py-2 border text-center">
<span
className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
jig.JigStatus === 'Active'
? 'bg-green-100 text-green-600'
: 'bg-red-100 text-red-600'
}`}
>
{jig.JigStatus}
</span>
</td>
<td className="px-4 py-2 border text-center space-x-2">
<button
onClick={() => handleEditClick(jig)}
className="text-blue-500 border border-blue-500 rounded px-2 py-1 hover:bg-blue-50"
>
<i className="bx bx-edit"></i>
</button>
<button
onClick={() => handleDelete(jig.id)}
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
{editingJig ? 'Edit TestJig' : 'Add TestJig'}
</h3>
</div>

<form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
<div>
<label htmlFor="TestJigNumber" className="block text-sm font-medium text-gray-700">
TestJig Number
</label>
<input
type="text"
id="TestJigNumber"
name="TestJigNumber"
defaultValue={editingJig?.TestJigNumber || ''}
required
className="block w-full border-2 rounded-lg px-4 py-3"
placeholder="Enter TestJig Number"
/>
</div>

<div>
<label htmlFor="JigDescription" className="block text-sm font-medium text-gray-700">
Description
</label>
<input
type="text"
id="JigDescription"
name="JigDescription"
defaultValue={editingJig?.JigDescription || ''}
required
className="block w-full border-2 rounded-lg px-4 py-3"
placeholder="Enter description"
/>
</div>

<div>
<label htmlFor="JigStatus" className="block text-sm font-medium text-gray-700">
Status
</label>
<select
id="JigStatus"
name="JigStatus"
defaultValue={editingJig?.JigStatus || ''}
required
className="block w-full border-2 rounded-lg px-4 py-3"
>
<option value="" disabled>Select status</option>
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>
</select>
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
className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary"
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
{!notification.autoClose && (
<button
onClick={() => setNotification({ visible: false, message: '', type: 'success', autoClose: true })}
className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
OK
</button>
)}
</div>
</div>
)}
</main>
);
};

export default TestJig;
