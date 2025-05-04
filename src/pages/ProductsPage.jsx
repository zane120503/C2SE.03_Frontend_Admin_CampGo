import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

import Header from '../components/common_components/Header';
import StatCards from '../components/common_components/StatCards';
import ProductTable from '../components/products/ProductTable';

const ProductsPage = () => {
  const [totalProducts, setTotalProducts] = useState(0);

  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setTotalProducts(data.data.totalProducts);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, [accessToken]);

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Products" />

      {/* STAT DATA */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCards
            name="Total Products"
            icon={Package}
            value={totalProducts}
            color="#6366f1"
          />
        </motion.div>

        {/* PRODUCT TABLE */}
        <ProductTable />
      </main>
    </div>
  );
}

export default ProductsPage;
