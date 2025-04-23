import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Search, Trash2, Plus, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    const [editProduct, setEditProduct] = useState({
        _id: '',
        productName: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryID: '',
        brand: '',
        discount: '',
        sold: 0,
        isActive: true,
    });

    const [newProduct, setNewProduct] = useState({
        productName: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryID: '',
        brand: '',
        discount: '',
        sold: 0,
        isActive: true,
        images: []
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `http://localhost:3000/api/admin/products?page=${currentPage}&search=${searchTerm}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.totalPages);
            setTotalProducts(response.data.pagination.totalProducts);
        } catch (error) {
            toast.error('Error fetching products');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/admin/categories');
            setCategories(response.data.categories);
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleAddProduct = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            Object.entries(newProduct).forEach(([key, value]) => {
                if (key === 'images') {
                    value.forEach(img => formData.append('images', img));
                } else {
                    formData.append(key, value);
                }
            });
            await axios.post('http://localhost:3000/api/admin/products', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Product added successfully');
            setAddModalOpen(false);
            setNewProduct({ productName: '', description: '', price: '', stockQuantity: '', categoryID: '', brand: '', discount: '', images: [] });
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding product');
        }
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setEditModalOpen(true);
    };

    const handleUpdateProduct = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            Object.entries(editProduct).forEach(([key, value]) => {
                formData.append(key, value);
            });
            await axios.put(`http://localhost:3000/api/admin/products/${editProduct._id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Product updated successfully');
            setEditModalOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`http://localhost:3000/api/admin/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting product');
            }
        }
    };

    const handleToggleActive = async (productId, currentStatus) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`http://localhost:3000/api/admin/products/${productId}`, { isActive: !currentStatus }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating product status');
        }
    };

    return (
        <motion.div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700">
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Product List</h2>
                <div className='flex gap-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 text-gray-400' size={20} />
                        <input
                            type="text"
                            placeholder='Search products...'
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
                        Add Product
                    </button>
                </div>
            </div>

            {loading ? (
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className='animate-spin text-purple-600' size={40} />
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-700'>
                        <thead>
                            <tr>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Image</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Name</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Brand</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Price</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Stock Quantity</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Sold</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Status</th>
                                <th className='px-6 py-3 text-left text-sm font-medium text-gray-300'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-700'>
                            {products.map(product => (
                                <motion.tr
                                    key={product._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <td className='px-6 py-4'>
                                        <img src={product.images?.[0]?.url} alt={product.productName} className='h-12 w-12 rounded object-cover' />
                                    </td>
                                    <td className='px-6 py-4 text-gray-100'>{product.productName}</td>
                                    <td className='px-6 py-4 text-gray-300'>{product.brand}</td>
                                    <td className='px-6 py-4 text-green-400 font-medium'>${product.price}</td>
                                    <td className='px-6 py-4 text-yellow-400'>{product.stockQuantity}</td>
                                    <td className='px-6 py-4 text-blue-400'>{product.sold}</td>
                                    <td className='px-6 py-4'>
                                        {product.isActive ? (
                                            <span className='text-green-500 font-medium'>Active</span>
                                        ) : (
                                            <span className='text-red-500 font-medium'>Inactive</span>
                                        )}
                                    </td>
                                    <td className='px-6 py-4 flex space-x-3'>
                                        <button onClick={() => handleEdit(product)} className='text-indigo-400 hover:text-indigo-300'>
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(product._id)} className='text-red-400 hover:text-red-300'>
                                            <Trash2 size={18} />
                                        </button>
                                        <button onClick={() => handleToggleActive(product._id, product.isActive)} className={`text-${product.isActive ? 'red' : 'green'}-400 hover:text-${product.isActive ? 'red' : 'green'}-300`}>
                                            {product.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className='mt-4 flex justify-between items-center'>
                <span className='text-gray-400'>
                    Showing {products.length} of {totalProducts} products
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

            {isAddModalOpen && (
                <ProductModal
                    title="Add Product"
                    onClose={() => setAddModalOpen(false)}
                    onSubmit={handleAddProduct}
                    product={newProduct}
                    setProduct={setNewProduct}
                    buttonLabel="Add Product"
                    buttonColor="bg-purple-600 hover:bg-purple-700"
                    categories={categories}
                />
            )}
            {isEditModalOpen && (
                <ProductModal
                    title="Edit Product"
                    onClose={() => setEditModalOpen(false)}
                    onSubmit={handleUpdateProduct}
                    product={editProduct}
                    setProduct={setEditProduct}
                    buttonLabel="Update Product"
                    buttonColor="bg-blue-600 hover:bg-blue-700"
                    categories={categories}
                />
            )}
        </motion.div>
    );
};

const ProductModal = ({ title, onClose, onSubmit, product, setProduct, buttonLabel, buttonColor, categories }) => (
    <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-red-400">
                    <X />
                </button>
            </div>
            {[
                { name: 'productName', label: 'Product Name' },
                { name: 'description', label: 'Description' },
                { name: 'price', label: 'Price', type: 'number' },
                { name: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
                { name: 'brand', label: 'Brand' },
                { name: 'discount', label: 'Discount', type: 'number' },
            ].map(field => (
                <div key={field.name}>
                    <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                    <input
                        type={field.type || 'text'}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                        value={product[field.name]}
                        onChange={(e) => setProduct(prev => ({ ...prev, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    />
                </div>
            ))}
            <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    value={product.categoryID}
                    onChange={(e) => setProduct(prev => ({ ...prev, categoryID: e.target.value }))}
                >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) && categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}

                </select>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">Images (max 5)</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setProduct(prev => ({ ...prev, images: [...e.target.files].slice(0, 5) }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
            </div>
            <button onClick={onSubmit} className={`w-full ${buttonColor} text-white py-2 rounded-lg font-medium`}>
                {buttonLabel}
            </button>
        </motion.div>
    </motion.div>
);

export default ProductTable;
