import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import axios from 'axios'

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

const SalesbyCategoryChart = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/category/distribution', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                
                if (response.data.success) {
                    // Transform data for the pie chart
                    const formattedData = response.data.data.distribution.map(item => ({
                        name: item.category,
                        Value: item.totalRevenue,
                        percentage: item.percentage
                    }));
                    setSalesData(formattedData);
                    setSummary(response.data.data.summary);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching sales data:', err);
                setError('Failed to load sales data');
                setLoading(false);
            }
        };

        fetchSalesData();
    }, []);

    if (loading) return (
        <div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700">
            <p className="text-gray-100">Loading...</p>
        </div>
    );

    if (error) return (
        <div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700">
            <p className="text-red-500">{error}</p>
        </div>
    );

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: .7 }}
        >
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-100'>
                    Sales by Category
                </h2>
                {summary && (
                    <div className='text-sm text-gray-300'>
                        <p>Total Revenue: ${summary.totalRevenue.toLocaleString()}</p>
                        <p>Total Orders: {summary.totalOrders}</p>
                    </div>
                )}
            </div>

            <div className='h-80'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <PieChart>
                        <Pie
                            data={salesData}
                            cx={"50%"}
                            cy={"50%"}
                            labelLine={false}
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey="Value"
                            nameKey="name"
                            label={({ name, percentage }) => 
                                `${name} ${percentage.toFixed(1)}%`
                            }
                        >
                            {salesData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4b5563",
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                            formatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default SalesbyCategoryChart