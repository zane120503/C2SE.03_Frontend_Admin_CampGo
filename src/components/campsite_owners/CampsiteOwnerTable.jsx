/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Trash2, Loader2, Lock, Unlock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CampsiteOwnerTable = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:3000/api/admin/requests`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          search: searchTerm,
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      setOwners(response.data?.data ?? []); 
      setTotalPages(response.data?.totalPages ?? 1);   
    } catch (error) {
      toast.error('Error fetching owner requests');
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campsite owner?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:3000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Owner deleted');
      fetchOwners();
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
      fetchOwners();
    } catch (error) {
      toast.error('Block/Unblock failed');
    }
  };

  const handleRequestApproval = async (id, action) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:3000/api/admin/handle-request', { userId: id, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchOwners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing request');
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
            placeholder="Search campsite owners..."
            className="bg-gray-700 text-white px-3 py-2 rounded-md"
          />
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
              <th className="px-4 py-2">Phone Number</th>
              <th className="px-4 py-2">Campsite Owner</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(owners) && owners.map((owner) => {
              const user = owner; // Accessing user data from the 'data' field
              return (
                <tr key={user._id} className="text-gray-100 border-t border-gray-700">
                  <td className="px-4 py-2">{user.user_name || 'N/A'}</td>
                  <td className="px-4 py-2">{user.email || 'N/A'}</td>
                  <td className="px-4 py-2">{user.phone_number || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <span className={owner.campsiteOwnerRequest?.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}>
                      {owner.campsiteOwnerRequest?.status === 'pending' ? 'Pending' : 'Approved'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={user.isBlocked ? 'text-red-500' : 'text-green-500'}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => toggleBlock(user.id)}
                      className={user.isBlocked ? 'text-green-400' : 'text-red-400'}
                    >
                      {user.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    {owner.campsiteOwnerRequest?.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRequestApproval(user.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestApproval(user.id, 'reject')}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-400">Showing {owners.length} of {totalPages * 5}</span>
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

export default CampsiteOwnerTable;
