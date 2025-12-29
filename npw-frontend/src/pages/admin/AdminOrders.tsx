import React, { useEffect, useMemo, useState } from 'react';
import GamingButton from '../../components/GamingButton';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/AccessDenied';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';
import { adminOrderService, type AdminOrder } from '../../services/adminOrderService';
import { API_BASE_URL } from '../../api/client';

const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  return Number.parseFloat(String(price).replaceAll(/[^0-9.]/g, '')) || 0;
};

const formatAddressOneLine = (address: any): string => {
  const a = address || {};
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
  const parts = [
    name,
    a.companyName,
    a.phone,
    a.streetAddress,
    a.houseNumberAndStreetName,
    a.apartment,
    a.city,
    a.postcode,
    a.country,
  ]
    .map((v) => String(v ?? '').trim())
    .filter(Boolean);

  return parts.join(', ');
};

const isPendingOrder = (order: AdminOrder): boolean => {
  const status = String(order.payment?.status || 'pending');
  return status === 'pending' || status === 'awaiting_receipt' || status === 'awaiting_confirmation';
};

const STATUS_OPTIONS = ['pending', 'awaiting_receipt', 'awaiting_confirmation', 'paid', 'failed'];

const guessIsPdf = (order: AdminOrder): boolean => {
  const mime = String(order.payment?.bankTransferReceiptMimeType || '').toLowerCase();
  if (mime.includes('pdf')) return true;
  const name = String(order.payment?.bankTransferReceiptFilename || '').toLowerCase();
  return name.endsWith('.pdf');
};

const getReceiptAbsoluteUrl = (order: AdminOrder): string => {
  const direct = String(order.payment?.bankTransferReceiptUrl || '').trim();
  if (direct) return `${API_BASE_URL}${direct}`;
  const filename = String(order.payment?.bankTransferReceiptFilename || '').trim();
  if (!filename) return '';
  return `${API_BASE_URL}/user/payment/bank-transfer/receipt/${encodeURIComponent(filename)}`;
};

const AdminOrders: React.FC = () => {
  const { isAdmin, adminMode } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [previewReceiptOrderId, setPreviewReceiptOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    if (!isAdmin || !adminMode) return;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await adminOrderService.getAll();
        const nextOrders = Array.isArray(res?.orders) ? res.orders : [];
        setOrders(nextOrders);
        setLocalStatuses((prev) => {
          const next = { ...prev };
          for (const o of nextOrders) {
            if (!next[o.id]) next[o.id] = String(o.payment?.status || 'pending');
          }
          return next;
        });
      } catch (err: any) {
        console.error('Failed to load admin orders', err);
        setOrders([]);
        setError(String(err?.message || 'Failed to load orders.'));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [adminMode, isAdmin]);

  const visibleOrders = useMemo(() => {
    if (!pendingOnly) return orders;
    return orders.filter(isPendingOrder);
  }, [orders, pendingOnly]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    globalThis.setTimeout(() => setToast((p) => ({ ...p, visible: false })), type === 'success' ? 2500 : 3500);
  };

  const exportOrders = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        pendingOnly,
        orders: visibleOrders,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export${pendingOnly ? '-pending' : ''}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Orders exported.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export orders.', 'error');
    }
  };

  const saveStatus = async (orderId: string) => {
    const nextStatus = localStatuses[orderId];
    if (!nextStatus) return;

    try {
      setSavingOrderId(orderId);
      const res = await adminOrderService.updatePaymentStatus(orderId, nextStatus);
      const updated = res?.order;
      if (updated?.id) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
      showToast('Order updated.', 'success');
    } catch (err: any) {
      console.error('Failed to update order', err);
      showToast(String(err?.message || 'Failed to update order.'), 'error');
    } finally {
      setSavingOrderId(null);
    }
  };

  if (!isAdmin || !adminMode) {
    return (
      <AccessDenied
        title="Access Denied"
        description="You do not have permission to view this page."
        backText="Return to Home"
        onBack={() => navigate('/')}
      />
    );
  }

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="p-6 bg-nexus-dark rounded border border-nexus-gray text-gray-300">Loading orders…</div>;
  } else if (error) {
    content = <div className="p-6 bg-nexus-dark rounded border border-nexus-gray text-red-400">{error}</div>;
  } else if (visibleOrders.length === 0) {
    content = <div className="p-6 bg-nexus-dark rounded border border-nexus-gray text-gray-400">No orders found.</div>;
  } else {
    content = (
      <div className="space-y-4">
        {visibleOrders.map((order) => {
          const status = localStatuses[order.id] ?? String(order.payment?.status || 'pending');
          const receiptAbsoluteUrl = getReceiptAbsoluteUrl(order);
          const isPdf = guessIsPdf(order);
          const showPreview = previewReceiptOrderId === order.id;

          return (
            <div key={order.id} className="bg-nexus-dark p-4 rounded border border-nexus-gray">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="font-bold text-white">Order {order.id}</div>
                <div className="text-sm text-gray-400">
                  {order.customer?.email ? `Customer: ${order.customer.email}` : 'Customer: -'}
                  {order.createdAt ? ` • ${new Date(order.createdAt).toLocaleString()}` : ''}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">Billing address</div>
                  <div className="text-gray-200">{formatAddressOneLine(order.billingAddress)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Shipping address</div>
                  <div className="text-gray-200">
                    {order.shipToDifferentAddress ? formatAddressOneLine(order.shippingAddress) : 'Same as billing address'}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">Payment method</div>
                  <div className="text-gray-200">{String(order.payment?.method ?? 'cod').replaceAll('_', ' ')}</div>
                </div>

                <div>
                  <div className="text-gray-400">Payment status</div>
                  <div className="flex items-center gap-2">
                    <select
                      value={status}
                      onChange={(e) => setLocalStatuses((p) => ({ ...p, [order.id]: e.target.value }))}
                      className="bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white w-full"
                      aria-label={`Payment status for ${order.id}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
                      ))}
                    </select>
                    <GamingButton
                      size="sm"
                      variant="primary"
                      onClick={() => saveStatus(order.id)}
                      disabled={savingOrderId === order.id || status === String(order.payment?.status || 'pending')}
                    >
                      {savingOrderId === order.id ? 'Saving…' : 'Save'}
                    </GamingButton>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400">Delivery charge</div>
                  <div className="text-gray-200">Rs {(Number(order.payment?.deliveryCharge) || 0).toLocaleString()}</div>
                </div>
              </div>

              {String(order.payment?.method) === 'bank_transfer' && receiptAbsoluteUrl ? (
                <div className="mt-3 text-sm">
                  <div className="text-gray-400">Bank transfer receipt</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      className="text-nexus-purple hover:underline"
                      href={receiptAbsoluteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open receipt
                    </a>
                    <GamingButton
                      size="sm"
                      variant="secondary"
                      onClick={() => setPreviewReceiptOrderId((prev) => (prev === order.id ? null : order.id))}
                    >
                      {showPreview ? 'Hide Preview' : 'Preview'}
                    </GamingButton>
                  </div>

                  {showPreview && receiptAbsoluteUrl ? (
                    <div className="mt-3 bg-nexus-gray/30 border border-nexus-gray/60 rounded p-3">
                      {isPdf ? (
                        <iframe
                          src={receiptAbsoluteUrl}
                          title={`Receipt preview for ${order.id}`}
                          className="w-full h-96 rounded"
                        />
                      ) : (
                        <img
                          src={receiptAbsoluteUrl}
                          alt={`Receipt preview for ${order.id}`}
                          className="w-full max-h-130 object-contain rounded"
                        />
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        If the preview doesn’t load, use “Open receipt”.
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 border-t border-nexus-gray/60 pt-3">
                <div className="text-gray-400 text-sm mb-2">Items</div>
                <div className="space-y-2 text-gray-200">
                  {(order.items || []).map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <div>{it.name} x{it.quantity}</div>
                      <div className="font-mono">Rs {(parsePrice(it.price) * it.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end font-bold text-white">Total: Rs {Number(order.total || 0).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <AdminLayout title="Orders Management">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
      <section className="py-0">
        <div className="container mx-auto px-6">
          <p className="text-gray-400 mb-6">View customer orders and update payment status.</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <GamingButton variant="primary" onClick={exportOrders} disabled={visibleOrders.length === 0}>Export Orders</GamingButton>
            <GamingButton
              variant={pendingOnly ? 'primary' : 'secondary'}
              onClick={() => setPendingOnly((p) => !p)}
            >
              View Pending
            </GamingButton>
            <GamingButton variant="secondary" onClick={() => navigate(0)} disabled={isLoading}>Refresh</GamingButton>
          </div>

          {content}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminOrders;
