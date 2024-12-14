import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, UserIcon, UserPlus, UserX } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards'
import UsersPageTable from '../components/users/UsersPageTable'


const UsersPage = () => {
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        activeUsers: 0,
        churnRate: "0%"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(
                    'http://localhost:3000/api/v1/users/dashboard',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setUserStats(response.data.data);
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
        {
            name: "New Users Today",
            icon: UserPlus,
            value: loading ? '-' : userStats.newUsersToday,
            color: "#10b981"
        },
        {
            name: "Churn Rate",
            icon: UserX,
            value: loading ? '-' : userStats.churnRate,
            color: "#ef4444"
        }
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

                {/* USERS CHARTS 
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 pt-8'>
                    <UserActivityHeatMap />
                    <UserDemographicChart />
                </div> */}
            </main>
        </div>
    )
}

export default UsersPage