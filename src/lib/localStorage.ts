// LocalStorage utilities

const STORAGE_KEYS = {
  CATEGORIES: 'invoiceApp_categories',
  PRODUCTS: 'invoiceApp_products',
  INVOICES: 'invoiceApp_invoices',
  CATEGORY_COUNTER: 'invoiceApp_categories_counter',
  PRODUCT_COUNTER: 'invoiceApp_products_counter',
  INVOICE_COUNTER: 'invoiceApp_invoices_counter',
} as const;

// Auto-increment ID system
export function getNextId(counterKey: string): number {
  if (typeof window === 'undefined') return 1;
  
  const current = localStorage.getItem(counterKey);
  const nextId = current ? parseInt(current, 10) + 1 : 1;
  localStorage.setItem(counterKey, nextId.toString());
  return nextId;
}

// Generic storage operations
export function getFromStorage<T>(key: string, defaultValue: T[] = []): T[] {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

export { STORAGE_KEYS };

