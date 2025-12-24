import React, { useMemo, useState } from 'react';
import GamingButton from '../../../components/GamingButton';
import type { Product, StockInPayload } from '../../../types';
import { useProducts } from '../../../contexts/ProductContext';
import AdminProductStockInHistory from './AdminProductStockInHistory';

type Tab = 'stockIn' | 'history';

interface AdminProductStockInModalProps {
    product: Product;
    onClose: () => void;
}

const toDateInputValue = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const AdminProductStockInModal: React.FC<AdminProductStockInModalProps> = ({ product, onClose }) => {
    const { stockInProduct } = useProducts();

    const [activeTab, setActiveTab] = useState<Tab>('stockIn');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const defaultDate = useMemo(() => toDateInputValue(new Date()), []);

    const [date, setDate] = useState(defaultDate);
    const [quantity, setQuantity] = useState<number>(1);
    const [buyingUnitPrice, setBuyingUnitPrice] = useState<string>('');
    const [sellingUnitPrice, setSellingUnitPrice] = useState<string>(String(product.price ?? 0));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const qty = Number(quantity);
        const selling = Number(sellingUnitPrice);
        const buying = buyingUnitPrice.trim() === '' ? undefined : Number(buyingUnitPrice);

        if (!Number.isFinite(qty) || qty <= 0) {
            setError('Quantity must be a positive number.');
            return;
        }
        if (!Number.isFinite(selling) || selling < 0) {
            setError('Selling unit price must be a non-negative number.');
            return;
        }
        if (buying !== undefined && (!Number.isFinite(buying) || buying < 0)) {
            setError('Buying unit price must be a non-negative number (or leave blank).');
            return;
        }

        const payload: StockInPayload = {
            quantity: qty,
            sellingUnitPrice: selling
        };
        if (date) payload.date = new Date(date).toISOString();
        if (buying !== undefined) payload.buyingUnitPrice = buying;

        setIsSubmitting(true);
        try {
            await stockInProduct(product.id, payload);
            setRefreshKey((k) => k + 1);
            setActiveTab('history');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            setError('Failed to stock in. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="w-full max-w-2xl bg-nexus-dark rounded-lg border border-nexus-blue/30 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-nexus-gray">
                    <div>
                        <div className="text-white font-bold">Stock In</div>
                        <div className="text-xs text-gray-400">
                            {product.name}{product.code ? ` • ${product.code}` : ''}
                        </div>
                    </div>
                    <GamingButton type="button" variant="secondary" onClick={onClose} iconOnly={true} className="!h-8 !w-8" aria-label="Close">
                        ×
                    </GamingButton>
                </div>

                <div className="px-6 pt-4">
                    <div className="flex gap-2 border-b border-nexus-gray">
                        <button
                            type="button"
                            onClick={() => setActiveTab('stockIn')}
                            className={`px-4 py-2 text-sm font-bold ${activeTab === 'stockIn' ? 'text-white border-b-2 border-nexus-blue' : 'text-gray-400'}`}
                        >
                            Stock In
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 text-sm font-bold ${activeTab === 'history' ? 'text-white border-b-2 border-nexus-blue' : 'text-gray-400'}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'stockIn' ? (
                        <form onSubmit={submit} className="space-y-4">
                            {error && <div className="text-red-400 text-sm">{error}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="stockInDate" className="block text-nexus-blue text-sm font-bold mb-2">Date</label>
                                    <input
                                        id="stockInDate"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="stockInQuantity" className="block text-nexus-blue text-sm font-bold mb-2">Quantity</label>
                                    <input
                                        id="stockInQuantity"
                                        type="number"
                                        min={1}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="stockInBuyingUnitPrice" className="block text-nexus-blue text-sm font-bold mb-2">Buying Unit Price (optional)</label>
                                    <input
                                        id="stockInBuyingUnitPrice"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={buyingUnitPrice}
                                        onChange={(e) => setBuyingUnitPrice(e.target.value)}
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="stockInSellingUnitPrice" className="block text-nexus-blue text-sm font-bold mb-2">Selling Unit Price</label>
                                    <input
                                        id="stockInSellingUnitPrice"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={sellingUnitPrice}
                                        onChange={(e) => setSellingUnitPrice(e.target.value)}
                                        className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white focus:ring-2 focus:ring-nexus-blue focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <GamingButton type="submit" variant="cta" className="flex-1" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Create Stock In Record'}
                                </GamingButton>
                                <GamingButton type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                                    Close
                                </GamingButton>
                            </div>
                        </form>
                    ) : (
                        <AdminProductStockInHistory productId={product.id} refreshKey={refreshKey} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProductStockInModal;
