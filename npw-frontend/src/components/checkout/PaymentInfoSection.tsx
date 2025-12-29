import React from 'react';

const PaymentInfoSection: React.FC = () => (
  <div className="bg-nexus-dark/50 p-6 rounded-lg border border-nexus-gray">
    <h2 className="text-2xl font-exo font-bold text-white mb-2">Payment Info</h2>
    <p className="text-gray-400 mb-6">Payment method for this order.</p>

    <div className="space-y-3 text-nexus-light">
      <div className="flex justify-between">
        <span className="text-gray-400">Method</span>
        <span className="font-bold text-white">Cash on Delivery</span>
      </div>
      <div className="text-sm text-gray-400">
        You will pay when your order is delivered.
      </div>
    </div>
  </div>
);

export default PaymentInfoSection;
