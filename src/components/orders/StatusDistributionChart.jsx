import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import axios from 'axios'
import { toast } from 'react-toastify'

const COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#fed766", "#2ab7ca"]

const StatusDistributionChart = () => {
  const [distributionData, setDistributionData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDistributionData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.get(
          'http://localhost:3000/api/v1/orders/status-distribution',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setDistributionData(response.data.data)
      } catch (error) {
        console.error('Error fetching distribution data:', error)
        toast.error('Failed to load order distribution data')
      } finally {
        setLoading(false)
      }
    }

    fetchDistributionData()
  }, [])

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className='text-xl font-semibold mb-4 text-gray-100'>
        Order Status Distribution
      </h2>

      <div className='h-80'>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="percentage"
              nameKey="status"
              label={({ status, percentage }) => `${status} ${percentage.toFixed(0)}%`}
            >
              {distributionData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4b5563",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default StatusDistributionChart