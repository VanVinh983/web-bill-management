import { Product } from '@/types/models';
import { getFromStorage, saveToStorage, getNextId, STORAGE_KEYS } from './localStorage';

export const productService = {
  getAll(): Product[] {
    return getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
  },

  getById(id: number): Product | undefined {
    const products = this.getAll();
    return products.find(p => p.id === id);
  },

  create(data: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getAll();
    const newProduct: Product = {
      id: getNextId(STORAGE_KEYS.PRODUCT_COUNTER),
      ...data,
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  update(id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...data };
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  },

  delete(id: number): boolean {
    const products = this.getAll();
    const filtered = products.filter(p => p.id !== id);
    
    if (filtered.length === products.length) return false;
    
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  updateStock(id: number, quantityChange: number): Product | null {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    products[index].stockQuantity += quantityChange;
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  },
};

