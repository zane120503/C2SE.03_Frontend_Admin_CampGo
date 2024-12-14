import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, DollarSign, ShoppingBag } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards'
import DailyOrdersChart from "../components/orders/DailyOrdersChart"
import StatusDistributionChart from '../components/orders/StatusDistributionChart'
import OrdersTable from '../components/orders/OrdersTable'

const OrdersPage = () => {
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrderStats = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                console.log("token", token)
                const response = await axios.get(
                    'http://localhost:3000/api/v1/orders/stats',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                console.log("orderStats", response.data.stats)
                setOrderStats(response.data.stats)
                
            } catch (error) {
                console.error('Error fetching order stats:', error)
                toast.error('Failed to load order statistics')
            } finally {
                setLoading(false)
            }
        }
        fetchOrderStats()
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
                    <StatCards name="Pending Orders" icon={Clock} value={orderStats.pendingOrders} color="#10b981" />
                    <StatCards name="Completed Orders" icon={CheckCircle} value={orderStats.completedOrders} color="#f59e0b" />
                    <StatCards name="Total Revenue" icon={DollarSign} value={orderStats.totalRevenue} color="#ef4444" />
                </motion.div>

                {/* DAILY ORDERS and ORDER STATUS DISTRIBUTION CHART */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7'>
                    <DailyOrdersChart />
                    <StatusDistributionChart />
                </div>

                {/* ORDERS TABLE */}
                <OrdersTable />
            </main>
        </div>
    )
}

export default OrdersPage