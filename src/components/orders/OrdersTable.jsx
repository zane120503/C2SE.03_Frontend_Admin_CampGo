import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const OrdersTable = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatedStatus, setUpdatedStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalOrders, setTotalOrders] = useState(0);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const itemsPerPage = 6;

    // Fetch orders from API
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/api/v1/allorders?page=${currentPage}&limit=${itemsPerPage}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (response.data.success) {
                    setOrders(response.data.data.orders);
                    setFilteredOrders(response.data.data.orders);
                    setTotalOrders(response.data.data.pagination.totalOrders);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage]);

    // Add pagination function
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Modified handleOpenModal function
    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setUpdatedStatus(order.delivery_status); // Use delivery_status instead of deliveryStatus
        setShowModal(true);
    };

    // Add notification handler
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Modified handleSaveStatus function
    const handleSaveStatus = async () => {
        try {
            console.log('Selected order:', selectedOrder);
            console.log('Updated status:', updatedStatus);
            const response = await axios.put('http://localhost:3000/api/v1/updateorderstatus', {
                orderId: selectedOrder.id, // Change from id to _id
                status: updatedStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.data.success) {
                // Update local state
                const updatedOrders = filteredOrders.map(order =>
                    order.id === selectedOrder.id
                        ? { ...order, deliveryStatus: updatedStatus }
                        : order
                );
                setFilteredOrders(updatedOrders);
                setOrders(updatedOrders);
                setShowModal(false);
                showNotification('Order status updated successfully');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Error updating order status', 'error');
        }
    };

    // Search handler
    const SearchHandler = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        const filtered = orders.filter(order =>
            order.user?.user_name?.toLowerCase().includes(term) ||
            order.id?.toLowerCase().includes(term)
        );
        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    if (loading) return <div className="text-white">Loading orders...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            {/* Notification Toast */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${
                            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle className="text-white" size={20} />
                        ) : (
                            <AlertCircle className="text-white" size={20} />
                        )}
                        <span className="text-white font-medium">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header and Search - keeping existing code */}
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Orders List</h2>

                <div className='relative flex items-center'>
                    <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
                    <input
                        type="text"
                        placeholder='Search Product...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={SearchHandler}
                        value={searchTerm}
                    />
                </div>

            </div>

            {/* TABLE */}
            <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
                <table className='min-w-full divide-y divide-gray-400'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Order ID</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Customer</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Total</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Status</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Date</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Action</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-500'>
                        {filteredOrders.map((order) => (
                            <motion.tr
                                key={order._id} // Change from id to _id
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.1, delay: 0.2 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm font-semibold text-gray-100 tracking-wider'>{order.id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{order.user?.user_name}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>${order.totalAmount?.toFixed(2)}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className={`px-3 inline-flex rounded-full text-xs leading-5 font-semibold ${
                                        order.deliveryStatus === "Delivered" ? "bg-green-700 text-green-100" : 
                                        order.deliveryStatus === "Shipping" ? "bg-blue-700 text-blue-100" : 
                                        order.deliveryStatus === "Processing" ? "bg-yellow-700 text-yellow-100" : 
                                        order.deliveryStatus === "Cancelled" ? "bg-red-700 text-red-100" :
                                        order.deliveryStatus === "Returned" ? "bg-purple-700 text-purple-100" :
                                        "bg-gray-700 text-gray-100"
                                    }`}>
                                        {order.deliveryStatus}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <button onClick={() => handleOpenModal(order)}>
                                        <Eye className='text-blue-500 cursor-pointer' size={20} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal and pagination components remain the same */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <motion.div
                        className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-100 mb-5 tracking-wider">
                                Update Status for Order: {selectedOrder._id}
                            </h1>
                            <label className="text-sm text-gray-300">Customer's Name</label>
                            <h2 className="text-lg font-normal mb-4 max-w-[16rem] px-4 py-2 bg-gray-700 text-white rounded-md">
                                {selectedOrder.user?.user_name}
                            </h2>
                        </div>

                        {/* Responsive grid layout for dropdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col space-y-1">
                                <label className="text-sm text-gray-300">Current Order Status</label>
                                <select
                                    className=" max-w-xl px-4 py-2 bg-gray-700 text-white rounded-md"
                                    value={updatedStatus}
                                    onChange={(e) => setUpdatedStatus(e.target.value)}
                                >
                                    <option value="Processing">Processing</option>
                                    <option value="Shipping">Shipping</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Returned">Returned</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-5 space-x-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md"
                            >
                                <X size={22} />
                            </button>
                            <button
                                onClick={handleSaveStatus}
                                className="bg-blue-600 hover:bg-blue-800 text-white text-md px-3 py-3 rounded-md w-32"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className='flex flex-col md:flex-row justify-between mt-4 space-x-2 items-center'>
                <div className='flex items-center'>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === 1 ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className='mx-2 text-sm font-medium text-gray-100'>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === totalPages ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className='text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0'>Total Orders: {totalOrders}</div>
            </div>
        </motion.div>
    );
};

export default OrdersTable;
