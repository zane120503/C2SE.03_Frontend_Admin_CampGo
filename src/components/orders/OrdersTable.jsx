/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Eye, CheckCircle } from 'lucide-react';
import axios from 'axios';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const {
    user_id,
    shipping_address,
    products,
    total_amount,
    shipping_fee,
    payment_method,
    payment_status,
    delivery_status,
    order_date,
  } = order;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Order Details</h2>

        <section className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-200">Customer Information</h3>
          <div className="space-y-1 text-gray-100">
            <p><strong>Full Name:</strong> {shipping_address?.fullName || 'N/A'}</p>
            <p><strong>Email:</strong> {user_id?.email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {shipping_address?.phoneNumber || 'N/A'}</p>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-200">Shipping Address</h3>
          <div className="space-y-1 text-gray-100">
            <p>{shipping_address?.street}</p>
            <p>{shipping_address?.ward}, {shipping_address?.district}, {shipping_address?.city}</p>
            <p>{shipping_address?.country} - ZIP: {shipping_address?.zipCode}</p>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-200">Products</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-100">
            {products.map((item, index) => (
              <li key={index}>
                {item.name} – ${item.amount.toFixed(2)} x {item.quantity}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-200">Order Summary</h3>
          <div className="space-y-1 text-gray-100">
            <p><strong>Total Amount:</strong> ${total_amount?.toFixed(2)}</p>
            <p><strong>Shipping Fee:</strong> ${shipping_fee?.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> {payment_method}</p>
            <p><strong>Payment Status:</strong> {payment_status}</p>
            <p><strong>Delivery Status:</strong> {delivery_status}</p>
            <p><strong>Order Date:</strong> {new Date(order_date).toLocaleString()}</p>
          </div>
        </section>
      </div>
    </div>
  );
};


const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/admin/orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (response.data) {
          setOrders(response.data);
          setFilteredOrders(response.data);
        }
      } catch (err) {
        setError('Error fetching orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let temp = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(order =>
        order.shipping_address?.fullName?.toLowerCase().includes(term) ||
        order._id?.toLowerCase().includes(term)
      );
    }

    if (paymentFilter !== "All") {
      temp = temp.filter(order => order.payment_status === paymentFilter);
    }

    if (deliveryFilter !== "All") {
      temp = temp.filter(order => order.delivery_status === deliveryFilter);
    }

    setFilteredOrders(temp);
    setCurrentPage(1);
  }, [searchTerm, paymentFilter, deliveryFilter, orders]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const closeModal = () => setSelectedOrder(null);

  const handleAccept = async (orderId) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/admin/orders/${orderId}`,
        { waiting_confirmation: true },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.status === 200) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, waiting_confirmation: true } : order
        ));
      }
    } catch (error) {
      setApiError('Failed to accept order, please try again later.');
      console.error('Error accepting order:', error);
    }
  };

  return (
    <>
      <motion.div
        className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3'>
          <h2 className='text-xl font-semibold text-gray-100'>Orders List</h2>
          <div className='flex flex-wrap gap-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-2.5 text-gray-400' size={20} />
              <input
                type="text"
                placeholder='Search by Order ID or Email...'
                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>

            <select
              className='bg-gray-700 text-white rounded-lg px-3 py-2'
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            <select
              className='bg-gray-700 text-white rounded-lg px-3 py-2'
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
            >
              <option value="All">All Deliveries</option>
              <option value="Pending">Pending</option>
              <option value="Shipping">Shipping</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
          </div>
        </div>

        <div className='overflow-x-auto min-h-[400px]'>
          <table className='min-w-full divide-y divide-gray-400'>
            <thead>
              <tr>
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase'>Order ID</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase'>Full Name</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase'>Phone</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase'>Total</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase'>Payment</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase'>Delivery</th>
                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase'>Date</th>
                <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase'>WAITING</th>
                <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-500'>
              {displayedOrders.map((order) => (
                <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  <td className='px-6 py-4 text-sm text-gray-100'>{order._id}</td>
                  <td className='px-6 py-4 text-sm text-gray-100'>{order.shipping_address?.fullName || 'N/A'}</td>
                  <td className='px-6 py-4 text-sm text-gray-100'>{order.shipping_address?.phoneNumber || 'N/A'}</td>
                  <td className='px-6 py-4 text-sm text-gray-100'>${order.total_amount?.toFixed(2)}</td>
                  <td className='px-6 py-4 text-sm text-yellow-300'>{order.payment_status}</td>
                  <td className='px-6 py-4 text-sm text-blue-300'>{order.delivery_status}</td>
                  <td className='px-6 py-4 text-sm text-gray-300'>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td className='px-6 py-4 text-center text-sm text-green-500'>
                    {order.waiting_confirmation ? 'Accepted' : 'Pending'}
                  </td>
                  <td className='px-6 py-4 text-center text-sm'>
                    <div className="flex items-center gap-x-4">
                      <button
                        className='text-white hover:text-blue-400 transition duration-200'
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={20} />
                      </button>
                      {order.waiting_confirmation ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <button
                          onClick={() => handleAccept(order._id)}
                          className='text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition duration-200'
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {apiError && (
          <div className="text-red-500 text-center mt-4">
            {apiError}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
            className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={closeModal} />
      )}
    </>
  );
};

export default OrdersTable;
