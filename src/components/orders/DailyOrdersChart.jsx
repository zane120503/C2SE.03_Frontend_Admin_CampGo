import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const DailyOrdersChart = () => {
    const [dailyOrders, setDailyOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDailyOrders = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                const response = await axios.get(
                    'http://localhost:3000/api/admin/orders/daily',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setDailyOrders(response.data.data)
            } catch (error) {
                console.error('Error fetching daily orders:', error)
                toast.error('Failed to load daily orders data')
            } finally {
                setLoading(false)
            }
        }

        fetchDailyOrders()
    }, [])

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h2 className='text-xl font-semibold mb-4 text-gray-100'>
                Daily Orders
            </h2>

            <div className='h-80'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <LineChart data={dailyOrders}>
                        <CartesianGrid strokeDasharray={'3 3'} stroke='#4b5563' />
                        <XAxis dataKey={"date"} stroke='#9ca3af' />
                        <YAxis stroke='#9ca3af' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 45, 55, 0.8)",
                                borderColor: "#4b5563"
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                        />
                        <Line
                            type="monotone"
                            dataKey='Orders'
                            stroke='#6366f1'
                            strokeWidth={3}
                            dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8, strokeWidth: 2 }}
                        />
                        <Legend />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default DailyOrdersChart