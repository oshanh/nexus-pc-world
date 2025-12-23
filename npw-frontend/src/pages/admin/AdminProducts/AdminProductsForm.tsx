import React from 'react';
import GamingButton from '../../../components/GamingButton';
import type { Category, ProductFormState } from './AdminProducts.types';

interface AdminProductsFormProps {
    editingId: string | null;
    formData: ProductFormState;
    categories: Category[];
    fallbackCategories: string[];
    fallbackSubCategories: string[];
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    onImageUrlChange: (index: number, value: string) => void;
    onSpecChange: (index: number, field: 'name' | 'value', value: string) => void;
    onAddSpecField: () => void;
    onRemoveSpecField: (index: number) => void;
    onCancel: () => void;
}

const AdminProductsForm: React.FC<AdminProductsFormProps> = ({
    editingId,
    formData,
    categories,
    fallbackCategories,
    fallbackSubCategories,
    isSubmitting,
    onSubmit,
    onInputChange,
    onImageUrlChange,
    onSpecChange,
    onAddSpecField,
    onRemoveSpecField,
    onCancel
}) => {
    const categoryOptions = categories.length ? categories.map((cat) => cat.name) : fallbackCategories;
    const subCategoryOptions =
        formData.category === ''
            ? []
            : categories.length
                ? categories.find((c) => c.name === formData.category)?.subcategories || []
                : fallbackSubCategories;

    return (
        <div className="max-w-3xl mx-auto bg-nexus-dark p-8 rounded-lg border border-nexus-blue/30 shadow-2xl">
            <h2 className="text-2xl font-exo font-bold text-white mb-6 border-b border-nexus-gray pb-4">
                {editingId ? `Update Unit ID: ${editingId}` : 'Initialize New Unit'}
            </h2>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-nexus-blue text-sm font-bold mb-2">
                            Product Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-nexus-blue text-sm font-bold mb-2">
                            Price (Rs.)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={onInputChange}
                            onWheel={(e) => {
                                (e.currentTarget as HTMLInputElement).blur();
                            }}
                            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none no-spin"
                            required
                            min={0}
                            step={0.01}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-nexus-blue text-sm font-bold mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={onInputChange}
                            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                            required
                        >
                            <option value="" disabled>
                                Select category
                            </option>
                            {categoryOptions.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="subCategory" className="block text-nexus-blue text-sm font-bold mb-2">
                            Sub-Category
                        </label>
                        <select
                            id="subCategory"
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={onInputChange}
                            className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                            required
                            disabled={formData.category === ''}
                        >
                            <option value="" disabled>
                                Select sub-category
                            </option>
                            {subCategoryOptions.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="stock" className="block text-nexus-blue text-sm font-bold mb-2">Stock Count</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={onInputChange}
                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                        min="0"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="imageUrls" className="block text-nexus-blue text-sm font-bold mb-2">Product Images (Up to 4)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="flex gap-2">
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        value={formData.imageUrls?.[index] || ''}
                                        onChange={(e) => onImageUrlChange(index, e.target.value)}
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none text-sm"
                                        placeholder={`Image URL ${index + 1}`}
                                    />
                                </div>
                                <div className="flex-shrink-0 w-10 h-10 bg-nexus-gray rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                                    {formData.imageUrls?.[index] ? (
                                        <img
                                            src={formData.imageUrls[index]}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-600 text-xs">{index + 1}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="shortDescription" className="block text-nexus-blue text-sm font-bold mb-2">Short Description</label>
                    <input
                        type="text"
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={onInputChange}
                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                        maxLength={150}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-nexus-blue text-sm font-bold mb-2">Full Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={onInputChange}
                        rows={4}
                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                        required
                    ></textarea>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="specs" className="block text-nexus-blue text-sm font-bold">Technical Specifications</label>
                        <button
                            type="button"
                            onClick={onAddSpecField}
                            className="text-xs text-green-400 hover:text-green-300 font-bold"
                        >
                            + Add Spec
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.specs?.map((spec, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Spec Name (e.g., CPU)"
                                    value={spec.name}
                                    onChange={(e) => onSpecChange(index, 'name', e.target.value)}
                                    className="flex-1 bg-nexus-gray border border-nexus-purple/30 rounded py-1 px-2 text-sm text-white focus:outline-none focus:border-nexus-blue"
                                />
                                <input
                                    type="text"
                                    placeholder="Value (e.g., Intel i9)"
                                    value={spec.value}
                                    onChange={(e) => onSpecChange(index, 'value', e.target.value)}
                                    className="flex-1 bg-nexus-gray border border-nexus-purple/30 rounded py-1 px-2 text-sm text-white focus:outline-none focus:border-nexus-blue"
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveSpecField(index)}
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
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {editingId ? 'Updating...' : 'Deploying...'}
                            </span>
                        ) : editingId ? (
                            'Update Unit'
                        ) : (
                            'Deploy Unit to Stock'
                        )}
                    </GamingButton>
                    {editingId && (
                        <GamingButton
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel Update
                        </GamingButton>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AdminProductsForm;
