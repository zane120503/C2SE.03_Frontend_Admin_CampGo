// import React, { useEffect, useState } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { motion } from 'framer-motion';

// const SaleOverviewChart = ({ authHeader }) => {
//   const [salesData, setSalesData] = useState([]);

//   useEffect(() => {
//     const fetchSalesData = async () => {
//       try {
//         const response = await fetch("http://localhost:3000/api/v1/sales/by-month", {
//           headers: {
//             'Authorization': authHeader,
//             'Content-Type': 'application/json'
//           }
//         });

//         const data = await response.json();
//         if (data.success) {
//           setSalesData(data.data.monthlySales);
//         }
//       } catch (error) {
//         console.error("Error fetching sales data:", error);
//       }
//     };

//     if (authHeader) {
//       fetchSalesData();
//     }
//   }, [authHeader]);

//   return (
//     <motion.div
//       className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
//       initial={{ opacity: 0, y: 25 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//     >
//       <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview</h2>
//       <div className='h-80'>
//         <ResponsiveContainer width={"100%"} height={"100%"}>
//           <LineChart data={salesData}>
//             <CartesianGrid strokeDasharray={'3 3'} stroke='#4b5563' />
//             <XAxis 
//               dataKey={"monthName"} 
//               stroke='#9ca3af' 
//               interval={0}
//               tick={{ fontSize: 12 }}
//             />
//             <YAxis stroke='#9ca3af' />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "rgba(31, 45, 55, 0.8)",
//                 borderColor: "#4b5563"
//               }}
//               itemStyle={{ color: "#e5e7eb" }}
//             />
//             <Line
//               type="monotone"
//               dataKey='revenue'
//               stroke='#6366f1'
//               strokeWidth={3}
//               dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
//               activeDot={{ r: 8, strokeWidth: 2 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </motion.div>
//   );
// };

// export default SaleOverviewChart;

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const SaleOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    // Dữ liệu giả để demo
    const fakeSalesData = [
      { monthName: 'Jan', revenue: 1200 },
      { monthName: 'Feb', revenue: 1500 },
      { monthName: 'Mar', revenue: 1800 },
      { monthName: 'Apr', revenue: 1100 },
      { monthName: 'May', revenue: 2100 },
      { monthName: 'Jun', revenue: 2500 },
      { monthName: 'Jul', revenue: 2200 },
      { monthName: 'Aug', revenue: 2400 },
      { monthName: 'Sep', revenue: 2000 },
      { monthName: 'Oct', revenue: 2300 },
      { monthName: 'Nov', revenue: 2600 },
      { monthName: 'Dec', revenue: 3000 }
    ];

    setSalesData(fakeSalesData);
  }, []);

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview</h2>
      <div className='h-80'>
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray={'3 3'} stroke='#4b5563' />
            <XAxis 
              dataKey={"monthName"} 
              stroke='#9ca3af' 
              interval={0}
              tick={{ fontSize: 12 }}
            />
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
              dataKey='revenue'
              stroke='#6366f1'
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SaleOverviewChart;
