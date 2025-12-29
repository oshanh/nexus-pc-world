import React from 'react';
import GamingButton from '../GamingButton';
import type { CartItem } from '../../types';

const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  return Number.parseFloat(String(price).replaceAll(/[^0-9.]/g, '')) || 0;
};

export interface ConfirmedOrder {
  items: CartItem[];
  total: number;
  orderNumber: string;
}

const OrderConfirmation: React.FC<{ order: ConfirmedOrder; navigateTo: (path: string) => void }> = ({ order, navigateTo }) => (
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

export default OrderConfirmation;
