export function formatCustomerName(customer: any): string {
  if (!customer) return '-';
  
  if (customer.type === 'PJ') {
    return customer.tradeName || customer.companyName || '-';
  }
  
  return customer.name || '-';
}

export function formatCustomerNameFromList(c: any): string {
  if (!c) return '-';
  
  if (c.type === 'PJ') {
    return c.tradeName || c.companyName || '-';
  }
  
  return c.name || '-';
}