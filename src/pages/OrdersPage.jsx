import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards'
import OrdersTable from '../components/orders/OrdersTable'

const OrdersPage = () => {
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                console.log("token", token)
                const response = await axios.get(
                    'http://localhost:3000/api/admin/orders', // Keep the existing API endpoint for orders
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                console.log("orders", response.data) // List of orders
                setOrderStats({
                    totalOrders: response.data.length, // Total orders is simply the length of the array
                })
                
            } catch (error) {
                console.error('Error fetching orders:', error)
                toast.error('Failed to load order statistics')
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="Orders Details" />

            {/* STAT DATA */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards name="Total Orders" icon={ShoppingBag} value={orderStats.totalOrders} color="#6366f1" />
                </motion.div>

                {/* ORDERS TABLE */}
                <OrdersTable />
            </main>
        </div>
    )
}

export default OrdersPage
