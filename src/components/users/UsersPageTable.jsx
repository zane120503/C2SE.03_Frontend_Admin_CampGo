/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Trash2, Lock, Unlock, UserCheck, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersPageTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [campsiteOwnerFilter, setCampsiteOwnerFilter] = useState('');

  const usersPerPage = 5;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:3000/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users); // load toàn bộ user
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter at frontend
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === ''
        ? true
        : roleFilter === 'Admin'
        ? user.isAdmin
        : !user.isAdmin;

    const matchesCampsiteOwner =
      campsiteOwnerFilter === ''
        ? true
        : campsiteOwnerFilter === 'true'
        ? user.isCampsiteOwner
        : !user.isCampsiteOwner;

    return matchesSearch && matchesRole && matchesCampsiteOwner;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

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
      <div className="flex justify-between mb-4 items-center">
        <div></div>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <select
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            value={roleFilter}
            className="bg-gray-700 text-white px-3 py-2 rounded-md"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
          </select>
          <select
            onChange={(e) => { setCampsiteOwnerFilter(e.target.value); setCurrentPage(1); }}
            value={campsiteOwnerFilter}
            className="bg-gray-700 text-white px-3 py-2 rounded-md"
          >
            <option value="">All Owners</option>
            <option value="true">Campsite Owner</option>
            <option value="false">Not Owner</option>
          </select>
          <div className="flex items-center gap-2">
            <Search className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search users..."
              className="bg-gray-700 text-white px-3 py-2 rounded-md"
            />
          </div>
        </div>
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
              <th className="px-4 py-2">Campsite Owner</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user._id} className="text-gray-100 border-t border-gray-700">
                <td className="px-4 py-2">{user.user_name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.isAdmin ? 'Admin' : 'Customer'}</td>
                <td className="px-4 py-2">{user.isCampsiteOwner ? 'Campsite Owner' : ''}</td>
                <td className="px-4 py-2">
                  <span className={user.isBlocked ? 'text-red-500' : 'text-green-500'}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {!user.isAdmin && (
                    <>
                      <button onClick={() => toggleAdmin(user._id)} className="text-blue-400">
                        <UserCheck size={18} />
                      </button>
                      <button onClick={() => toggleBlock(user._id)} className={user.isBlocked ? 'text-green-400' : 'text-red-400'}>
                        {user.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-400">
          Showing {paginatedUsers.length} of {filteredUsers.length} 
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-600 px-3 py-1 rounded"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-600 px-3 py-1 rounded"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UsersPageTable;
