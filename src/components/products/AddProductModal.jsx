import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AddProductModal = ({ onClose, onSubmit, newProduct, setNewProduct, categories, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
                className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-100">Add New Product</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-100">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Name*</label>
                            <input
                                type="text"
                                required
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">Price*</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Description</label>
                            <textarea
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">Short Description</label>
                            <textarea
                                value={newProduct.shortDescription}
                                onChange={(e) => setNewProduct({...newProduct, shortDescription: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                rows="2"
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Category*</label>
                            <select
                                required
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">Stock Quantity*</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={newProduct.stockQuantity}
                                onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                    </div>

                    {/* Discount and Assembly */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Discount (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={newProduct.discount}
                                onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={newProduct.assemblyRequired}
                                    onChange={(e) => setNewProduct({
                                        ...newProduct,
                                        assemblyRequired: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                Assembly Required
                            </label>
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newProduct.weight}
                                onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">Style</label>
                            <input
                                type="text"
                                value={newProduct.style}
                                onChange={(e) => setNewProduct({...newProduct, style: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Brand</label>
                            <input
                                type="text"
                                value={newProduct.brand}
                                onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">Material</label>
                            <input
                                type="text"
                                value={newProduct.material}
                                onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div>
                        <label className="block text-gray-300 mb-1">Dimensions</label>
                        <div className="grid grid-cols-4 gap-2">
                            <input
                                type="number"
                                placeholder="Height"
                                value={newProduct.dimensions.height}
                                onChange={(e) => setNewProduct({
                                    ...newProduct,
                                    dimensions: { ...newProduct.dimensions, height: e.target.value }
                                })}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                            <input
                                type="number"
                                placeholder="Width"
                                value={newProduct.dimensions.width}
                                onChange={(e) => setNewProduct({
                                    ...newProduct,
                                    dimensions: { ...newProduct.dimensions, width: e.target.value }
                                })}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                            <input
                                type="number"
                                placeholder="Depth"
                                value={newProduct.dimensions.depth}
                                onChange={(e) => setNewProduct({
                                    ...newProduct,
                                    dimensions: { ...newProduct.dimensions, depth: e.target.value }
                                })}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            />
                            <select
                                value={newProduct.dimensions.unit}
                                onChange={(e) => setNewProduct({
                                    ...newProduct,
                                    dimensions: { ...newProduct.dimensions, unit: e.target.value }
                                })}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            >
                                <option value="in">inches</option>
                                <option value="cm">cm</option>
                            </select>
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Product Images</label>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setNewProduct({...newProduct, images: e.target.files})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                accept="image/*"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">3D Model</label>
                            <input
                                type="file"
                                onChange={(e) => setNewProduct({...newProduct, model3d: e.target.files[0]})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                accept=".glb,.gltf"
                            />
                            <p className="text-gray-400 text-sm mt-1">Accepted formats: .glb, .gltf</p>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            {isLoading ? (
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
    );
};

export default AddProductModal; 