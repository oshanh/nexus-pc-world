
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import Toast from '../../components/Toast';
import AccessDenied from '../../components/AccessDenied';
import AdminLayout from '../../components/AdminLayout';
import type { Product } from '../../types';
import { categoryService } from '../../services/categoryService';
import AdminProductsTabs from './AdminProducts/AdminProductsTabs';
import AdminProductsInventoryTable from './AdminProducts/AdminProductsInventoryTable';
import AdminProductsForm from './AdminProducts/AdminProductsForm';
import AdminProductsCategoryManagement from './AdminProducts/AdminProductsCategoryManagement';
import type { AdminProductsTab, Category, ProductFormState } from './AdminProducts/AdminProducts.types';

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
    const [activeTab, setActiveTab] = useState<AdminProductsTab>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({ message: '', type: 'success', visible: false });
    const [categories, setCategories] = useState<Category[]>([]);
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

    const [formData, setFormData] = useState<ProductFormState>({
        name: '',
        category: '',
        subCategory: '',
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
            category: '',
            subCategory: '',
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
            price: String(priceNum),
            imageUrls: paddedImages
        });
        setEditingId(product.id);
        setActiveTab('form');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'category') {
            if (value === '') {
                setFormData((prev) => ({ ...prev, category: '', subCategory: '' }));
                return;
            }
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
            setFormData(prev => ({ ...prev, price: value }));
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
        if (
            !formData.name ||
            !formData.category ||
            !formData.subCategory ||
            formData.price === '' ||
            !Number.isFinite(priceNumber) ||
            priceNumber < 0 ||
            !formData.description
        ) {
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
                        <AdminProductsTabs
                            activeTab={activeTab}
                            editingId={editingId}
                            onSelectList={() => {
                                setActiveTab('list');
                                resetForm();
                            }}
                            onSelectForm={() => {
                                if (!editingId) resetForm();
                                setActiveTab('form');
                            }}
                            onSelectCategories={() => setActiveTab('categories')}
                        />
                    </div>

                    {activeTab === 'list' ? (
                        <AdminProductsInventoryTable
                            products={products}
                            isDeleting={isDeleting}
                            onEditClick={handleEditClick}
                            onDeleteClick={handleDelete}
                        />
                    ) : activeTab === 'form' ? (
                        <AdminProductsForm
                            editingId={editingId}
                            formData={formData}
                            categories={categories}
                            fallbackCategories={FALLBACK_CATEGORIES}
                            fallbackSubCategories={FALLBACK_SUBCATS}
                            isSubmitting={isSubmitting}
                            onSubmit={handleSubmit}
                            onInputChange={handleInputChange}
                            onImageUrlChange={handleImageUrlChange}
                            onSpecChange={handleSpecChange}
                            onAddSpecField={addSpecField}
                            onRemoveSpecField={removeSpecField}
                            onCancel={() => {
                                resetForm();
                                setActiveTab('list');
                            }}
                        />
                    ) : (
                        <AdminProductsCategoryManagement
                            categories={categories}
                            newCategoryName={newCategoryName}
                            subInputs={subInputs}
                            onNewCategoryNameChange={setNewCategoryName}
                            onSubInputChange={(categoryId, next) =>
                                setSubInputs((prev) => ({ ...prev, [categoryId]: next }))
                            }
                            onCreateCategory={handleCreateCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onAddSub={handleAddSub}
                            onRemoveSub={handleRemoveSub}
                        />
                    )}
                </div>
                <Toast message={toast.message} type={toast.type} visible={toast.visible} />
            </section>
        </AdminLayout>
    );
};

export default AdminProducts;
