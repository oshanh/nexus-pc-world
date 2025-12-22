import React from 'react';
import GamingButton from '../../../components/GamingButton';
import type { Category } from './AdminProducts.types';

interface AdminProductsCategoryManagementProps {
    categories: Category[];
    newCategoryName: string;
    subInputs: Record<string, string>;
    onNewCategoryNameChange: (next: string) => void;
    onSubInputChange: (categoryId: string, next: string) => void;
    onCreateCategory: () => Promise<void>;
    onDeleteCategory: (id: string, name: string) => Promise<void>;
    onAddSub: (id: string) => Promise<void>;
    onRemoveSub: (id: string, sub: string) => Promise<void>;
}

const AdminProductsCategoryManagement: React.FC<AdminProductsCategoryManagementProps> = ({
    categories,
    newCategoryName,
    subInputs,
    onNewCategoryNameChange,
    onSubInputChange,
    onCreateCategory,
    onDeleteCategory,
    onAddSub,
    onRemoveSub
}) => {
    return (
        <div className="max-w-4xl mx-auto bg-nexus-dark p-6 rounded-lg border border-nexus-blue/30 shadow-lg">
            <h2 className="text-2xl font-exo font-bold text-white mb-4">Category Management</h2>

            <div className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => onNewCategoryNameChange(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                />
                <GamingButton onClick={onCreateCategory} variant="cta">
                    Create
                </GamingButton>
            </div>

            <div className="space-y-4">
                {categories.length === 0 ? (
                    <div className="text-gray-400">No categories yet. Create one to begin.</div>
                ) : (
                    categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-nexus-dark/80 p-4 rounded border border-nexus-gray flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        >
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-white">{cat.name}</h3>
                                    <span className="text-sm text-gray-400">{cat.subcategories?.length ?? 0} sub</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(cat.subcategories || []).map((sub) => (
                                        <div
                                            key={sub}
                                            className="bg-nexus-blue/10 text-nexus-blue px-2 py-1 rounded text-sm flex items-center gap-2"
                                        >
                                            <span>{sub}</span>
                                            <button
                                                onClick={() => onRemoveSub(cat.id, sub)}
                                                className="text-red-400 text-xs"
                                                aria-label={`Remove ${sub}`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="text"
                                        value={subInputs[cat.id] || ''}
                                        onChange={(e) => onSubInputChange(cat.id, e.target.value)}
                                        placeholder="Add subcategory"
                                        className="bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    />
                                    <GamingButton size="sm" onClick={() => onAddSub(cat.id)}>
                                        Add
                                    </GamingButton>
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                <GamingButton
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onDeleteCategory(cat.id, cat.name)}
                                >
                                    Delete
                                </GamingButton>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminProductsCategoryManagement;
