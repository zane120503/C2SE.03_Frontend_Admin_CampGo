import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Trash2, UserPlus, Loader2, Lock, Unlock, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersPageTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    user_name: '',
    email: '',
    password: '',
    role: 'Customer'
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:3000/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtered = response.data.filter(user =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const itemsPerPage = 5;
      const start = (currentPage - 1) * itemsPerPage;
      const paginated = filtered.slice(start, start + itemsPerPage);

      setUsers(paginated);
      setTotalUsers(filtered.length);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        ...newUser,
        isAdmin: newUser.role === 'Admin'
      };
      await axios.post(`http://localhost:3000/api/admin/users`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('User added successfully');
      setAddModalOpen(false);
      setNewUser({ user_name: '', email: '', password: '', role: 'Customer' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:3000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const toggleBlock = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`http://localhost:3000/api/admin/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Block/Unblock failed');
    }
  };

  const toggleAdmin = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`http://localhost:3000/api/admin/users/${id}/admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin status toggled');
      fetchUsers();
    } catch (error) {
      toast.error('Toggle admin failed');
    }
  };

  return (
    <motion.div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700">
      <div className="flex justify-between mb-4">
        <div className="flex gap-3">
          <Search className="text-gray-400 mt-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search users..."
            className="bg-gray-700 text-white px-3 py-2 rounded-md"
          />
        </div>
        <button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          <UserPlus className="inline mr-2" /> Add User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-600">
          <thead>
            <tr className="text-gray-300 text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="text-gray-100 border-t border-gray-700">
                <td className="px-4 py-2">{user.user_name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.isAdmin ? 'Admin' : 'Customer'}</td>
                <td className="px-4 py-2">{user.status}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => toggleAdmin(user._id)} className="text-blue-400">
                    <UserCheck size={18} /> {/* Updated to UserCheck */}
                  </button>
                  <button onClick={() => toggleBlock(user._id)} className="text-yellow-400">
                    {user.status === 'Active' ? <Lock size={18} /> : <Unlock size={18} />}
                  </button>
                  <button onClick={() => handleDelete(user._id)} className="text-red-500">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-400">Showing {users.length} of {totalUsers}</span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="bg-gray-600 px-3 py-1 rounded">
            <ChevronLeft />
          </button>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="bg-gray-600 px-3 py-1 rounded">
            <ChevronRight />
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <motion.div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 className="text-white text-xl mb-4">Add New User</h2>
            <input
              type="text"
              placeholder="User Name"
              value={newUser.user_name}
              onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
              className="w-full mb-2 px-4 py-2 bg-gray-700 text-white rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full mb-2 px-4 py-2 bg-gray-700 text-white rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full mb-2 px-4 py-2 bg-gray-700 text-white rounded"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full mb-4 px-4 py-2 bg-gray-700 text-white rounded"
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded">
                Cancel
              </button>
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded">
                Add
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UsersPageTable;
