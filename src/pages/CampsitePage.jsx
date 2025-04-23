import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

import Header from '../components/common_components/Header';
import StatCards from '../components/common_components/StatCards';
import CampsitePageTable from '../components/campsites/CampsitePageTable';

const CampsitePage = () => {
  const [campsites, setCampsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampsites = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          'http://localhost:3000/api/admin/campsites',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setCampsites(response.data.data || []);
      } catch (error) {
        console.error('Error fetching campsites:', error);
        toast.error('Failed to load campsites');
      } finally {
        setLoading(false);
      }
    };

    fetchCampsites();
  }, []);

  const statCardsData = [
    {
      name: "Total Campsites",
      icon: MapPin,
      value: loading ? '-' : campsites.length.toLocaleString(),
      color: "#6366f1"
    },
    // {
    //   name: "New Campsites Today",
    //   icon: MapPin,
    //   value: '-', // Optional: Add a separate API for this or remove it
    //   color: "#10b981"
    // },
    {
      name: "Active Campsites",
      icon: MapPin,
      value: loading ? '-' : campsites.filter(c => c.status === 'active').length,
      color: "#f59e0b"
    }
  ];

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title="Campsites" />

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

        {/* CAMPSITE DATA */}
        <CampsitePageTable campsites={campsites} />
      </main>
    </div>
  );
};

export default CampsitePage;
