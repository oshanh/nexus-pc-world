import React from 'react';
import GamingButton from '../../components/GamingButton';
import type { Product } from '../../types';

interface AdminProductsInventoryTableProps {
    products: Product[];
    isDeleting: string | null;
    onEditClick: (product: Product) => void;
    onDeleteClick: (id: string, name: string) => void;
}

const AdminProductsInventoryTable: React.FC<AdminProductsInventoryTableProps> = ({
    products,
    isDeleting,
    onEditClick,
    onDeleteClick
}) => {
    return (
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
                        {products.map((product) => (
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
                                            onClick={() => onEditClick(product)}
                                            variant="secondary"
                                            size="sm"
                                            iconOnly={true}
                                            className="!h-8 !w-8"
                                            aria-label="Edit"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </GamingButton>
                                        <GamingButton
                                            onClick={() => onDeleteClick(product.id, product.name)}
                                            variant="danger"
                                            size="sm"
                                            iconOnly={true}
                                            disabled={isDeleting === product.id}
                                            className="!h-8 !w-8"
                                            aria-label="Delete"
                                        >
                                            {isDeleting === product.id ? (
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
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
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
                <div className="p-12 text-center text-gray-500">Database empty. Initialize new stock.</div>
            )}
        </div>
    );
};

export default AdminProductsInventoryTable;
