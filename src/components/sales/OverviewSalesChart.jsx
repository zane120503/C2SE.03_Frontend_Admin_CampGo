import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import axios from 'axios';

const OverviewSalesChart = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState("This Year");

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    useEffect(() => {
        const fetchSalesOverview = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:3000/api/v1/sales-overview', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (response.data.success) {
                    const formattedData = response.data.data.monthlySales.map(item => ({
                        month: months[item.month - 1],
                        Sales: item.revenue,
                        Orders: item.orders
                    }));
                    setSalesData(formattedData);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching sales overview:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesOverview();
    }, []);

    if (loading) return <div className="text-white">Loading sales overview...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 text-center lg:col-span-2 border border-gray-700"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
        >
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold mb-4 text-gray-100'>
                    Sales Overview
                </h2>

                <select
                    className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600'
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                >
                    <option>This Month</option>
                    <option>This Quarter</option>
                    <option>This Year</option>
                </select>
            </div>

            <div className='w-full h-80'>
                <ResponsiveContainer>
                    <AreaChart data={salesData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey="month" stroke='#9ca3af' />
                        <YAxis stroke='#9ca3af' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4b5563",
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="Sales" 
                            stroke='#8b5cf6' 
                            fill='#8b5cf6' 
                            fillOpacity={0.3}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="Orders" 
                            stroke='#10b981' 
                            fill='#10b981' 
                            fillOpacity={0.3}
                        />
                        <Legend />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default OverviewSalesChart;
