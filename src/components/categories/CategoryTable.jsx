/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, X, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    description: '',
    image: [],
    imagePreview: [],
    isActive: true,
  });

  const [editCategory, setEditCategory] = useState({
    _id: '',
    categoryName: '',
    description: '',
    image: [],
    imagePreview: [],
    isActive: true,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:3000/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categoriesData = res.data.categories || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const removeVietnameseTones = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const normalizedSearchTerm = removeVietnameseTones(value);
    const filtered = categories.filter((cat) =>
      removeVietnameseTones(cat.categoryName).includes(normalizedSearchTerm)
    );
    setFilteredCategories(filtered);
  };

  const handleAddCategory = async () => {
    const formData = new FormData();
    formData.append('categoryName', newCategory.categoryName);
    formData.append('description', newCategory.description);
    formData.append('isActive', newCategory.isActive);
    newCategory.image.forEach((file) => {
      formData.append('image', file);
    });

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
      setNewCategory({ categoryName: '', description: '', image: [], imagePreview: [], isActive: true });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Add failed');
    }
  };

  const handleEdit = (category) => {
    setEditCategory({
      _id: category._id,
      categoryName: category.categoryName,
      description: category.description,
      image: [],
      imagePreview: category.image?.url ? [category.image.url] : [],
      isActive: category.isActive,
    });
    setEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    const formData = new FormData();
    formData.append('categoryName', editCategory.categoryName);
    formData.append('description', editCategory.description);
    formData.append('isActive', editCategory.isActive);

    editCategory.image.forEach((file) => {
      if (file instanceof File) {
        formData.append('image', file);
      }
    });

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`http://localhost:3000/api/admin/categories/${editCategory._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
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

  const toggleCategoryStatus = async (id, isActive) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `http://localhost:3000/api/admin/categories/${id}/status`,
        { isActive: !isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Category status updated');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Image</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Description</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCategories.map((category) => (
                <motion.tr
                  key={category._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <td className="px-6 py-4">
                    <img
                      src={category.image?.url}
                      alt={category.categoryName}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-100">{category.categoryName}</td>
                  <td className="px-6 py-4 text-gray-400">{category.description}</td>
                  <td className="px-6 py-4 text-gray-100">
                    {category.isActive ? (
                      <span className="bg-green-700 text-green-100 px-3 py-1 rounded-full text-sm">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-700 text-red-100 px-3 py-1 rounded-full text-sm">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex space-x-3 pt-9">
                    <button
                      onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                      className="px-3 py-1 rounded-full text-sm bg-gray-600 hover:bg-gray-500 text-white"
                    >
                      {category.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    </button>
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

      <div className="mt-4 text-gray-400">
        Showing {filteredCategories.length} categories
      </div>

      {isAddModalOpen && (
        <CategoryModal
          title="Add Category"
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddCategory}
          category={newCategory}
          setCategory={setNewCategory}
          buttonLabel="Add Category"
          buttonColor="bg-green-600"
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
          buttonColor="bg-blue-600"
        />
      )}
    </motion.div>
  );
};

const CategoryModal = ({ title, onClose, onSubmit, category, setCategory, buttonLabel, buttonColor }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    setCategory((prev) => ({
      ...prev,
      image: [...prev.image, ...files],
      imagePreview: [...prev.imagePreview, ...previews],
    }));
  };

  const handleRemoveImage = (index) => {
    setCategory((prev) => {
      const updatedFiles = prev.image.filter((_, i) => i !== index);
      const updatedPreviews = prev.imagePreview.filter((_, i) => i !== index);
      return { ...prev, image: updatedFiles, imagePreview: updatedPreviews };
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center pt-2 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-800 text-gray-100 rounded-lg w-96 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm">Category Name</label>
          <input
            type="text"
            value={category.categoryName}
            onChange={(e) => setCategory({ ...category, categoryName: e.target.value })}
            className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-md"
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm">Description</label>
          <textarea
            value={category.description}
            onChange={(e) => setCategory({ ...category, description: e.target.value })}
            className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm">Category Image(s)</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full mt-2 text-gray-100"
          />
          {category.imagePreview.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {category.imagePreview.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt="Preview" className="w-full h-20 object-cover rounded-md" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={onSubmit}
            className={`w-full py-2 text-white rounded-lg ${buttonColor}`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryTable;
