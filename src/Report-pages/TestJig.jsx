import { useState, useEffect, useCallback } from 'react';
import 'boxicons/css/boxicons.min.css';

const TestJig = () => {
// Toggle this flag to show/hide maintenance mode
const maintenanceMode = true;

const [search, setSearch] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingJig, setEditingJig] = useState(null);
const [testJigs, setTestJigs] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
document.title = 'BGT - TestJig Details';
}, []);

const fetchJigs = useCallback(async () => {
setLoading(true);
try {
const response = await fetch('http://localhost:3000/testjig');
if (!response.ok) throw new Error('Network error');
const data = await response.json();
setTestJigs(data.testJigs);
} catch (error) {
console.error('Error fetching data:', error);
} finally {
setLoading(false);
}
}, []);

useEffect(() => {
if (!maintenanceMode) {
fetchJigs();
}
}, [fetchJigs, maintenanceMode]);

const handleSearchChange = (e) => setSearch(e.target.value);
const handleAddClick = () => {
setEditingJig(null);
setIsModalOpen(true);
};
const handleCloseModal = () => {
setIsModalOpen(false);
setEditingJig(null);
};

const handleEditClick = (jig) => {
setEditingJig(jig);
setIsModalOpen(true);
};

const handleSubmit = async (e) => {
e.preventDefault();
const form = e.target;
const description = form.description.value.trim();
const status = form.status.value;
const action = form.action.value.trim();

if (!description || !status || !action) {
alert('Please fill all fields');
return;
}

const payload = { description, status, action };
const endpoint = editingJig
? 'http://localhost:3000/testjig/update'
: 'http://localhost:3000/testjig/create';

try {
const response = await fetch(endpoint, {
method: editingJig ? 'PUT' : 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(
editingJig
? { ...payload, TestJigId: editingJig.TestJigId }
: payload
),
});

if (!response.ok) throw new Error('Failed to save');
await fetchJigs();
handleCloseModal();
} catch (error) {
console.error('Error saving:', error);
alert('An error occurred.');
}
};

const handleDelete = async (id) => {
try {
const response = await fetch(
`http://localhost:3000/testjig/delete/${id}`,
{
method: 'DELETE',
}
);
if (!response.ok) throw new Error('Delete failed');
await fetchJigs();
alert('Deleted successfully');
} catch (error) {
console.error('Delete error:', error);
alert('Error deleting record');
}
};

return (
<main>
{maintenanceMode ? (
<div className="flex items-center justify-center min-h-[70vh] text-center">
<div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-8 rounded-lg shadow">
<h2 className="text-2xl font-semibold mb-2">⚠️ Currently Under Maintenance</h2>
<p className="text-gray-700">We are working to improve your experience. Please check back later.</p>
</div>
</div>
) : (
<>
{/* Header */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded shadow mb-6 gap-4">
<h2 className="text-primary text-3xl text-gray-800 font-['Poppins']">TestJig Details</h2>
<div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
<div className="relative w-full sm:w-64">
<input
type="text"
placeholder="Search by description..."
className="w-full pl-10 pr-4 py-2 border rounded"
value={search}
onChange={handleSearchChange}
/>
<i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
</div>
<button
onClick={handleAddClick}
className="bg-primary font-[poppins] text-white px-4 py-2 rounded hover:bg-primary transition-colors flex items-center justify-center w-full sm:w-auto"
>
<i className="bx bx-plus mr-1"></i> Add TestJig
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
<th className="px-4 py-2 border font-poppins">TestJig ID</th>
<th className="px-4 py-2 border font-poppins">Description</th>
<th className="px-4 py-2 border font-poppins">Status</th>
<th className="px-4 py-2 border font-poppins">Action</th>
<th className="px-4 py-2 border font-poppins">Options</th>
</tr>
</thead>
<tbody>
{[...testJigs]
.filter((jig) =>
jig.description.toLowerCase().includes(search.toLowerCase())
)
.map((jig, index) => (
<tr key={jig.TestJigId} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
<td className="px-4 py-2 border text-center">{index + 1}</td>
<td className="px-4 py-2 border text-center">{jig.TestJigId}</td>
<td className="px-4 py-2 border text-center">{jig.description}</td>
<td className="px-4 py-2 border text-center">{jig.status}</td>
<td className="px-4 py-2 border text-center">{jig.action}</td>
<td className="px-4 py-2 border text-center space-x-2">
<button
onClick={() => handleEditClick(jig)}
className="text-blue-500 border border-blue-500 rounded px-2 py-1 hover:bg-blue-50"
>
<i className="bx bx-edit"></i>
</button>
<button
onClick={() => handleDelete(jig.TestJigId)}
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
<label htmlFor="description" className="block text-sm font-medium text-gray-700">
Description
</label>
<input
type="text"
id="description"
name="description"
defaultValue={editingJig?.description || ''}
required
className="block w-full border-2 rounded-lg px-4 py-3"
placeholder="Enter description"
/>
</div>

<div>
<label htmlFor="status" className="block text-sm font-medium text-gray-700">
Status
</label>
<select
id="status"
name="status"
required
defaultValue={editingJig?.status || ''}
className="block w-full border-2 rounded-lg px-4 py-3"
>
<option value="" disabled>Select status</option>
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>
</select>
</div>

<div>
<label htmlFor="action" className="block text-sm font-medium text-gray-700">
Action
</label>
<input
type="text"
id="action"
name="action"
defaultValue={editingJig?.action || ''}
required
className="block w-full border-2 rounded-lg px-4 py-3"
placeholder="Enter action"
/>
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
className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
Save
</button>
</div>
</form>
</div>
</div>
)}
</>
)}
</main>
);
};

export default TestJig;
