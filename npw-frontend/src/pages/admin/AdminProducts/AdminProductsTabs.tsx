import React from 'react';
import type { AdminProductsTab } from './AdminProducts.types';

interface AdminProductsTabsProps {
    activeTab: AdminProductsTab;
    editingId: string | null;
    onSelectList: () => void;
    onSelectInactive: () => void;
    onSelectForm: () => void;
    onSelectCategories: () => void;
}

const AdminProductsTabs: React.FC<AdminProductsTabsProps> = ({
    activeTab,
    editingId,
    onSelectList,
    onSelectInactive,
    onSelectForm,
    onSelectCategories
}) => {
    return (
        <div className="flex bg-nexus-dark/80 p-1.5 rounded-full border border-nexus-blue/30 mt-4 md:mt-0 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <button
                onClick={onSelectList}
                className={`px-8 py-2 rounded-full font-exo font-bold text-sm transition-all duration-300 ${
                    activeTab === 'list'
                        ? 'bg-nexus-blue text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
                INVENTORY
            </button>
            <button
                onClick={onSelectInactive}
                className={`px-8 py-2 rounded-full font-exo font-bold text-sm transition-all duration-300 ${
                    activeTab === 'inactive'
                        ? 'bg-nexus-blue text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
                INACTIVE
            </button>
            <button
                onClick={onSelectForm}
                className={`px-8 py-2 rounded-full font-exo font-bold text-sm transition-all duration-300 ${
                    activeTab === 'form'
                        ? 'bg-nexus-blue text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
                {editingId ? 'EDIT UNIT' : 'NEW UNIT'}
            </button>
            <button
                onClick={onSelectCategories}
                className={`ml-4 px-4 py-2 rounded-full font-exo font-bold text-sm transition-all duration-300 ${
                    activeTab === 'categories'
                        ? 'bg-nexus-blue text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
                CATEGORY
            </button>
        </div>
    );
};

export default AdminProductsTabs;
