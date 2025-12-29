import React from 'react';

export interface Address {
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

export const defaultAddress = (): Address => ({
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

export const normalizeAddress = (raw: Partial<Address> | null | undefined): Address => {
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

export const isAddressValid = (address: Address): boolean => {
  return Boolean(address.firstName.trim())
    && Boolean(address.lastName.trim())
    && Boolean(address.streetAddress.trim())
    && Boolean(address.city.trim())
    && Boolean(address.postcode.trim());
};

export const AddressFields: React.FC<{
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
