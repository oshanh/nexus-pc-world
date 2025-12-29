import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import GamingButton from '../components/GamingButton';
import Toast from '../components/Toast';
import type { CartItem } from '../types';

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

interface Address {
    firstName: string;
    lastName: string;
    phone: string;
    companyName: string;
    country: 'Sri Lanka';
    streetAddress: string;
    houseNumberAndStreetName: string;
    apartment: string;
    city: string;
    postcode: string;
    note: string;
}

const defaultAddress = (): Address => ({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    country: 'Sri Lanka',
    streetAddress: '',
    houseNumberAndStreetName: '',
    apartment: '',
    city: '',
    postcode: '',
    note: '',
});

const normalizeAddress = (raw: Partial<Address> | null | undefined): Address => {
    const r = raw || {};
    return {
        ...defaultAddress(),
        firstName: String(r.firstName ?? ''),
        lastName: String(r.lastName ?? ''),
        phone: String(r.phone ?? ''),
        companyName: String(r.companyName ?? ''),
        country: 'Sri Lanka',
        streetAddress: String(r.streetAddress ?? ''),
        houseNumberAndStreetName: String(r.houseNumberAndStreetName ?? ''),
        apartment: String(r.apartment ?? ''),
        city: String(r.city ?? ''),
        postcode: String(r.postcode ?? ''),
        note: String(r.note ?? ''),
    };
};

const isAddressValid = (address: Address): boolean => {
    return !!address.firstName.trim()
        && !!address.lastName.trim()
        && !!address.streetAddress.trim()
        && !!address.city.trim()
        && !!address.postcode.trim();
};

const AddressFields: React.FC<{
    prefix: string;
    address: Address;
    onChange: (next: Address) => void;
    disabled?: boolean;
}> = ({ prefix, address, onChange, disabled }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor={`${prefix}-first-name`} className="block text-sm text-gray-400 mb-1">First name *</label>
                <input
                    id={`${prefix}-first-name`}
                    value={address.firstName}
                    onChange={(e) => onChange({ ...address, firstName: e.target.value })}
                    className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                    disabled={disabled}
                />
            </div>
            <div>
                <label htmlFor={`${prefix}-last-name`} className="block text-sm text-gray-400 mb-1">Last name *</label>
                <input
                    id={`${prefix}-last-name`}
                    value={address.lastName}
                    onChange={(e) => onChange({ ...address, lastName: e.target.value })}
                    className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                    disabled={disabled}
                />
            </div>
        </div>

        <div>
            <label htmlFor={`${prefix}-phone`} className="block text-sm text-gray-400 mb-1">Phone (optional)</label>
            <input
                id={`${prefix}-phone`}
                value={address.phone}
                onChange={(e) => onChange({ ...address, phone: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                disabled={disabled}
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-company`} className="block text-sm text-gray-400 mb-1">Company name (optional)</label>
            <input
                id={`${prefix}-company`}
                value={address.companyName}
                onChange={(e) => onChange({ ...address, companyName: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                disabled={disabled}
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-country`} className="block text-sm text-gray-400 mb-1">Country / Region *</label>
            <input
                id={`${prefix}-country`}
                value="Sri Lanka"
                readOnly
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-gray-400"
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-street`} className="block text-sm text-gray-400 mb-1">Street address *</label>
            <input
                id={`${prefix}-street`}
                value={address.streetAddress}
                onChange={(e) => onChange({ ...address, streetAddress: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                placeholder="House number and street name"
                disabled={disabled}
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-house`} className="block text-sm text-gray-400 mb-1">House number and street name</label>
            <input
                id={`${prefix}-house`}
                value={address.houseNumberAndStreetName}
                onChange={(e) => onChange({ ...address, houseNumberAndStreetName: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                disabled={disabled}
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-apartment`} className="block text-sm text-gray-400 mb-1">Apartment, suite, unit, etc. (optional)</label>
            <input
                id={`${prefix}-apartment`}
                value={address.apartment}
                onChange={(e) => onChange({ ...address, apartment: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                disabled={disabled}
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-city`} className="block text-sm text-gray-400 mb-1">Town / City *</label>
            <input
                id={`${prefix}-city`}
                value={address.city}
                onChange={(e) => onChange({ ...address, city: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                disabled={disabled}
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-postcode`} className="block text-sm text-gray-400 mb-1">Postcode / ZIP *</label>
            <input
                id={`${prefix}-postcode`}
                value={address.postcode}
                onChange={(e) => onChange({ ...address, postcode: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white disabled:opacity-60"
                disabled={disabled}
            />
        </div>

        <div>
            <label htmlFor={`${prefix}-note`} className="block text-sm text-gray-400 mb-1">Order notes (optional)</label>
            <textarea
                id={`${prefix}-note`}
                value={address.note}
                onChange={(e) => onChange({ ...address, note: e.target.value })}
                className="w-full bg-nexus-gray border border-nexus-purple/30 rounded py-2 px-3 text-white min-h-20 disabled:opacity-60"
                disabled={disabled}
            />
        </div>
    </div>
);

const ShippingDetailsView: React.FC<{
    billingAddress: Address;
    onChangeBilling: (next: Address) => void;
    shippingAddress: Address;
    onChangeShipping: (next: Address) => void;
    shipToDifferentAddress: boolean;
    onToggleShipToDifferentAddress: (next: boolean) => void;
    onBack: () => void;
    onPlaceOrder: () => void;
    isProcessing: boolean;
}> = ({
    billingAddress,
    onChangeBilling,
    shippingAddress,
    onChangeShipping,
    shipToDifferentAddress,
    onToggleShipToDifferentAddress,
    onBack,
    onPlaceOrder,
    isProcessing,
}) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-nexus-dark/50 p-6 rounded-lg border border-nexus-gray">
                <h2 className="text-2xl font-exo font-bold text-white mb-2">Checkout</h2>
                <p className="text-gray-400 mb-6">Enter your billing and shipping details to place this order.</p>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-exo font-bold text-white mb-4">Billing Address</h3>
                        <AddressFields prefix="billing" address={billingAddress} onChange={onChangeBilling} />
                    </div>

                    <div>
                        <div className="flex items-start gap-3 mb-4">
                            <input
                                id="ship-to-different"
                                type="checkbox"
                                checked={shipToDifferentAddress}
                                onChange={(e) => onToggleShipToDifferentAddress(e.target.checked)}
                                className="mt-1 h-4 w-4"
                                disabled={isProcessing}
                            />
                            <label htmlFor="ship-to-different" className="text-sm text-gray-300 select-none">
                                Ship to a different address
                            </label>
                        </div>

                        <h3 className="text-xl font-exo font-bold text-white mb-4">Shipping Address</h3>
                        <AddressFields
                            prefix="shipping"
                            address={shipToDifferentAddress ? shippingAddress : billingAddress}
                            onChange={onChangeShipping}
                            disabled={!shipToDifferentAddress || isProcessing}
                        />
                    </div>

                    <div className="flex gap-4">
                        <GamingButton onClick={onBack} variant="secondary" disabled={isProcessing}>Back</GamingButton>
                        <GamingButton onClick={onPlaceOrder} variant="cta" disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : 'Place Order'}
                        </GamingButton>
                    </div>
                </div>
            </div>
        </div>
        <div className="lg:col-span-1">
            <div className="bg-nexus-dark p-6 rounded-lg sticky top-24 border border-nexus-gray">
                <h2 className="text-xl font-exo font-bold text-white mb-4">Address Requirements</h2>
                <p className="text-gray-400 text-sm">First name, last name, street address, town/city, and postcode are required.</p>
            </div>
        </div>
    </div>
);

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
    onIncrease: (id: string) => void;
    onDecrease: (id: string) => void;
    onRemove: (id: string) => void;
}> = ({ product, onIncrease, onDecrease, onRemove }) => {
    const firstImageUrl = product.imageUrls?.find((u) => u?.trim());

    return (
        <div className="bg-nexus-dark p-4 rounded-lg md:grid md:grid-cols-12 md:gap-4 md:items-center border border-nexus-gray/50">
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
                <p className="font-bold text-white">{product.name}</p>
                <p className="text-sm text-gray-400">{product.subCategory || product.category}</p>
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
                <GamingButton onClick={() => onDecrease(product.id)} size="sm" iconOnly={true} className="h-8! w-8!">-</GamingButton>
                <span className="w-12 text-center font-bold text-white text-lg">{product.quantity}</span>
                <GamingButton onClick={() => onIncrease(product.id)} size="sm" iconOnly={true} className="h-8! w-8!">+</GamingButton>
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
}> = ({ total, onClearCart, onCheckout, isProcessing }) => (
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
             <GamingButton onClick={onCheckout} disabled={isProcessing} className="w-full mt-8" variant="cta">
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
            <GamingButton onClick={onClearCart} variant="danger" size="sm" className="w-full mt-4" disabled={isProcessing}>
                Clear Cart
            </GamingButton>
        </div>
    </div>
);

const CartPage: React.FC<{ navigateTo: (path: string) => void; }> = ({ navigateTo }) => {
    const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    
    type CheckoutState = 'cart' | 'shipping' | 'confirmed';
    const [checkoutState, setCheckoutState] = useState<CheckoutState>('cart');
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
    const [billingAddress, setBillingAddress] = useState<Address>(() => defaultAddress());
    const [shippingAddress, setShippingAddress] = useState<Address>(() => defaultAddress());
    const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
        visible: false,
        message: '',
        type: 'success',
    });

    const { user } = useAuth();

    const showToast = (type: 'success' | 'error', message: string, timeoutMs: number = 3000) => {
        setToast({ visible: true, type, message });
        globalThis.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), timeoutMs);
    };

    const handleProceedToCheckout = () => {
        (async () => {
            try {
                if (!user?.id) {
                    // Guest: keep existing local checkout behavior
                    setIsProcessing(true);
                    await new Promise((r) => setTimeout(r, 1200));
                    const orderNumber = `NEXUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    setConfirmedOrder({ items: cartItems, total: cartTotal, orderNumber });
                    try {
                        const key = `nexusOrders:${user?.id ?? 'guest'}`;
                        const raw = localStorage.getItem(key);
                        const existing = raw ? JSON.parse(raw) : [];
                        const newOrder = { id: orderNumber, items: cartItems, total: cartTotal, createdAt: new Date().toISOString() };
                        localStorage.setItem(key, JSON.stringify([newOrder, ...existing]));
                    } catch (err) {
                        console.warn('Failed to persist order', err);
                    }
                    clearCart();
                    setCheckoutState('confirmed');
                    setIsProcessing(false);
                    return;
                }

                setIsProcessing(true);

                const res = await userService.getAccount();
                const nextBilling = normalizeAddress(res?.account?.billingAddress);
                const nextShipping = normalizeAddress(res?.account?.shippingAddress);

                setBillingAddress(nextBilling);
                setShippingAddress(nextShipping);
                setShipToDifferentAddress(false);
                setCheckoutState('shipping');
                setIsProcessing(false);
            } catch (err: any) {
                console.warn('Failed to load delivery info', err);
                showToast('error', err?.message || 'Failed to load delivery info. Please try again.');
                setCheckoutState('cart');
                setIsProcessing(false);
            }
        })();
    };

    const handlePlaceOrder = () => {
        (async () => {
            try {
                if (!user?.id) return;

                if (!isAddressValid(billingAddress)) {
                    showToast('error', 'Please complete required billing address fields.', 3500);
                    return;
                }

                if (shipToDifferentAddress && !isAddressValid(shippingAddress)) {
                    showToast('error', 'Please complete required shipping address fields.', 3500);
                    return;
                }

                setIsProcessing(true);
                const res = await userService.createOrder({
                    items: cartItems,
                    total: cartTotal,
                    billingAddress,
                    shippingAddress,
                    shipToDifferentAddress,
                });
                const order = res?.order || { id: `NEXUS-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
                setConfirmedOrder({ items: cartItems, total: cartTotal, orderNumber: order.id });
                await clearCart();
                setCheckoutState('confirmed');
                setIsProcessing(false);
            } catch (err: any) {
                console.warn('Checkout failed', err);
                showToast('error', err?.message || 'Checkout failed. Please try again.');
                setCheckoutState('shipping');
                setIsProcessing(false);
            }
        })();
    };

    if (checkoutState === 'confirmed' && confirmedOrder) {
        return (
            <section className="py-20 min-h-[80vh] flex items-center justify-center">
                <div className="container mx-auto px-6">
                    <OrderConfirmation order={confirmedOrder} navigateTo={navigateTo} />
                </div>
            </section>
        );
    }
  
    if (cartItems.length === 0 && checkoutState === 'cart') {
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
                {checkoutState === 'shipping' ? (
                    <ShippingDetailsView
                        billingAddress={billingAddress}
                        onChangeBilling={setBillingAddress}
                        shippingAddress={shippingAddress}
                        onChangeShipping={setShippingAddress}
                        shipToDifferentAddress={shipToDifferentAddress}
                        onToggleShipToDifferentAddress={setShipToDifferentAddress}
                        onBack={() => setCheckoutState('cart')}
                        onPlaceOrder={handlePlaceOrder}
                        isProcessing={isProcessing}
                    />
                ) : (
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
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default CartPage;
