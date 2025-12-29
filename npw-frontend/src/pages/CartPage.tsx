import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import GamingButton from '../components/GamingButton';
import Toast from '../components/Toast';
import type { CartItem } from '../types';
import { productService } from '../services/productService';

const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    return Number.parseFloat(String(price).replaceAll(/[^0-9.]/g, '')) || 0;
};

const EmptyCart: React.FC<{ navigateTo: (path: string) => void }> = ({ navigateTo }) => (
    <div className="text-center bg-nexus-dark/50 p-12 rounded-lg border border-nexus-gray">
        <svg className="mx-auto h-24 w-24 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.828l2.91-6.616c.254-.577-.11-1.246-.723-1.246H5.25" />
        </svg>
        <h2 className="mt-6 text-2xl font-exo text-nexus-light mb-2">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8">Forge your legend by adding some gear to your arsenal.</p>
        <GamingButton onClick={() => navigateTo('/products')} variant="cta">
            Explore Our Arsenal
        </GamingButton>
    </div>
);

interface ConfirmedOrder {
    items: CartItem[];
    total: number;
    orderNumber: string;
}

const OrderConfirmation: React.FC<{ order: ConfirmedOrder; navigateTo: (path: string) => void; }> = ({ order, navigateTo }) => (
    <div className="text-center bg-nexus-dark/50 p-8 sm:p-12 rounded-lg border border-nexus-gray max-w-2xl mx-auto">
        <svg className="mx-auto h-24 w-24 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="mt-6 text-2xl font-exo text-nexus-blue mb-2">Order Confirmed!</h2>
        <p className="text-gray-400 mb-4">Thank you for your purchase. Your order number is:</p>
        <p className="text-xl font-mono text-white bg-nexus-dark p-2 rounded-md inline-block mb-8">{order.orderNumber}</p>
        
        <div className="text-left border-t border-nexus-gray pt-6 mb-8">
            <h3 className="font-exo text-lg text-white mb-4">Purchase Summary</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-nexus-light">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                        <span className="font-mono text-gray-400">Rs {(parsePrice(item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
            </div>
             <div className="border-t border-nexus-gray pt-4 mt-4 flex justify-between font-bold text-xl">
                <span className="font-exo text-white">Total</span>
                <span className="text-nexus-blue">Rs {order.total.toLocaleString()}</span>
            </div>
        </div>

        <GamingButton onClick={() => navigateTo('/products')} variant="cta">
            Continue Shopping
        </GamingButton>
    </div>
);


const CartItemRow: React.FC<{
    product: CartItem;
    isUnavailable: boolean;
    onIncrease: (id: string) => void;
    onDecrease: (id: string) => void;
    onRemove: (id: string) => void;
}> = ({ product, isUnavailable, onIncrease, onDecrease, onRemove }) => {
    const firstImageUrl = product.imageUrls?.find((u) => u?.trim());

    return (
        <div className={`bg-nexus-dark p-4 rounded-lg md:grid md:grid-cols-12 md:gap-4 md:items-center border border-nexus-gray/50 ${isUnavailable ? 'opacity-70' : ''}`}>
        {/* Product Info */}
        <div className="md:col-span-5 flex items-center gap-4">
            <div className="w-20 h-20 shrink-0">
                {firstImageUrl ? (
                    <img
                        src={firstImageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover rounded-md"
                    />
                ) : (
                    <div className="h-full w-full rounded-md bg-nexus-gray border border-nexus-gray/50 flex items-center justify-center text-xs text-gray-500">
                        No image
                    </div>
                )}
            </div>
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-white">{product.name}</p>
                    {isUnavailable ? (
                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded bg-nexus-gray/40 text-gray-300 border border-nexus-gray/60">
                            Unavailable
                        </span>
                    ) : null}
                </div>
                <p className="text-sm text-gray-400">{product.subCategory || product.category}</p>
                {isUnavailable ? (
                    <p className="text-sm text-red-400 mt-1">This product is no longer available. Please remove it to continue.</p>
                ) : null}
            </div>
        </div>
        
        {/* Price */}
        <div className="mt-4 md:mt-0 md:col-span-2 flex justify-between md:justify-center items-center">
            <span className="md:hidden text-gray-400 font-bold">Price</span>
            <span className="font-mono text-nexus-light">Rs {Number(product.price).toLocaleString()}</span>
        </div>

        {/* Quantity */}
        <div className="mt-4 md:mt-0 md:col-span-3 flex justify-between md:justify-center items-center">
             <span className="md:hidden text-gray-400 font-bold">Quantity</span>
            <div className="flex items-center">
                <GamingButton onClick={() => onDecrease(product.id)} disabled={isUnavailable} size="sm" iconOnly={true} className="h-8! w-8!">-</GamingButton>
                <span className="w-12 text-center font-bold text-white text-lg">{product.quantity}</span>
                <GamingButton onClick={() => onIncrease(product.id)} disabled={isUnavailable} size="sm" iconOnly={true} className="h-8! w-8!">+</GamingButton>
            </div>
        </div>

        {/* Total Price & Remove */}
        <div className="mt-4 md:mt-0 md:col-span-2 flex justify-between md:justify-end items-center">
            <span className="md:hidden text-gray-400 font-bold">Total</span>
            <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-white">Rs {(parsePrice(product.price) * product.quantity).toLocaleString()}</span>
                <GamingButton onClick={() => onRemove(product.id)} iconOnly={true} size="sm" variant="danger" aria-label={`Remove ${product.name} from cart`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </GamingButton>
            </div>
        </div>
    </div>
    );
};

const OrderSummary: React.FC<{
    total: number;
    onClearCart: () => void;
    onCheckout: () => void;
    isProcessing: boolean;
    checkoutDisabled: boolean;
}> = ({ total, onClearCart, onCheckout, isProcessing, checkoutDisabled }) => (
    <div className="lg:col-span-1">
        <div className="bg-nexus-dark p-6 rounded-lg sticky top-24 border border-nexus-gray">
            <h2 className="text-xl font-exo font-bold text-white mb-6 border-b border-nexus-gray pb-4">Order Summary</h2>
            <div className="space-y-4 text-nexus-light">
                <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>Rs {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="font-bold text-green-400">FREE</span>
                </div>
                 <div className="border-t border-nexus-gray pt-4 mt-4 flex justify-between font-bold text-xl">
                    <span className="font-exo text-white">Order Total</span>
                    <span className="text-nexus-blue">Rs {total.toLocaleString()}</span>
                </div>
            </div>
             <GamingButton onClick={onCheckout} disabled={isProcessing || checkoutDisabled} className="w-full mt-8" variant="cta">
                {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                    </div>
                ) : (
                    'Proceed to Checkout'
                )}
            </GamingButton>
            {checkoutDisabled ? (
                <div className="mt-3 text-sm text-red-400">Remove unavailable items to proceed.</div>
            ) : null}
            <GamingButton onClick={onClearCart} variant="danger" size="sm" className="w-full mt-4" disabled={isProcessing}>
                Clear Cart
            </GamingButton>
        </div>
    </div>
);

const CartPage: React.FC<{ navigateTo: (path: string) => void; }> = ({ navigateTo }) => {
    const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const [isProcessing] = useState(false);
    const [unavailableIds, setUnavailableIds] = useState<Set<string>>(() => new Set());
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
        visible: false,
        message: '',
        type: 'success',
    });

    const cartIdsKey = useMemo(
        () => cartItems
            .map(i => `${i.id}:${Number(i.quantity) || 0}`)
            .sort((a, b) => a.localeCompare(b))
            .join('|'),
        [cartItems]
    );

    useEffect(() => {
        let cancelled = false;

        const checkAvailability = async () => {
            if (cartItems.length === 0) {
                if (!cancelled) setUnavailableIds(new Set());
                return;
            }

            const ids = Array.from(new Set(cartItems.map(i => i.id)));
            const results = await Promise.all(
                ids.map(async (id) => {
                    try {
                        await productService.getById(id);
                        return { id, ok: true };
                    } catch {
                        return { id, ok: false };
                    }
                })
            );

            const next = new Set<string>();
            for (const r of results) {
                if (!r.ok) next.add(r.id);
            }

            if (!cancelled) setUnavailableIds(next);
        };

        checkAvailability();
        return () => { cancelled = true; };
    }, [cartIdsKey]);

    const hasUnavailableItems = unavailableIds.size > 0;

    const showToast = (type: 'success' | 'error', message: string, timeoutMs: number = 3000) => {
        setToast({ visible: true, type, message });
        globalThis.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), timeoutMs);
    };

    const handleProceedToCheckout = () => {
        (async () => {
            if (cartItems.length === 0) {
                showToast('error', 'Your cart is empty.', 2500);
                return;
            }
            if (hasUnavailableItems) {
                showToast('error', 'Some items are unavailable. Please remove them to proceed.', 3500);
                return;
            }

            // Stock validation happens on checkout/payment too, but we block here for faster feedback.
            const qtyById = new Map<string, number>();
            for (const item of cartItems) {
                qtyById.set(item.id, (qtyById.get(item.id) || 0) + (Number(item.quantity) || 0));
            }
            const ids = Array.from(qtyById.keys());
            const results = await Promise.all(
                ids.map(async (id) => {
                    try {
                        const p = await productService.getById(id);
                        const requested = qtyById.get(id) || 0;
                        const available = Math.max(0, Number(p?.stock) || 0);
                        return { id, ok: requested > 0 && requested <= available };
                    } catch {
                        return { id, ok: false };
                    }
                })
            );

            if (results.some(r => !r.ok)) {
                showToast('error', 'Some items are out of stock. Please adjust quantities to proceed.', 4500);
                return;
            }

            navigateTo('/checkout');
        })();
    };

    if (cartItems.length === 0) {
      return (
          <section className="py-20 min-h-[80vh] flex items-center justify-center">
              <div className="container mx-auto px-6">
                  <EmptyCart navigateTo={navigateTo} />
              </div>
          </section>
      );
    }

    return (
        <section className="py-20 min-h-[80vh]">
            <Toast message={toast.message} type={toast.type} visible={toast.visible} />
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-exo text-center font-bold mb-12">Shopping Cart</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-bold uppercase text-gray-500 px-4">
                        <div className="col-span-5">Product</div>
                        <div className="col-span-2 text-center">Price</div>
                        <div className="col-span-3 text-center">Quantity</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>
                    {cartItems.map((product) => (
                        <CartItemRow
                            key={product.id}
                            product={product}
                            isUnavailable={unavailableIds.has(product.id)}
                            onIncrease={(id) => increaseQuantity(id)}
                            onDecrease={(id) => decreaseQuantity(id)}
                            onRemove={(id) => removeFromCart(id)}
                        />
                    ))}
                    </div>
                    {/* Order Summary */}
                    <OrderSummary
                        total={cartTotal}
                        onClearCart={clearCart}
                        onCheckout={handleProceedToCheckout}
                        isProcessing={isProcessing}
                        checkoutDisabled={hasUnavailableItems}
                    />
                </div>
            </div>
        </section>
    );
};

export default CartPage;
