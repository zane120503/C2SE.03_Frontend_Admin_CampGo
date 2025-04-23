import React, { useEffect, useState } from "react";

import Header from "../components/common_components/Header";
import StatCards from "../components/common_components/StatCards";
import SaleOverviewChart from "../components/overview/SaleOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";

import { motion } from "framer-motion";
import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const OverviewPage = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    newUsers: 0,
    totalProducts: 0,
    //conversionRate: 0,
  });

  const { authHeader } = useAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/dashboard/stats", {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log("Dashboard response:", data);

        if (data.success && data.stats) {
          setStats({
            totalSales: data.stats.totalSales,
            newUsers: data.stats.totalUsers,
            totalProducts: data.stats.totalProducts,
            //conversionRate: data.stats.conversionRate,
          });
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

      
      {/* STAT DATA  */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCards name="Total Sales" icon={Zap} value={`$${stats?.totalSales || 0}`} color="#6366f1" />
          <StatCards name="New Users" icon={Users} value={stats?.newUsers || 0} color="#8b5cf6" />
          <StatCards name="Total Products" icon={ShoppingBag} value={stats?.totalProducts || 0} color="#ec4899" />
          {/* <StatCards name="Conversion Rate" icon={BarChart2} value={`${stats?.conversionRate || 0}%`} color="#10b981" /> */}

        </motion.div>


        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SaleOverviewChart authHeader={authHeader} />
          <CategoryDistributionChart authHeader={authHeader} />
          <SalesChannelChart />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
