import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';

import Header from '../components/common_components/Header';
import StatCards from '../components/common_components/StatCards';
import ProductTable from '../components/products/ProductTable';
import SalesTrendChart from "../components/products/SalesTrendChart";
import CategoryDistributionChart from '../components/overview/CategoryDistributionChart';

const ProductsPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    topSelling: 0,
    lowStock: 0,
    tcp: 0,
  });

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/product-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setStats({
            totalProducts: data.stats.totalProducts,
            topSelling: data.stats.topSelling,
            lowStock: data.stats.lowStock,
            tcp: data.stats.totalRevenue,
          });
        }
      } catch (error) {
        console.error('Error fetching product stats:', error);
      }
    };

    fetchProductStats();
  }, []);

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title="Products" />

      {/* STAT DATA  */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCards name="Total Products" icon={Package} value={stats.totalProducts} color="#6366f1" />
          <StatCards name="Top Selling" icon={TrendingUp} value={stats.topSelling} color="#10b981" />
          <StatCards name="Low Stock" icon={AlertTriangle} value={stats.lowStock} color="#f59e0b" />
          <StatCards name="TCP" icon={DollarSign} value={`$${stats.tcp}`} color="#ef4444" />
        </motion.div>

        {/* PRODUCT TABLE */}
        <ProductTable />

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SalesTrendChart />
          <CategoryDistributionChart />
        </div>
      </main>
    </div>
  );
}

export default ProductsPage;