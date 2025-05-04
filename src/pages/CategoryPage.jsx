import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderKanban } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards'
import CategoryTable from '../components/categories/CategoryTable'

const CategoryPage = () => {
    const [categoryStats, setCategoryStats] = useState({
        totalCategories: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryStats = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(
                    'http://localhost:3000/api/admin/categories',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const { totalCategories } = response.data;
                setCategoryStats({ totalCategories });
            } catch (error) {
                console.error('Error fetching category stats:', error);
                toast.error('Failed to load category statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryStats();
    }, []);

    const statCardsData = [
        {
            name: "Total Categories",
            icon: FolderKanban,
            value: loading ? '-' : categoryStats.totalCategories.toLocaleString(),
            color: "#a855f7"
        }
    ];

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="Categories" />

            {/* STAT DATA */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    {statCardsData.map((stat) => (
                        <StatCards
                            key={stat.name}
                            name={stat.name}
                            icon={stat.icon}
                            value={stat.value}
                            color={stat.color}
                        />
                    ))}
                </motion.div>

                {/* CATEGORY DATA TABLE */}
                <CategoryTable />
            </main>
        </div>
    );
};

export default CategoryPage;
