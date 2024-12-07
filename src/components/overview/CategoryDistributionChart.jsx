import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#6366f1", "#6b8afa", "#ec4899", "#10b981", "#f59e0b"];

const CategoryDistributionChart = ({ authHeader }) => {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/category/distribution", {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setCategoryData(data.data.distribution);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    if (authHeader) {
      fetchCategoryData();
    }
  }, [authHeader]);

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>
        Category Distribution
      </h2>

      <div className='h-80'>
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <PieChart>
            <Pie
              data={categoryData}
              cx={"50%"}
              cy={"50%"}
              labelLine={false}
              outerRadius={80}
              fill='#8884d8'
              dataKey="percentage"
              nameKey="category"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((_, index) => (
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
  );
};

export default CategoryDistributionChart