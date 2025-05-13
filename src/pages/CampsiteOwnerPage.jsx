/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Tent } from 'lucide-react';

import Header from '../components/common_components/Header';
import StatCards from '../components/common_components/StatCards';
import CampsiteOwnerTable from '../components/campsite_owners/CampsiteOwnerTable';

const CampsiteOwnerPage = () => {

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title="Campsite Owners" />

      {/* STAT CARDS */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* You can add other stat cards here if needed */}
        </motion.div>

        {/* CAMPSITE OWNER TABLE */}
        <CampsiteOwnerTable />
      </main>
    </div>
  );
};

export default CampsiteOwnerPage;
