import React from 'react';
import { Address, AddressFields } from './AddressFields';

const BillingAddressSection: React.FC<{
  address: Address;
  onChange: (next: Address) => void;
  disabled?: boolean;
}> = ({ address, onChange, disabled }) => (
  <div className="bg-nexus-dark/50 p-6 rounded-lg border border-nexus-gray">
    <h2 className="text-2xl font-exo font-bold text-white mb-2">Billing Address</h2>
    <p className="text-gray-400 mb-6">Used for billing and order details.</p>
    <AddressFields prefix="billing" address={address} onChange={onChange} disabled={disabled} />
  </div>
);

export default BillingAddressSection;
