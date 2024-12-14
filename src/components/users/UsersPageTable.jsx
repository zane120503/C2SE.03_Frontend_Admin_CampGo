import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Search, Trash2, UserPlus, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersPageTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editUser, setEditUser] = useState({
        id: '',
        user_name: '',
        email: '',
        role: '',
        status: ''
    });
    const [newUser, setNewUser] = useState({
        user_name: '',
        email: '',
        password: '',
        role: 'Customer',
        status: 'Active'
    });

    // Fetch users data
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `http://localhost:3000/api/v1/users/list?page=${currentPage}&search=${searchTerm}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setUsers(response.data.data.users);
            console.log(response.data.data.users);
            setTotalPages(response.data.data.pagination.totalPages);
            setTotalUsers(response.data.data.pagination.totalUsers);
        } catch (error) {
            toast.error('Error fetching users');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm]);

    // Handle CRUD operations
    const handleAdd = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            
            // Send JSON directly instead of FormData
            await axios.post(
                'http://localhost:3000/api/v1/users',
                newUser,  // Send newUser object directly
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',  // Changed to JSON
                    }
                }
            );
            
            // Reset form after successful addition
            setNewUser({
                user_name: '',
                email: '',
                password: '',
                role: 'Customer',
                status: 'Active'
            });
            
            toast.success('User added successfully');
            setAddModalOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding user');
        }
    };

    const handleEdit = async (user) => {
        setEditUser({
            id: user.id,
            user_name: user.user_name,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();

            // Append user data to formData
            Object.keys(editUser).forEach(key => {
                formData.append(key, editUser[key]);
            });

            await axios.put(
                `http://localhost:3000/api/v1/users/${editUser.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            toast.success('User updated successfully');
            setEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating user');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(
                    `http://localhost:3000/api/v1/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(
                `http://localhost:3000/api/v1/blockuser/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success('User blocked successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error blocking user');
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(
                `http://localhost:3000/api/v1/unblockuser/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success('User unblocked successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error unblocking user');
        }
    };

    // Search handler
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <motion.div className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'>
            {/* Header with search */}
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Users List</h2>
                <div className='flex gap-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 text-gray-400' size={20} />
                        <input
                            type="text"
                            placeholder='Search users...'
                            className='pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-gray-100'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                    >
                        <UserPlus size={20} />
                        Add User
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className='animate-spin text-purple-600' size={40} />
                </div>
            ) : (
                /* Table content */
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-700'>
                        <thead>
                            <tr>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Name</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Email</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Role</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Status</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-700'>
                            {users.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1.1, delay: 0.2 }}
                                >
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='flex items-center'>
                                            <div className='flex-shrink-0 h-10 w-10'>
                                                <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                                    {user.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div className='ml-4'>
                                                <div className='text-sm font-semibold text-gray-100 tracking-wider'>{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='text-sm text-gray-300'>{user.email}</div>
                                    </td>


                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <span className={`px-4 inline-flex rounded-full text-xs bg-gray-200 leading-5 font-semibold 
                                            ${user.role === "Admin" ? "text-green-700"
                                                : user.role === "Moderator" ? "text-teal-600"
                                                    : user.role === "Customer" ? "text-orange-600"
                                                        : "text-gray-100"}`}>
                                            {user.role}
                                        </span>
                                    </td>


                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <span className={`px-4 inline-flex rounded-full text-xs leading-5 font-semibold 
                                            ${user.status === "Active" ? "bg-green-700 text-green-100"
                                                : "bg-red-700 text-red-100"}`}>
                                            {user.status}
                                        </span>
                                    </td>


                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <button onClick={() => setAddModalOpen(true)} className='text-green-500 hover:text-green-600'>
                                            <UserPlus size={20} />
                                        </button>
                                        <button className='text-indigo-400 hover:text-indigo-300 mr-3 ml-3' onClick={() => handleEdit(user)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className='text-red-400 hover:text-red-300' onClick={() => handleDelete(user.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className='mt-4 flex justify-between items-center'>
                <span className='text-gray-400'>
                    Showing {users.length} of {totalUsers} users
                </span>
                <div className='flex gap-2'>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className='p-2 bg-gray-700 rounded-lg disabled:opacity-50'
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className='p-2 bg-gray-700 rounded-lg disabled:opacity-50'
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <motion.div
                        className='bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-xl'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >

                        <h1 className='text-2xl font-semibold text-gray-100 mb-3 underline tracking-wider'>Edit User</h1>

                        {/* Responsive grid layout for fields */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Name</label>
                                <input
                                    type='text'
                                    value={editUser.user_name}
                                    onChange={(e) => setEditUser({ ...editUser, user_name: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Email</label>
                                <input
                                    type='email'
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Role</label>
                                <input
                                    type='text'
                                    value={editUser.role}
                                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Status</label>
                                <input
                                    type='text'
                                    value={editUser.status}
                                    onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                        </div>

                        <div className='flex justify-end mt-5 space-x-2'>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className='bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md'
                            >
                                <X size={22} />
                            </button>
                            <button
                                onClick={handleUpdate}
                                className='bg-blue-600 hover:bg-blue-800 text-white text-md px-4 py-2 rounded-md w-24'
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <motion.div
                        className='bg-gray-800 rounded-lg shadow-lg p-6 max-w-xl w-full'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 className='text-2xl font-semibold text-gray-100 mb-6 underline tracking-wider'>Add New User</h1>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Name</label>
                                <input
                                    type="text"
                                    value={newUser.user_name}
                                    onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
                                    placeholder='User Name'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder='Email'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>User Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Moderator">Moderator</option>
                                </select>
                            </div>
                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'> User Password</label>
                                <input
                                    type="text"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder='Password'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>
                        </div>

                        <div className='flex justify-end mt-6 space-x-2'>
                            <button onClick={() => setAddModalOpen(false)} className='bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md'>
                                <X size={22} />
                            </button>
                            <button onClick={handleAdd} className='bg-blue-600 hover:bg-blue-800 text-white text-md px-4 py-3 rounded-md w-28'>
                                Add User
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

        </motion.div>
    );
};

export default UsersPageTable;
