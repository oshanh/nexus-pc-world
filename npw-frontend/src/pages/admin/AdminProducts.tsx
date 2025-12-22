
import React, { useState,useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import GamingButton from '../../components/GamingButton';
import Toast from '../../components/Toast';
import AccessDenied from '../../components/AccessDenied';
import AdminLayout from '../../components/AdminLayout';
import type { Product } from '../../types';
import { categoryService } from '../../services/categoryService';

interface AdminPageProps {
    navigateTo: (path: string) => void;
}

// Fallbacks (used until categories are loaded)
const FALLBACK_CATEGORIES = ['Desktop', 'Laptop', 'Accessory'];
const FALLBACK_SUBCATS = [
    'Normal PC', 'Middle-End PC', 'High-End PC', 
    'Normal Lap', 'Middle-End Lap', 'Gaming Lap', 
    'Cpu', 'Ram', 'Storage', 'VGA', 'Keyboard', 'Mouse', 'Headset', 'Monitors', 'Mouse Pads', 'HDMI Cables'
];


const AdminProducts: React.FC<AdminPageProps> = ({ navigateTo }) => {
    const { isAdmin, adminMode, user } = useAuth();
    const { products, addProduct, deleteProduct, updateProduct } = useProducts();
    const [activeTab, setActiveTab] = useState<'list' | 'form' | 'categories'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({ message: '', type: 'success', visible: false });
    const [categories, setCategories] = useState<Array<{ id: string; name: string; subcategories: string[] }>>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [subInputs, setSubInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        const load = async () => {
            try {
                const res = await categoryService.getCategories();
                setCategories(res.categories || []);
            } catch (err) {
                console.warn('Failed to load categories', err);
            }
        };
        load();
    }, []);

    // Form State
    type ProductFormState = Omit<Partial<Product>, 'price' | 'category' | 'subCategory'> & {
        price: number | '';
        category: string;
        subCategory: string;
    };

    const [formData, setFormData] = useState<ProductFormState>({
        name: '',
        category: 'Desktop',
        subCategory: 'Normal PC',
        price: '',
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
            price: '',
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

        const priceNum = (typeof product.price === 'number') ? product.price : (parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0);

        setFormData({
            ...product,
            category: product.category,
            subCategory: product.subCategory ?? '',
            price: priceNum,
            imageUrls: paddedImages
        });
        setEditingId(product.id);
        setActiveTab('form');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'category') {
            // When category changes, pick a related subcategory if available
            const cat = categories.find(c => c.name === value);
            const firstSub = (cat?.subcategories && cat.subcategories.length > 0) ? cat.subcategories[0] : (categories.length ? '' : FALLBACK_SUBCATS[0]);
            setFormData(prev => ({
                ...prev,
                category: value,
                subCategory: prev.subCategory && cat?.subcategories?.includes(prev.subCategory) ? prev.subCategory : firstSub
            }));
            return;
        }
        if (name === 'price') {
            if (value === '') {
                setFormData(prev => ({ ...prev, price: '' }));
                return;
            }
            const num = Number(value);
            setFormData(prev => ({ ...prev, price: Number.isFinite(num) ? num : prev.price }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' ? Number.parseInt(value) || 0 : value
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

        const priceNumber = formData.price === '' ? NaN : Number(formData.price);
        
        // Basic validation
        if (!formData.name || formData.price === '' || !Number.isFinite(priceNumber) || priceNumber < 0 || !formData.description) {
            showToast('Please fill in all required fields and ensure price is a non-negative number.', 'error');
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
            price: priceNumber,
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

    const reloadCategories = async () => {
        try {
            const res = await categoryService.getCategories();
            setCategories(res.categories || []);
        } catch (err) {
            console.warn('Failed to load categories', err);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            showToast('Category name required', 'error');
            return;
        }
        try {
            await categoryService.createCategory({ name: newCategoryName.trim(), subcategories: [] });
            setNewCategoryName('');
            showToast('Category created', 'success');
            await reloadCategories();
        } catch (err) {
            console.error(err);
            showToast('Failed to create category', 'error');
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!window.confirm(`Delete category "${name}"? This will clear the category field on any products using it.`)) return;
        try {
            await categoryService.deleteCategory(id);
            showToast('Category deleted', 'success');
            await reloadCategories();
        } catch (err) {
            console.error(err);
            showToast('Failed to delete category', 'error');
        }
    };

    const handleAddSub = async (id: string) => {
        const sub = (subInputs[id] || '').trim();
        if (!sub) return showToast('Subcategory name required', 'error');
        try {
            await categoryService.addSubcategory(id, sub);
            setSubInputs(prev => ({ ...prev, [id]: '' }));
            showToast('Subcategory added', 'success');
            await reloadCategories();
        } catch (err) {
            console.error(err);
            showToast('Failed to add subcategory', 'error');
        }
    };

    const handleRemoveSub = async (id: string, sub: string) => {
        if (!window.confirm(`Remove subcategory "${sub}"? This will clear the subcategory field on any products using it.`)) return;
        try {
            await categoryService.removeSubcategory(id, sub);
            showToast('Subcategory removed', 'success');
            await reloadCategories();
        } catch (err) {
            console.error(err);
            showToast('Failed to remove subcategory', 'error');
        }
    };

    const noSpinStyles = `
        /* Hide number input spinners across browsers */
        .no-spin::-webkit-outer-spin-button,
        .no-spin::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .no-spin {
            -moz-appearance: textfield;
        }
    `;

    return (
        <AdminLayout title="">
            <section className="py-0">
                <style>{noSpinStyles}</style>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                        <div>
                            <p className="text-nexus-blue font-mono">Operator: {user?.name}</p>
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
                            <button 
                                onClick={() => setActiveTab('categories')}
                                className={`ml-4 px-4 py-2 rounded-full font-exo font-bold text-sm transition-all duration-300 ${
                                    activeTab === 'categories' 
                                    ? 'bg-nexus-blue text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                CATEGORY
                            </button>
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
                                                <td className="px-6 py-4 font-mono">Rs {Number(product.price).toLocaleString()}</td>
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
                    ) : activeTab === 'form' ? (
                        <div className="max-w-3xl mx-auto bg-nexus-dark p-8 rounded-lg border border-nexus-blue/30 shadow-2xl">
                            <h2 className="text-2xl font-exo font-bold text-white mb-6 border-b border-nexus-gray pb-4">
                                {editingId ? `Update Unit ID: ${editingId}` : 'Initialize New Unit'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-nexus-blue text-sm font-bold mb-2">Product Name</label>
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
                                        <label htmlFor="price" className="block text-nexus-blue text-sm font-bold mb-2">Price (Rs.)</label>
                                        <input 
                                            type="number" 
                                            name="price"
                                            value={formData.price === '' ? '' : formData.price} 
                                            onChange={handleInputChange} 
                                            onWheel={(e) => { (e.currentTarget as HTMLInputElement).blur(); }}
                                            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none no-spin"
                                            required
                                            min={0}
                                            step={1}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="category" className="block text-nexus-blue text-sm font-bold mb-2">Category</label>
                                        <select 
                                            name="category"
                                            value={formData.category} 
                                            onChange={handleInputChange} 
                                            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                        >
                                            {(categories.length ? categories.map(cat => cat.name) : FALLBACK_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
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
                                            {((categories.length ? (categories.find(c => c.name === formData.category)?.subcategories || []) : FALLBACK_SUBCATS)).map(c => <option key={c} value={c}>{c}</option>)}
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
                    ) : (
                        <div className="max-w-4xl mx-auto bg-nexus-dark p-6 rounded-lg border border-nexus-blue/30 shadow-lg">
                            <h2 className="text-2xl font-exo font-bold text-white mb-4">Category Management</h2>

                            <div className="mb-6 flex gap-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="New category name"
                                    className="flex-1 bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                />
                                <GamingButton onClick={handleCreateCategory} variant="cta">Create</GamingButton>
                            </div>

                            <div className="space-y-4">
                                {categories.length === 0 ? (
                                    <div className="text-gray-400">No categories yet. Create one to begin.</div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="bg-nexus-dark/80 p-4 rounded border border-nexus-gray flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-white">{cat.name}</h3>
                                                    <span className="text-sm text-gray-400">{cat.subcategories?.length ?? 0} sub</span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(cat.subcategories || []).map(sub => (
                                                        <div key={sub} className="bg-nexus-blue/10 text-nexus-blue px-2 py-1 rounded text-sm flex items-center gap-2">
                                                            <span>{sub}</span>
                                                            <button onClick={() => handleRemoveSub(cat.id, sub)} className="text-red-400 text-xs" aria-label={`Remove ${sub}`}>✕</button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={subInputs[cat.id] || ''}
                                                        onChange={(e) => setSubInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                                                        placeholder="Add subcategory"
                                                        className="bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                                    />
                                                    <GamingButton size="sm" onClick={() => handleAddSub(cat.id)}>Add</GamingButton>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0">
                                                <GamingButton variant="danger" size="sm" onClick={() => handleDeleteCategory(cat.id, cat.name)}>Delete</GamingButton>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <Toast message={toast.message} type={toast.type} visible={toast.visible} />
            </section>
        </AdminLayout>
    );
};

export default AdminProducts;
