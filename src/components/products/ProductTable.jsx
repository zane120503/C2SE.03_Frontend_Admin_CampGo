import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, ChevronLeft, ChevronRight, UserPlus, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',               // Required
        description: '',        // Optional
        shortDescription: '',   // Optional
        price: '',             // Required
        dimensions: {          // Optional
            length: '',
            width: '',
            height: ''
        },
        stockQuantity: '',     // Required
        material: '',          // Optional
        category: '',          // Required
        discount: 0,           // Optional
        brand: '',            // Optional
        style: '',            // Optional
        assemblyRequired: false, // Optional
        weight: '',           // Optional
        images: [],           // Optional
        model3d: null,        // Optional
        sales: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5;
    const [categories, setCategories] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({
        add: false,
        edit: false,
        delete: null
    });

    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage, searchTerm, refreshKey]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('http://localhost:3000/api/v1/categories', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading categories');
        }
    };

    const handleAddProduct = async () => {
        try {
            setActionLoading(prev => ({ ...prev, add: true }));
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();

            // Validate required fields
            if (!newProduct.name || !newProduct.price || !newProduct.category) {
                toast.error('Please fill in all required fields (Name, Price, Category)');
                return;
            }

            // Validate price and stock quantity
            if (isNaN(newProduct.price) || newProduct.price <= 0) {
                toast.error('Please enter a valid price');
                return;
            }

            if (!newProduct.stockQuantity || isNaN(newProduct.stockQuantity)) {
                toast.error('Please enter a valid stock quantity');
                return;
            }

            // Add all product data to formData
            Object.keys(newProduct).forEach(key => {
                if (key === 'images' && newProduct.images?.length > 0) {
                    Array.from(newProduct.images).forEach(image => {
                        formData.append('images', image);
                    });
                } else if (key === 'model3d' && newProduct.model3d) {
                    formData.append('model3d', newProduct.model3d);
                } else if (key === 'dimensions' && Object.keys(newProduct.dimensions).length > 0) {
                    formData.append('dimensions', JSON.stringify(newProduct.dimensions));
                } else if (newProduct[key] !== undefined && newProduct[key] !== null && newProduct[key] !== '') {
                    formData.append(key, String(newProduct[key]));
                }
            });

            // Debug log
            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await axios.post(
                'http://localhost:3000/api/v1/addproduct',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                toast.success('Product added successfully!');
                setAddModalOpen(false);
                setRefreshKey(prev => prev + 1);
                // Reset form
                setNewProduct({
                    name: '',               // Required
                    description: '',        // Optional
                    shortDescription: '',   // Optional
                    price: '',             // Required
                    dimensions: {          // Optional
                        length: '',
                        width: '',
                        height: ''
                    },
                    stockQuantity: '',     // Required
                    material: '',          // Optional
                    category: '',          // Required
                    discount: 0,           // Optional
                    brand: '',            // Optional
                    style: '',            // Optional
                    assemblyRequired: false, // Optional
                    weight: '',           // Optional
                    images: [],           // Optional
                    model3d: null,        // Optional
                    sales: 0
                });
            }
        } catch (error) {
            console.error('Error adding product:', error);
            // Detailed error logging
            if (error.response) {
                console.error('Error response:', error.response.data);
                toast.error(error.response.data.message || 'Error adding product');
            } else if (error.request) {
                console.error('Error request:', error.request);
                toast.error('Network error - please try again');
            } else {
                console.error('Error message:', error.message);
                toast.error('Error adding product - please try again');
            }
        } finally {
            setActionLoading(prev => ({ ...prev, add: false }));
        }
    };

    const handleEdit = (product) => {
        console.log("Edit product:", product);
    setEditProduct({
        id: product.id,  // Sử dụng id thay vì _id
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        dimensions: product.dimensions || {
            length: '',
            width: '',
            height: ''
        },
        stockQuantity: product.stockQuantity || '',
        material: product.material || '',
        category: product.category || '',
        discount: product.discount || 0,
        brand: product.brand || '',
        style: product.style || '',
        assemblyRequired: product.assemblyRequired || false,
        weight: product.weight || '',
        images: product.images || [], // Giữ lại URLs của ảnh cũ
        model3d: product.model3d || null, // Giữ lại URL của model cũ
        newImages: [], // Thêm field mới cho ảnh sẽ upload
        newModel3d: null // Thêm field mới cho model sẽ upload
    });
        setEditModalOpen(true);
    };

    // Hàm xử lý submit edit
    const handleEditProduct = async () => {
        try {
            setActionLoading(prev => ({ ...prev, edit: true }));
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
    
            // Validate required fields
            if (!editProduct.name || !editProduct.price || !editProduct.category) {
                toast.error('Please fill in all required fields (Name, Price, Category)');
                return;
            }
    
            // Validate numeric fields
            if (isNaN(editProduct.price) || editProduct.price <= 0) {
                toast.error('Please enter a valid price');
                return;
            }
    
            if (!editProduct.stockQuantity || isNaN(editProduct.stockQuantity)) {
                toast.error('Please enter a valid stock quantity');
                return;
            }
    
            // Append basic fields
            Object.keys(editProduct).forEach(key => {
                if (key !== 'newImages' && key !== 'newModel3d' && key !== 'images' && key !== 'model3d') {
                    if (key === 'dimensions' && typeof editProduct.dimensions === 'object') {
                        formData.append('dimensions', JSON.stringify(editProduct.dimensions));
                    } else if (editProduct[key] !== undefined && editProduct[key] !== null) {
                        formData.append(key, String(editProduct[key]));
                    }
                }
            });
    
            // Append new images if any
            if (editProduct.newImages?.length > 0) {
                Array.from(editProduct.newImages).forEach(image => {
                    formData.append('images', image);
                });
            }
    
            // Append new 3D model if any
            if (editProduct.newModel3d) {
                formData.append('model3d', editProduct.newModel3d);
            }
    
            // Debug log
            console.log("Editing product with ID:", editProduct.id);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
    
            const response = await axios.put(
                `http://localhost:3000/api/v1/editproduct/${editProduct.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
    
            if (response.data.success) {
                toast.success('Product updated successfully!');
                setEditModalOpen(false);
                setRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Error updating product');
        } finally {
            setActionLoading(prev => ({ ...prev, edit: false }));
        }
    };
    
    // Thêm handlers cho file inputs trong form
    const handleImageChange = (e) => {
        setEditProduct({ ...editProduct, newImages: e.target.files });
    };
    
    const handleModelChange = (e) => {
        setEditProduct({ ...editProduct, newModel3d: e.target.files[0] });
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const confirmed = window.confirm('Are you sure you want to delete this product?');
            if (!confirmed) return;

            setActionLoading(prev => ({ ...prev, delete: productId }));
            const token = localStorage.getItem('accessToken');
            const response = await axios.delete(
                `http://localhost:3000/api/v1/deleteproduct/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                toast.success('Product deleted successfully!');
                setRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            if (!error.response?.data?.success) {
                toast.error(error.response?.data?.message || 'Error deleting product');
            }
        } finally {
            setActionLoading(prev => ({ ...prev, delete: null }));
        }
    };

    const SearchHandler = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to first page on new search
    };


    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get('http://localhost:3000/api/v1/products', {
                headers: authHeader,
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm,
                    sortBy: 'name',
                    order: 'asc'
                }
            });

            if (response.data.success) {
                setProducts(response.data.data.products);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(error.response?.data?.message || 'Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
        >
            {/* Header and Search */}
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Product List</h2>

                <div className='relative flex items-center'>
                    <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
                    <input
                        type="text"
                        placeholder='Search Product...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={SearchHandler}
                        value={searchTerm}
                    />
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-400'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Category</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Price</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Stock</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Sales</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Material</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Brand</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-500'>
                        {products.map((product) => (
                            <motion.tr
                                key={product._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.1, delay: 0.2 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className='rounded-full size-10'
                                        />
                                    ) : (
                                        <div className='rounded-full size-10 bg-gray-600'></div>
                                    )}
                                    {product.name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                                    {product.categoryInfo?.name || product.category || 'N/A'}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                                    $ {product.price?.toFixed(2)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                                    {product.stockQuantity}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                                    {product.sales || 0}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                                    {product.material || 'N/A'}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                                    {product.brand || 'N/A'}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                    <div className='flex items-center gap-4'>
                                        <button onClick={() => setAddModalOpen(true)} className='text-green-500 hover:text-green-700'>
                                            <UserPlus size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className='text-red-500 hover:text-red-700'
                                            disabled={actionLoading.delete === product.id}
                                        >
                                            {actionLoading.delete === product.id ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className='flex justify-between items-center mt-4'>
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='text-gray-400 hover:text-gray-100'
                >
                    <ChevronLeft size={20} />
                </button>
                <span className='text-gray-100'>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='text-gray-400 hover:text-gray-100'
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-100">Add New Product</h2>
                            <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddProduct();
                        }} className="space-y-4">
                            {/* Basic Information - Required Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Name*</label>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Category*</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Price and Stock Information - Required Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Price*</label>
                                    <input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Stock Quantity*</label>
                                    <input
                                        type="number"
                                        value={newProduct.stockQuantity}
                                        onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description Fields - Optional */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Short Description</label>
                                    <textarea
                                        value={newProduct.shortDescription}
                                        onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            {/* Additional Details - Optional */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        value={newProduct.brand}
                                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Material</label>
                                    <input
                                        type="text"
                                        value={newProduct.material}
                                        onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                    />
                                </div>
                            </div>

                            {/* Dimensions - Optional */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Length (cm)</label>
                                    <input
                                        type="number"
                                        value={newProduct.dimensions.length}
                                        onChange={(e) => setNewProduct({
                                            ...newProduct,
                                            dimensions: { ...newProduct.dimensions, length: e.target.value }
                                        })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Width (cm)</label>
                                    <input
                                        type="number"
                                        value={newProduct.dimensions.width}
                                        onChange={(e) => setNewProduct({
                                            ...newProduct,
                                            dimensions: { ...newProduct.dimensions, width: e.target.value }
                                        })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={newProduct.dimensions.height}
                                        onChange={(e) => setNewProduct({
                                            ...newProduct,
                                            dimensions: { ...newProduct.dimensions, height: e.target.value }
                                        })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Other Optional Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Style</label>
                                    <input
                                        type="text"
                                        value={newProduct.style}
                                        onChange={(e) => setNewProduct({ ...newProduct, style: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={newProduct.weight}
                                        onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    value={newProduct.discount}
                                    onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded p-2"
                                    min="0"
                                    max="100"
                                />
                            </div>

                            {/* Assembly Required Checkbox */}
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={newProduct.assemblyRequired}
                                        onChange={(e) => setNewProduct({ ...newProduct, assemblyRequired: e.target.checked })}
                                        className="bg-gray-700 rounded"
                                    />
                                    <span className="text-gray-300">Assembly Required</span>
                                </label>
                            </div>

                            {/* File Upload Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Product Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setNewProduct({ ...newProduct, images: e.target.files })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        accept="image/*"
                                    />
                                    {newProduct.images?.length > 0 && (
                                        <p className="text-gray-400 text-sm mt-1">
                                            Selected images: {newProduct.images.length} files
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">3D Model</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setNewProduct({ ...newProduct, model3d: e.target.files[0] })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        accept=".glb,.gltf"
                                    />
                                    {newProduct.model3d && (
                                        <p className="text-gray-400 text-sm mt-1">
                                            Selected model: {newProduct.model3d.name}
                                        </p>
                                    )}
                                    <p className="text-gray-400 text-sm mt-1">Accepted formats: .glb, .gltf</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={actionLoading.add}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    {actionLoading.add ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Product Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-100">Edit Product</h2>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleEditProduct();
                        }} className="space-y-4">
                            {/* Basic Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Name*</label>
                                    <input
                                        type="text"
                                        value={editProduct.name}
                                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Category*</label>
                                    <select
                                        value={editProduct.category}
                                        onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Price and Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Price*</label>
                                    <input
                                        type="number"
                                        value={editProduct.price}
                                        onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Stock Quantity*</label>
                                    <input
                                        type="number"
                                        value={editProduct.stockQuantity}
                                        onChange={(e) => setEditProduct({ ...editProduct, stockQuantity: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={editProduct.description}
                                        onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Short Description</label>
                                    <textarea
                                        value={editProduct.shortDescription}
                                        onChange={(e) => setEditProduct({ ...editProduct, shortDescription: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            {/* Dimensions */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Length (cm)</label>
                                    <input
                                        type="number"
                                        value={editProduct.dimensions.length}
                                        onChange={(e) => setEditProduct({
                                            ...editProduct,
                                            dimensions: { ...editProduct.dimensions, length: e.target.value }
                                        })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Width (cm)</label>
                                    <input
                                        type="number"
                                        value={editProduct.dimensions.width}
                                        onChange={(e) => setEditProduct({
                                            ...editProduct,
                                            dimensions: { ...editProduct.dimensions, width: e.target.value }
                                        })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={editProduct.dimensions.height}
                                        onChange={(e) => setEditProduct({
                                            ...editProduct,
                                            dimensions: { ...editProduct.dimensions, height: e.target.value }
                                        })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        value={editProduct.brand}
                                        onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Material</label>
                                    <input
                                        type="text"
                                        value={editProduct.material}
                                        onChange={(e) => setEditProduct({ ...editProduct, material: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">Style</label>
                                    <input
                                        type="text"
                                        value={editProduct.style}
                                        onChange={(e) => setEditProduct({ ...editProduct, style: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={editProduct.weight}
                                        onChange={(e) => setEditProduct({ ...editProduct, weight: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    value={editProduct.discount}
                                    onChange={(e) => setEditProduct({ ...editProduct, discount: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded p-2"
                                    min="0"
                                    max="100"
                                />
                            </div>

                            {/* Assembly Required Checkbox */}
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={editProduct.assemblyRequired}
                                        onChange={(e) => setEditProduct({ ...editProduct, assemblyRequired: e.target.checked })}
                                        className="bg-gray-700 rounded"
                                    />
                                    <span className="text-gray-300">Assembly Required</span>
                                </label>
                            </div>

                            {/* File Uploads */}
                            <div className="space-y-4">
                                {/* Current Images Display */}
                                {editProduct.images?.length > 0 && (
                                    <div>
                                        <label className="block text-gray-300 mb-1">Current Images</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {editProduct.images.map((img, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={img}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImages = editProduct.images.filter((_, i) => i !== index);
                                                            setEditProduct({ ...editProduct, images: newImages });
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images Upload */}
                                <div>
                                    <label className="block text-gray-300 mb-1">Add New Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setEditProduct({ ...editProduct, newImages: e.target.files })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        accept="image/*"
                                    />
                                </div>

                                {/* 3D Model Upload */}
                                <div>
                                    <label className="block text-gray-300 mb-1">3D Model</label>
                                    {editProduct.model3d && (
                                        <div className="mb-2">
                                            <p className="text-gray-400">Current model: {editProduct.model3d}</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        onChange={(e) => setEditProduct({ ...editProduct, newModel3d: e.target.files[0] })}
                                        className="w-full bg-gray-700 text-white rounded p-2"
                                        accept=".glb,.gltf"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={actionLoading.edit}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    {actionLoading.edit ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default ProductTable;
