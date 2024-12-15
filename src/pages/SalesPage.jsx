import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import axios from 'axios';

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards'

import OverviewSalesChart from '../components/sales/OverviewSalesChart';
import SalesbyCategoryChart from '../components/sales/SalesbyCategoryChart';
import DailySalesTrend from '../components/sales/DailySalesTrend';

const SalesPage = () => {
    const [salesStats, setSalesStats] = useState({
        totalRevenue: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        salesGrowth: 0,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchSalesMetrics = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/sales-metrics', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (response.data.success) {
                    const { totalRevenue, averageOrderValue, salesGrowth } = response.data.data;
                    
                    setSalesStats({
                        totalRevenue: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        averageOrderValue: `$${averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        conversionRate: `${response.data.data.metrics?.conversionRate || 0}%`,
                        salesGrowth: `${salesGrowth.percentage}%`,
                        loading: false,
                        error: null
                    });
                }
            } catch (error) {
                console.error('Error fetching sales metrics:', error);
                setSalesStats(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to load sales metrics'
                }));
            }
        };

        fetchSalesMetrics();
    }, []);

    if (salesStats.loading) {
        return <div className="text-white">Loading sales metrics...</div>;
    }

    if (salesStats.error) {
        return <div className="text-red-500">{salesStats.error}</div>;
    }

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="Sales Dashboard" />

            {/* STAT DATA */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards 
                        name="Total Revenue" 
                        icon={DollarSign} 
                        value={salesStats.totalRevenue} 
                        color="#6366f1" 
                    />
                    <StatCards 
                        name="Avg. Order Value" 
                        icon={ShoppingCart} 
                        value={salesStats.averageOrderValue} 
                        color="#10b981" 
                    />
                    <StatCards 
                        name="Conversion Rate" 
                        icon={TrendingUp} 
                        value={salesStats.conversionRate} 
                        color="#f59e0b" 
                    />
                    <StatCards 
                        name="Sales Growth" 
                        icon={CreditCard} 
                        value={salesStats.salesGrowth} 
                        color="#ef4444" 
                    />
                </motion.div>

                <OverviewSalesChart />
                
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7 mt-7'>
                    <SalesbyCategoryChart />
                    <DailySalesTrend />
                </div>  
            </main>
        </div>
    );
};

export default SalesPage;