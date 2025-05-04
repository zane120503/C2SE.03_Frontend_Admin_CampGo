/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Search, Trash2, Plus, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CampsitePageTable = () => {
    const [campsites, setCampsites] = useState([]);
    const [filteredCampsites, setFilteredCampsites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCampsites, setTotalCampsites] = useState(0);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const [editCampsite, setEditCampsite] = useState({
        _id: '',
        campsiteName: '',
        location: '',
        latitude: '',
        longitude: '',
        description: '',
        priceRange: { min: '', max: '' },
        contactInfo: { phone: '', email: '', website: '' },
        openingHours: { open: '', close: '' },
        facilities: [''],
        images: [],
        isActive: true,
    });

    const [newCampsite, setNewCampsite] = useState({
        campsiteName: '',
        location: '',
        latitude: '',
        longitude: '',
        description: '',
        priceRange: { min: '', max: '' },
        contactInfo: { phone: '', email: '', website: '' },
        openingHours: { open: '', close: '' },
        facilities: [''],
        images: [],
        isActive: true,
    });

    const removeVietnameseTones = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

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
            setCampsites(response.data.campsites);
            setTotalPages(response.data.totalPages);
            setTotalCampsites(response.data.totalCampsites);
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
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
        const normalizedSearchTerm = removeVietnameseTones(value);
        console.log('Normalized Search Term:', normalizedSearchTerm);
        const filtered = campsites.filter((camp) =>
            removeVietnameseTones(camp.campsiteName).includes(normalizedSearchTerm) || // Tìm kiếm theo tên campsite
            removeVietnameseTones(camp.location).includes(normalizedSearchTerm)  // Tìm kiếm theo địa điểm
        );
        console.log('Filtered Campsites:', filtered);
        setFilteredCampsites(filtered); 
    };

    const handleAddCampsite = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            Object.entries(newCampsite).forEach(([key, value]) => {
                if (key === 'images') {
                    value.forEach(image => formData.append('images', image));
                } else if (typeof value === 'object') {
                    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                        formData.append(`${key}[${nestedKey}]`, nestedValue);
                    });
                } else {
                    formData.append(key, value);
                }
            });

            await axios.post('http://localhost:3000/api/admin/campsites', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Campsite added successfully');
            setAddModalOpen(false);
            setNewCampsite({
                campsiteName: '',
                location: '',
                latitude: '',
                longitude: '',
                description: '',
                priceRange: { min: '', max: '' },
                contactInfo: { phone: '', email: '', website: '' },
                openingHours: { open: '', close: '' },
                facilities: [''],
                images: [],
                isActive: true
            });
            fetchCampsites();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding campsite');
        }
    };

    const handleEdit = (campsite) => {
        setEditCampsite(campsite);
        setEditModalOpen(true);
    };

    const handleUpdateCampsite = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            Object.entries(editCampsite).forEach(([key, value]) => {
                if (key === 'images') {
                    value.forEach(image => formData.append('images', image));
                } else if (typeof value === 'object') {
                    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                        formData.append(`${key}[${nestedKey}]`, nestedValue);
                    });
                } else {
                    formData.append(key, value);
                }
            });

            await axios.put(`http://localhost:3000/api/admin/campsites/${editCampsite._id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Campsite updated successfully');
            setEditModalOpen(false);
            fetchCampsites();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating campsite');
        }
    };

    const handleDeleteCampsite = async (campsiteId) => {
        if (window.confirm('Are you sure you want to delete this campsite?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`http://localhost:3000/api/admin/campsites/${campsiteId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Campsite deleted successfully');
                fetchCampsites();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting campsite');
            }
        }
    };

    const handleToggleActive = async (campsiteId, currentStatus) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`http://localhost:3000/api/admin/campsites/${campsiteId}/status`, 
                { isActive: !currentStatus }, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setCampsites(prevCampsites => 
                prevCampsites.map(campsite => 
                    campsite._id === campsiteId 
                    ? { ...campsite, isActive: !currentStatus } 
                    : campsite
                )
            );
            toast.success(`Campsite ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating campsite status');
        }
    };
    

    const handleAddFacility = () => {
        setNewCampsite(prevState => ({
            ...prevState,
            facilities: [...prevState.facilities, '']
        }));
    };

    const handleRemoveFacility = (index) => {
        setNewCampsite(prevState => ({
            ...prevState,
            facilities: prevState.facilities.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewCampsite(prevState => ({
            ...prevState,
            images: [...prevState.images, ...files]
        }));
    };

    const handleRemoveImage = (index) => {
        setNewCampsite(prevState => ({
            ...prevState,
            images: prevState.images.filter((_, i) => i !== index)
        }));
    };

    return (
        <motion.div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700">
            {/* Add campsite button */}
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Campsite List</h2>
                <div className='flex gap-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
                        <input
                            type="text"
                            placeholder='Search campsites...'
                            className='pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-gray-100'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                    >
                        <Plus size={20} />
                        Add Campsite
                    </button>
                </div>
            </div>

            {/* Campsite table */}
            {loading ? (
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className='animate-spin text-purple-600' size={40} />
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-700'>
                        <thead>
                            <tr>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Name</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Location</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Status</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-700'>
                            {campsites.map(campsite => (
                                <motion.tr
                                    key={campsite._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <td className='px-6 py-4 text-gray-100'>{campsite.campsiteName}</td>
                                    <td className='px-6 py-4 text-gray-300'>{campsite.location}</td>
                                    <td className='px-6 py-4'>
                                        {campsite.isActive ? (
                                            <span className='text-green-500 font-medium'>Active</span>
                                        ) : (
                                            <span className='text-red-500 font-medium'>Inactive</span>
                                        )}
                                    </td>
                                    <td className='px-6 py-4 flex space-x-3'>
                                        <button onClick={() => handleEdit(campsite)} className='text-indigo-400 hover:text-indigo-300'>
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteCampsite(campsite._id)} className='text-red-400 hover:text-red-300'>
                                            <Trash2 size={18} />
                                        </button>
                                        <button onClick={() => handleToggleActive(campsite._id, campsite.isActive)} className={`text-${campsite.isActive ? 'red' : 'green'}-400 hover:text-${campsite.isActive ? 'red' : 'green'}-300`}>
                                            {campsite.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className='mt-4 flex justify-between items-center'>
                <span className='text-gray-400'>
                    Showing {campsites.length} of {totalCampsites} campsites
                </span>
                <div className='flex gap-2'>
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className='p-2 bg-gray-700 rounded-lg disabled:opacity-50'>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className='p-2 bg-gray-700 rounded-lg disabled:opacity-50'>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <CampsiteModal
                    title="Add Campsite"
                    onClose={() => setAddModalOpen(false)}
                    onSubmit={handleAddCampsite}
                    campsite={newCampsite}
                    setCampsite={setNewCampsite}
                    buttonLabel="Add Campsite"
                    buttonColor="bg-purple-600 hover:bg-purple-700"
                    handleAddFacility={handleAddFacility}
                    handleRemoveFacility={handleRemoveFacility}
                    handleImageChange={handleImageChange}
                    handleRemoveImage={handleRemoveImage}
                />
            )}
            {isEditModalOpen && (
                <CampsiteModal
                    title="Edit Campsite"
                    onClose={() => setEditModalOpen(false)}
                    onSubmit={handleUpdateCampsite}
                    campsite={editCampsite}
                    setCampsite={setEditCampsite}
                    buttonLabel="Update Campsite"
                    buttonColor="bg-blue-600 hover:bg-blue-700"
                    handleAddFacility={handleAddFacility}
                    handleRemoveFacility={handleRemoveFacility}
                    handleImageChange={handleImageChange}
                    handleRemoveImage={handleRemoveImage}
                />
            )}
        </motion.div>
    );
};

const CampsiteModal = ({ title, onClose, onSubmit, campsite, setCampsite, buttonLabel, buttonColor, handleAddFacility, handleRemoveFacility, handleImageChange, handleRemoveImage }) => (
    <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <div className="flex justify-between items-center">
                <h3 className="text-xl text-gray-100">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                    <X size={24} />
                </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
                {/* Name */}
                <div className="mt-4">
                    <label htmlFor="campsiteName" className="block text-gray-300">Campsite Name</label>
                    <input
                        type="text"
                        id="campsiteName"
                        className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                        value={campsite.campsiteName}
                        onChange={e => setCampsite({ ...campsite, campsiteName: e.target.value })}
                        required
                    />
                </div>
                {/* Location */}
                <div className="mt-4">
                    <label htmlFor="location" className="block text-gray-300">Location</label>
                    <input
                        type="text"
                        id="location"
                        className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                        value={campsite.location}
                        onChange={e => setCampsite({ ...campsite, location: e.target.value })}
                        required
                    />
                </div>
                {/* Latitude & Longitude */}
                <div className="mt-4 flex gap-4">
                    <div className="w-1/2">
                        <label htmlFor="latitude" className="block text-gray-300">Latitude</label>
                        <input
                            type="text"
                            id="latitude"
                            className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                            value={campsite.latitude}
                            onChange={e => setCampsite({ ...campsite, latitude: e.target.value })}
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="longitude" className="block text-gray-300">Longitude</label>
                        <input
                            type="text"
                            id="longitude"
                            className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                            value={campsite.longitude}
                            onChange={e => setCampsite({ ...campsite, longitude: e.target.value })}
                        />
                    </div>
                </div>
                {/* Description */}
                <div className="mt-4">
                    <label htmlFor="description" className="block text-gray-300">Description</label>
                    <textarea
                        id="description"
                        className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                        value={campsite.description}
                        onChange={e => setCampsite({ ...campsite, description: e.target.value })}
                        rows="3"
                    />
                </div>
                {/* Price Range */}
                <div className="mt-4 flex gap-4">
                    <div className="w-1/2">
                        <label htmlFor="priceRange.min" className="block text-gray-300">Min Price</label>
                        <input
                            type="number"
                            id="priceRange.min"
                            className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                            value={campsite.priceRange.min}
                            onChange={e => setCampsite({ ...campsite, priceRange: { ...campsite.priceRange, min: e.target.value } })}
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="priceRange.max" className="block text-gray-300">Max Price</label>
                        <input
                            type="number"
                            id="priceRange.max"
                            className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                            value={campsite.priceRange.max}
                            onChange={e => setCampsite({ ...campsite, priceRange: { ...campsite.priceRange, max: e.target.value } })}
                        />
                    </div>
                </div>
                {/* Contact Info */}
                <div className="mt-4">
                    <label className="block text-gray-300">Contact Info</label>
                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label htmlFor="contactInfo.phone" className="block text-gray-300">Phone</label>
                            <input
                                type="text"
                                id="contactInfo.phone"
                                className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                                value={campsite.contactInfo.phone}
                                onChange={e => setCampsite({ ...campsite, contactInfo: { ...campsite.contactInfo, phone: e.target.value } })}
                            />
                        </div>
                        <div className="w-1/3">
                            <label htmlFor="contactInfo.email" className="block text-gray-300">Email</label>
                            <input
                                type="email"
                                id="contactInfo.email"
                                className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                                value={campsite.contactInfo.email}
                                onChange={e => setCampsite({ ...campsite, contactInfo: { ...campsite.contactInfo, email: e.target.value } })}
                            />
                        </div>
                        <div className="w-1/3">
                            <label htmlFor="contactInfo.website" className="block text-gray-300">Website</label>
                            <input
                                type="text"
                                id="contactInfo.website"
                                className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                                value={campsite.contactInfo.website}
                                onChange={e => setCampsite({ ...campsite, contactInfo: { ...campsite.contactInfo, website: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>
                {/* Opening Hours */}
                <div className="mt-4 flex gap-4">
                    <div className="w-1/2">
                        <label htmlFor="openingHours.open" className="block text-gray-300">Open</label>
                        <input
                            type="time"
                            id="openingHours.open"
                            className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                            value={campsite.openingHours.open}
                            onChange={e => setCampsite({ ...campsite, openingHours: { ...campsite.openingHours, open: e.target.value } })}
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="openingHours.close" className="block text-gray-300">Close</label>
                        <input
                            type="time"
                            id="openingHours.close"
                            className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                            value={campsite.openingHours.close}
                            onChange={e => setCampsite({ ...campsite, openingHours: { ...campsite.openingHours, close: e.target.value } })}
                        />
                    </div>
                </div>
                {/* Facilities */}
                <div className="mt-4">
                    <label className="block text-gray-300">Facilities</label>
                    {campsite.facilities.map((facility, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                                value={facility}
                                onChange={(e) => {
                                    const updatedFacilities = [...campsite.facilities];
                                    updatedFacilities[index] = e.target.value;
                                    setCampsite({ ...campsite, facilities: updatedFacilities });
                                }}
                            />
                            <button type="button" onClick={() => handleRemoveFacility(index)} className="text-red-500 hover:text-red-300">
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddFacility} className="text-blue-500 hover:text-blue-300 mt-2">+ Add Facility</button>
                </div>
                {/* Image Upload */}
                <div className="mt-4">
                    <label className="block text-gray-300">Images</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="w-full p-2 bg-gray-700 rounded-lg mt-2"
                    />
                    <div className="mt-2 flex gap-2">
                        {campsite.images.map((image, index) => (
                            <div key={index} className="relative">
                                <img src={URL.createObjectURL(image)} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 p-1 bg-gray-800 text-white rounded-full">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6">
                    <button type="submit" className={`w-full p-3 rounded-lg ${buttonColor} text-white`}>{buttonLabel}</button>
                </div>
            </form>
        </motion.div>
    </motion.div>
);

export default CampsitePageTable;
