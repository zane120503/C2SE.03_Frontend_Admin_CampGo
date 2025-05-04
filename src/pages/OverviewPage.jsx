import React, { useEffect, useState } from "react";

import Header from "../components/common_components/Header";
import StatCards from "../components/common_components/StatCards";
import SaleOverviewChart from "../components/overview/SaleOverviewChart";

import { motion } from "framer-motion";
import { ShoppingBag, Users, Zap } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const OverviewPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalCampsites: 0,
  });

  const { authHeader } = useAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/dashboard/stats", {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          }
        });

        const data = await res.json();

        if (data.success) {
          const { totalRevenue, totalUsers, totalProducts, totalCampsites } = data.data;
          setStats({
            totalRevenue,
            totalUsers,
            totalProducts,
            totalCampsites
          });
        } else {
          console.error("Failed to fetch dashboard stats:", data.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    if (authHeader) {
      fetchDashboardStats();
    } else {
      console.log("No auth header available");
    }
  }, [authHeader]);

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Overview" />

      {/* STAT DATA */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCards name="Total Revenue" icon={Zap} value={`$${stats.totalRevenue.toFixed(2)}`} color="#6366f1" />
          <StatCards name="Total Users" icon={Users} value={stats.totalUsers} color="#8b5cf6" />
          <StatCards name="Total Products" icon={ShoppingBag} value={stats.totalProducts} color="#ec4899" />
          <StatCards name="Total Campsites" icon={ShoppingBag} value={stats.totalCampsites} color="#10b981" />
        </motion.div>

        {/* CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
          <SaleOverviewChart authHeader={authHeader} />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
