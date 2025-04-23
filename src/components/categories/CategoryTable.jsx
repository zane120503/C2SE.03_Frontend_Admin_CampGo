import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, X, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    description: '',
    image: null,
  });

  const [editCategory, setEditCategory] = useState({
    _id: '',
    categoryName: '',
    description: '',
    image: null,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(
        `http://localhost:3000/api/admin/categories?page=${currentPage}&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(res.data.data.categories);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotalCategories(res.data.data.pagination.totalCategories);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddCategory = async () => {
    const formData = new FormData();
    formData.append('categoryName', newCategory.categoryName);
    formData.append('description', newCategory.description);
    if (newCategory.image) {
      formData.append('image', newCategory.image);
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:3000/api/admin/categories', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Category added successfully');
      setAddModalOpen(false);
      setNewCategory({ categoryName: '', description: '', image: null });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Add failed');
    }
  };

  const handleEdit = (category) => {
    setEditCategory({ ...category, image: null });
    setEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    const formData = new FormData();
    formData.append('categoryName', editCategory.categoryName);
    formData.append('description', editCategory.description);
    if (editCategory.image) {
      formData.append('image', editCategory.image);
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:3000/api/admin/categories/${editCategory._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Category updated');
      setEditModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure to delete this category?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:3000/api/admin/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category deleted');
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <motion.div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Category List</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-gray-100"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Description</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {categories.map((category) => (
                <motion.tr
                  key={category._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <td className="px-6 py-4 text-gray-100">{category.categoryName}</td>
                  <td className="px-6 py-4 text-gray-400">{category.description}</td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <span className="text-gray-400">
          Showing {categories.length} of {totalCategories} categories
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <CategoryModal
          title="Add Category"
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddCategory}
          category={newCategory}
          setCategory={setNewCategory}
          buttonLabel="Add Category"
          buttonColor="bg-green-600 hover:bg-green-700"
        />
      )}

      {isEditModalOpen && (
        <CategoryModal
          title="Edit Category"
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateCategory}
          category={editCategory}
          setCategory={setEditCategory}
          buttonLabel="Update Category"
          buttonColor="bg-blue-600 hover:bg-blue-700"
        />
      )}
    </motion.div>
  );
};

const CategoryModal = ({ title, onClose, onSubmit, category, setCategory, buttonLabel, buttonColor }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCategory((prev) => ({ ...prev, image: file }));
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center pt-2 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400">
            <X />
          </button>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Category Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
            value={category.categoryName}
            onChange={(e) => setCategory((prev) => ({ ...prev, categoryName: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
            value={category.description}
            onChange={(e) => setCategory((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-white"
          />
        </div>
        <button
          onClick={onSubmit}
          className={`w-full ${buttonColor} text-white py-2 rounded-lg font-medium`}
        >
          {buttonLabel}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default CategoryTable;
