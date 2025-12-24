import React, { useEffect, useState } from 'react';
import type { StockInRecord } from '../../../types';
import { productService } from '../../../services/productService';

interface AdminProductStockInHistoryProps {
    productId: string;
    refreshKey: number;
}

const formatMoney = (value: number | undefined) => {
    if (value === undefined || value === null || !Number.isFinite(value)) return '-';
    return `Rs ${Number(value).toLocaleString()}`;
};

const AdminProductStockInHistory: React.FC<AdminProductStockInHistoryProps> = ({ productId, refreshKey }) => {
    const [history, setHistory] = useState<StockInRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await productService.getStockInHistory(productId);
                if (mounted) setHistory(res.history || []);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                if (mounted) {
                    setError('Failed to load stock history');
                    setHistory([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, [productId, refreshKey]);

    if (loading) {
        return <div className="text-gray-300">Loading history...</div>;
    }

    if (error) {
        return <div className="text-red-400 text-sm">{error}</div>;
    }

    if (!history.length) {
        return <div className="text-gray-400 text-sm">No stock-in records yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="text-nexus-blue uppercase text-xs font-bold">
                    <tr>
                        <th className="py-2">Date</th>
                        <th className="py-2">Qty</th>
                        <th className="py-2">Buying</th>
                        <th className="py-2">Selling</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-nexus-gray/50 text-gray-300">
                    {history.map((r, idx) => (
                        <tr key={`${r.date}-${idx}`}>
                            <td className="py-2 pr-4">
                                {r.date ? new Date(r.date).toLocaleString() : '-'}
                            </td>
                            <td className="py-2 pr-4 font-mono">{r.quantity}</td>
                            <td className="py-2 pr-4 font-mono">{formatMoney(r.buyingUnitPrice)}</td>
                            <td className="py-2 pr-4 font-mono">{formatMoney(r.sellingUnitPrice)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProductStockInHistory;
