import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, UserIcon } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards'
import UsersPageTable from '../components/users/UsersPageTable'

const UsersPage = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          'http://localhost:3000/api/admin/users', // Using the updated API URL
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Extract totalUsers from the response
        const totalUsers = response.data.totalUsers || 0;

        setUserStats({
          totalUsers,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const statCardsData = [
    {
      name: "Total Users",
      icon: UserIcon,
      value: loading ? '-' : userStats.totalUsers.toLocaleString(),
      color: "#6366f1"
    },
  ];

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title="Users" />

      {/* STAT DATA  */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {statCardsData.map((stat, index) => (
            <StatCards
              key={stat.name}
              name={stat.name}
              icon={stat.icon}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </motion.div>

        {/* USER DATA  */}
        <UsersPageTable />
      </main>
    </div>
  );
};

export default UsersPage;
