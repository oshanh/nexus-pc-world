
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import GamingButton from '../../components/GamingButton';
import Toast from '../../components/Toast';
import AccessDenied from '../../components/AccessDenied';
import type { Product } from '../../types';

interface AdminPageProps {
    navigateTo: (path: string) => void;
}

const CATEGORIES = ['Desktop', 'Laptop', 'Accessory'];
const SUB_CATEGORIES = [
    'Normal PC', 'Middle-End PC', 'High-End PC', 
    'Normal Lap', 'Middle-End Lap', 'Gaming Lap', 
    'Cpu', 'Ram', 'Storage', 'VGA', 'Keyboard', 'Mouse', 'Headset', 'Monitors', 'Mouse Pads', 'HDMI Cables'
];

// using reusable Toast component in components/Toast.tsx

const AdminProducts: React.FC<AdminPageProps> = ({ navigateTo }) => {
    const { isAdmin, adminMode, user } = useAuth();
    const { products, addProduct, deleteProduct, updateProduct } = useProducts();
    const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({ message: '', type: 'success', visible: false });

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        category: 'Desktop',
        subCategory: 'Normal PC',
        price: 'Rs ',
        stock: 0,
        shortDescription: '',
        description: '',
        imageUrls: ['', '', '', ''], // Initialize with 4 empty strings
        specs: [{ name: '', value: '' }]
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
    };

    if (!isAdmin || !adminMode) {
        return (
            <AccessDenied
                title="Access Denied"
                description="You do not have clearance to access the Command Center."
                backText="Return to Base"
                onBack={() => navigateTo('/')} 
            />
        );
    }

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Desktop',
            subCategory: 'Normal PC',
            price: 'Rs ',
            stock: 0,
            shortDescription: '',
            description: '',
            imageUrls: ['', '', '', ''],
            specs: [{ name: '', value: '' }]
        });
        setEditingId(null);
    };

    const handleEditClick = (product: Product) => {
        const paddedImages = [...product.imageUrls];
        while (paddedImages.length < 4) paddedImages.push('');

        setFormData({
            ...product,
            imageUrls: paddedImages
        });
        setEditingId(product.id);
        setActiveTab('form');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' ? parseInt(value) || 0 : value
        }));
    };

    const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
        const newSpecs = [...(formData.specs || [])];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData(prev => ({ ...prev, specs: newSpecs }));
    };

    const addSpecField = () => {
        setFormData(prev => ({ ...prev, specs: [...(prev.specs || []), { name: '', value: '' }] }));
    };

    const removeSpecField = (index: number) => {
        const newSpecs = [...(formData.specs || [])];
        newSpecs.splice(index, 1);
        setFormData(prev => ({ ...prev, specs: newSpecs }));
    };

    const handleImageUrlChange = (index: number, value: string) => {
        const newUrls = [...(formData.imageUrls || ['', '', '', ''])];
        newUrls[index] = value;
        setFormData(prev => ({ ...prev, imageUrls: newUrls }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name || !formData.price || !formData.description) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        // Filter out empty image URLs
        const validImageUrls = (formData.imageUrls || []).filter(url => url && url.trim() !== '');

        if (validImageUrls.length === 0) {
            showToast('Please provide at least one image URL.', 'error');
            return;
        }

        const productData = {
            name: formData.name!,
            category: formData.category as any,
            subCategory: formData.subCategory as any,
            price: formData.price!,
            stock: formData.stock || 0,
            shortDescription: formData.shortDescription || formData.description!.substring(0, 100) + '...',
            description: formData.description!,
            imageUrls: validImageUrls,
            specs: formData.specs!.filter(s => s.name && s.value)
        };

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateProduct(editingId, productData);
                showToast('Product updated successfully!', 'success');
            } else {
                await addProduct(productData);
                showToast('Product added successfully!', 'success');
            }
            
            resetForm();
            setActiveTab('list');
        } catch (err) {
            showToast(`Failed to ${editingId ? 'update' : 'add'} product. Please try again.`, 'error');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        
        setIsDeleting(id);
        try {
            await deleteProduct(id);
            showToast('Product deleted successfully!', 'success');
        } catch (err) {
            showToast('Failed to delete product. Please try again.', 'error');
            console.error(err);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <section className="py-20 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-exo font-bold text-white mb-2">Command Center</h1>
                        <p className="text-nexus-blue font-mono">Operator: {user?.name} | Clearance: ADMIN</p>
                    </div>
                    {/* New Styled Tab Switcher */}
                    <div className="flex bg-nexus-dark/80 p-1.5 rounded-full border border-nexus-blue/30 mt-4 md:mt-0 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <button 
                            onClick={() => { setActiveTab('list'); resetForm(); }}
                            className={`px-8 py-2 rounded-full font-exo font-bold text-sm transition-all duration-300 ${
                                activeTab === 'list' 
                                ? 'bg-nexus-blue text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            INVENTORY
                        </button>
                        <button 
                            onClick={() => setActiveTab('form')}
                            className={`px-8 py-2 rounded-full font-exo font-bold text-sm transition-all duration-300 ${
                                activeTab === 'form' 
                                ? 'bg-nexus-blue text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {editingId ? 'EDIT UNIT' : 'NEW UNIT'}
                        </button>
                    </div>
                    <div className="flex items-center gap-3 ml-4 mt-4 md:mt-0">
                        <GamingButton onClick={() => navigateTo('/admin')} variant="primary" size="sm">Dashboard</GamingButton>
                        <GamingButton onClick={() => navigateTo('/admin/products')} variant="secondary" size="sm">Product CRUD</GamingButton>
                        <GamingButton onClick={() => navigateTo('/admin/users')} variant="secondary" size="sm">Users CRUD</GamingButton>
                        <GamingButton onClick={() => navigateTo('/admin/orders')} variant="secondary" size="sm">Orders CRUD</GamingButton>
                    </div>
                </div>

                {activeTab === 'list' ? (
                    <div className="bg-nexus-dark rounded-lg border border-nexus-gray overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-nexus-gray text-nexus-blue uppercase text-sm font-bold">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Product Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-nexus-gray/50 text-gray-300">
                                    {products.map(product => (
                                        <tr key={product.id} className="hover:bg-nexus-gray/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs">{product.id}</td>
                                            <td className="px-6 py-4 font-bold text-white">{product.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-nexus-blue/10 text-nexus-blue px-2 py-1 rounded text-xs border border-nexus-blue/20">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono">{product.price}</td>
                                            <td className="px-6 py-4 font-mono text-nexus-blue">{product.stock || 0}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <GamingButton 
                                                        onClick={() => handleEditClick(product)}
                                                        variant="secondary"
                                                        size="sm"
                                                        iconOnly={true}
                                                        className="!h-8 !w-8"
                                                        aria-label="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </GamingButton>
                                                    <GamingButton 
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        variant="danger"
                                                        size="sm"
                                                        iconOnly={true}
                                                        disabled={isDeleting === product.id}
                                                        className="!h-8 !w-8"
                                                        aria-label="Delete"
                                                    >
                                                        {isDeleting === product.id ? (
                                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                    </GamingButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {products.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                Database empty. Initialize new stock.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto bg-nexus-dark p-8 rounded-lg border border-nexus-blue/30 shadow-2xl">
                        <h2 className="text-2xl font-exo font-bold text-white mb-6 border-b border-nexus-gray pb-4">
                            {editingId ? `Update Unit ID: ${editingId}` : 'Initialize New Unit'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-nexus-blue text-sm font-bold mb-2">Product Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-nexus-blue text-sm font-bold mb-2">Price</label>
                                    <input 
                                        type="text" 
                                        name="price"
                                        value={formData.price} 
                                        onChange={handleInputChange} 
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-nexus-blue text-sm font-bold mb-2">Category</label>
                                    <select 
                                        name="category"
                                        value={formData.category} 
                                        onChange={handleInputChange} 
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-nexus-blue text-sm font-bold mb-2">Sub-Category</label>
                                    <select 
                                        name="subCategory"
                                        value={formData.subCategory} 
                                        onChange={handleInputChange} 
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    >
                                        {SUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                             <div>
                                <label className="block text-nexus-blue text-sm font-bold mb-2">Stock Count</label>
                                <input 
                                    type="number" 
                                    name="stock"
                                    value={formData.stock} 
                                    onChange={handleInputChange} 
                                    className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-nexus-blue text-sm font-bold mb-2">Product Images (Up to 4)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="flex-grow">
                                                <input 
                                                    type="text" 
                                                    value={formData.imageUrls?.[index] || ''} 
                                                    onChange={(e) => handleImageUrlChange(index, e.target.value)} 
                                                    className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none text-sm"
                                                    placeholder={`Image URL ${index + 1}`}
                                                />
                                            </div>
                                            <div className="flex-shrink-0 w-10 h-10 bg-nexus-gray rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                                                {formData.imageUrls?.[index] ? (
                                                    <img src={formData.imageUrls[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-600 text-xs">{index + 1}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-nexus-blue text-sm font-bold mb-2">Short Description</label>
                                <input 
                                    type="text" 
                                    name="shortDescription"
                                    value={formData.shortDescription} 
                                    onChange={handleInputChange} 
                                    className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    maxLength={150}
                                />
                            </div>

                            <div>
                                <label className="block text-nexus-blue text-sm font-bold mb-2">Full Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    rows={4}
                                    className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-nexus-blue text-sm font-bold">Technical Specifications</label>
                                    <button type="button" onClick={addSpecField} className="text-xs text-green-400 hover:text-green-300 font-bold">+ Add Spec</button>
                                </div>
                                <div className="space-y-2">
                                    {formData.specs?.map((spec, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Spec Name (e.g., CPU)" 
                                                value={spec.name} 
                                                onChange={(e) => handleSpecChange(index, 'name', e.target.value)} 
                                                className="flex-1 bg-nexus-gray border border-nexus-purple/30 rounded py-1 px-2 text-sm text-white focus:outline-none focus:border-nexus-blue"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Value (e.g., Intel i9)" 
                                                value={spec.value} 
                                                onChange={(e) => handleSpecChange(index, 'value', e.target.value)} 
                                                className="flex-1 bg-nexus-gray border border-nexus-purple/30 rounded py-1 px-2 text-sm text-white focus:outline-none focus:border-nexus-blue"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeSpecField(index)}
                                                className="text-red-500 hover:text-red-400 px-2"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-nexus-gray flex gap-4">
                                <GamingButton type="submit" variant="cta" className="flex-1" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            {editingId ? 'Updating...' : 'Deploying...'}
                                        </span>
                                    ) : (
                                        editingId ? 'Update Unit' : 'Deploy Unit to Stock'
                                    )}
                                </GamingButton>
                                {editingId && (
                                     <GamingButton type="button" variant="secondary" onClick={() => { resetForm(); setActiveTab('list'); }} disabled={isSubmitting}>
                                        Cancel Update
                                    </GamingButton>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
            <Toast message={toast.message} type={toast.type} visible={toast.visible} />
        </section>
    );
};

export default AdminProducts;
