import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Search, Trash2, Edit, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CampsitePageTable = () => {
  const itemsPerPage = 10;

  const [campsites, setCampsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const initialForm = {
    campsiteName: '',
    location: '',
    latitude: '',
    longitude: '',
    description: '',
    priceRange: { min: '', max: '' },
    contactInfo: { phone: '', email: '', website: '' },
    openingHours: { open: '', close: '' },
    facilities: [''],
    images: []
  };

  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const fetchCampsites = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:3000/api/admin/campsites?page=${currentPage}&search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCampsites(response.data.data.campsites || []);
      setTotalPages(response.data.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Error fetching campsites');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCampsites();
  }, [fetchCampsites]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campsite?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:3000/api/admin/campsites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Campsite deleted');
        fetchCampsites();
      } catch (error) {
        toast.error('Failed to delete campsite');
      }
    }
  };

  const handleAddOrUpdate = async () => {
    const token = localStorage.getItem('accessToken');
    const form = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value) && key === 'facilities') {
        value.forEach(v => form.append('facilities[]', v));
      } else if (Array.isArray(value) && key === 'images') {
        value.forEach(file => form.append('images', file));
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) =>
          form.append(`${key}.${subKey}`, subValue)
        );
      } else {
        form.append(key, value);
      }
    });

    try {
      if (editId) {
        await axios.put(`http://localhost:3000/api/admin/campsites/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Campsite updated');
      } else {
        await axios.post('http://localhost:3000/api/admin/campsites', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Campsite added');
      }
      setFormData(initialForm);
      setAddModalOpen(false);
      setEditModalOpen(false);
      setEditId(null);
      fetchCampsites();
    } catch (error) {
      toast.error('Failed to save campsite');
    }
  };

  const handleEdit = (c) => {
    setEditId(c._id);
    setFormData({
      campsiteName: c.campsiteName || '',
      location: c.location || '',
      latitude: c.latitude || '',
      longitude: c.longitude || '',
      description: c.description || '',
      priceRange: c.priceRange || { min: '', max: '' },
      contactInfo: c.contactInfo || { phone: '', email: '', website: '' },
      openingHours: c.openingHours || { open: '', close: '' },
      facilities: c.facilities || [''],
      images: []
    });
    setEditModalOpen(true);
  };

  const renderModal = (isOpen, setIsOpen) => isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-auto text-black">
        <h3 className="text-xl font-semibold mb-4">{editId ? 'Edit Campsite' : 'Add Campsite'}</h3>
        
        {['campsiteName', 'location', 'latitude', 'longitude', 'description'].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field}
            className="w-full mb-3 px-3 py-2 border rounded"
            value={formData[field]}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          />
        ))}

        {/* Price Range */}
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="Min Price"
            className="w-1/2 px-3 py-2 border rounded"
            value={formData.priceRange.min}
            onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, min: e.target.value } })}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="w-1/2 px-3 py-2 border rounded"
            value={formData.priceRange.max}
            onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, max: e.target.value } })}
          />
        </div>

        {/* Contact Info */}
        {['phone', 'email', 'website'].map((key) => (
          <input
            key={key}
            type="text"
            placeholder={key}
            className="w-full mb-3 px-3 py-2 border rounded"
            value={formData.contactInfo[key]}
            onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, [key]: e.target.value } })}
          />
        ))}

        {/* Opening Hours */}
        <div className="flex gap-2 mb-3">
          <input
            type="time"
            className="w-1/2 px-3 py-2 border rounded"
            value={formData.openingHours.open}
            onChange={(e) => setFormData({ ...formData, openingHours: { ...formData.openingHours, open: e.target.value } })}
          />
          <input
            type="time"
            className="w-1/2 px-3 py-2 border rounded"
            value={formData.openingHours.close}
            onChange={(e) => setFormData({ ...formData, openingHours: { ...formData.openingHours, close: e.target.value } })}
          />
        </div>

        {/* Facilities */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">Facilities</label>
          {formData.facilities.map((facility, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={facility}
                className="flex-1 px-3 py-2 border rounded"
                onChange={(e) => {
                  const newFacilities = [...formData.facilities];
                  newFacilities[index] = e.target.value;
                  setFormData({ ...formData, facilities: newFacilities });
                }}
              />
              <button onClick={() => {
                const newFacilities = [...formData.facilities];
                newFacilities.splice(index, 1);
                setFormData({ ...formData, facilities: newFacilities });
              }}>
                <X size={18} />
              </button>
            </div>
          ))}
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => setFormData({ ...formData, facilities: [...formData.facilities, ''] })}
          >
            Add Facility
          </button>
        </div>

        {/* Image Upload */}
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full mb-4"
          onChange={(e) =>
            setFormData({ ...formData, images: Array.from(e.target.files).slice(0, 10) })
          }
        />

        <div className="flex justify-end gap-2">
          <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => { setIsOpen(false); setEditId(null); }}>Cancel</button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleAddOrUpdate}>Save</button>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Campsites List</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search campsites..."
              className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-gray-100"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Campsite
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-sm text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-sm text-gray-300 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-sm text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {campsites.map((c) => (
              <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <td className="px-6 py-4 text-gray-100">{c.campsiteName}</td>
                <td className="px-6 py-4 text-gray-300">{c.location}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(c)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 flex justify-between items-center">
        <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {renderModal(isAddModalOpen, setAddModalOpen)}
      {renderModal(isEditModalOpen, setEditModalOpen)}
    </motion.div>
  );
};

export default CampsitePageTable;
