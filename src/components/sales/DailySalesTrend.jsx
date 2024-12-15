import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const DailySalesTrend = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/admin/daily-sales-trend', {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setSalesData(response.data.data); // Updated to use response.data.data
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching daily sales:', err);
        setError('Failed to load sales data');
        setIsLoading(false);
      }
    };

    fetchDailySales();
  }, []);

  if (isLoading) return <div className="text-gray-300">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .7, delay: .7 }}
    >
      <h2 className='text-xl font-semibold mb-4 text-gray-100'>
        Daily Sales Trend
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke='#374151' />
            <XAxis dataKey="name" stroke='#9ca3af' />
            <YAxis stroke='#9ca3af' />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4b5563",
              }}
              itemStyle={{ color: "#e5e7eb" }}
              formatter={(value) => [`$${value.toFixed(2)}`, "Sales"]}
            />
            <Bar dataKey="Sales" fill='#10b981' />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DailySalesTrend;