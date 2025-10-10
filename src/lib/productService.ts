import { Product } from '@/types/models';
import { firestoreService, COLLECTIONS } from './firestoreService';

const COUNTER_NAME = 'product_counter';

export const productService = {
  async getAll(): Promise<Product[]> {
    return firestoreService.getAll<Product>(COLLECTIONS.PRODUCTS);
  },

  async getById(id: number): Promise<Product | null> {
    return firestoreService.getById<Product>(COLLECTIONS.PRODUCTS, id);
  },

  async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    return firestoreService.create<Product>(
      COLLECTIONS.PRODUCTS,
      newProduct,
      COUNTER_NAME
    );
  },

  async update(id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | null> {
    return firestoreService.update<Product>(COLLECTIONS.PRODUCTS, id, data);
  },

  async delete(id: number): Promise<boolean> {
    return firestoreService.delete(COLLECTIONS.PRODUCTS, id);
  },

  async updateStock(id: number, quantityChange: number): Promise<Product | null> {
    const product = await this.getById(id);
    
    if (!product) return null;
    
    const newStockQuantity = product.stockQuantity + quantityChange;
    return this.update(id, { stockQuantity: newStockQuantity });
  },
};
