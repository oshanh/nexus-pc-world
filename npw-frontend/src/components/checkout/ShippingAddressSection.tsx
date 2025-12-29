import React from 'react';
import { Address, AddressFields } from './AddressFields';

const ShippingAddressSection: React.FC<{
  billingAddress: Address;
  shippingAddress: Address;
  onChangeShipping: (next: Address) => void;
  shipToDifferentAddress: boolean;
  onToggleShipToDifferentAddress: (next: boolean) => void;
  disabled?: boolean;
}> = ({
  billingAddress,
  shippingAddress,
  onChangeShipping,
  shipToDifferentAddress,
  onToggleShipToDifferentAddress,
  disabled,
}) => {
  const fieldsDisabled = disabled;

  return (
    <div className="bg-nexus-dark/50 p-6 rounded-lg border border-nexus-gray">
      <div className="flex items-start gap-3 mb-4">
        <input
          id="ship-to-different"
          type="checkbox"
          checked={shipToDifferentAddress}
          onChange={(e) => onToggleShipToDifferentAddress(e.target.checked)}
          className="mt-1 h-4 w-4"
          disabled={disabled}
        />
        <label htmlFor="ship-to-different" className="text-sm text-gray-300 select-none">
          Ship to a different address
        </label>
      </div>

      <h2 className="text-2xl font-exo font-bold text-white mb-2">Shipping Address</h2>
      <p className="text-gray-400 mb-6">Where your order will be delivered.</p>

      {shipToDifferentAddress ? (
        <AddressFields
          prefix="shipping"
          address={shippingAddress}
          onChange={onChangeShipping}
          disabled={fieldsDisabled}
        />
      ) : (
        <div className="text-sm text-gray-400">
          Shipping address is the same as billing address.
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
