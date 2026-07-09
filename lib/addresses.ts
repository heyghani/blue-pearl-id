export type StoredShippingAddress = {
  firstName?: string;
  lastName?: string;
  company?: string;
  line1?: string;
  line2?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

export function getAddressLine1(address: StoredShippingAddress) {
  return address.line1 ?? address.address1 ?? "";
}

export function getAddressLine2(address: StoredShippingAddress) {
  return address.line2 ?? address.address2 ?? "";
}

export function formatCustomerName(address: StoredShippingAddress) {
  return [address.firstName, address.lastName].filter(Boolean).join(" ").trim();
}

export function formatCityStatePostal(address: StoredShippingAddress) {
  const cityState = [address.city, address.state].filter(Boolean).join(", ");
  return [cityState, address.postalCode].filter(Boolean).join(" ").trim();
}
