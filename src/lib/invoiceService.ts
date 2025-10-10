import { Invoice } from '@/types/models';
import { firestoreService, COLLECTIONS } from './firestoreService';
import { productService } from './productService';

const COUNTER_NAME = 'invoice_counter';

export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    return firestoreService.getAll<Invoice>(COLLECTIONS.INVOICES);
  },

  async getById(id: number): Promise<Invoice | null> {
    return firestoreService.getById<Invoice>(COLLECTIONS.INVOICES, id);
  },

  async create(data: Omit<Invoice, 'id'>): Promise<Invoice> {
    // Deduct stock quantities
    for (const item of data.items) {
      await productService.updateStock(item.productId, -item.quantity);
    }
    
    return firestoreService.create<Invoice>(
      COLLECTIONS.INVOICES,
      data,
      COUNTER_NAME
    );
  },

  async update(id: number, data: Partial<Omit<Invoice, 'id'>>): Promise<Invoice | null> {
    const oldInvoice = await this.getById(id);
    
    if (!oldInvoice) return null;
    
    // Restore old stock quantities
    for (const item of oldInvoice.items) {
      await productService.updateStock(item.productId, item.quantity);
    }
    
    // Deduct new stock quantities
    if (data.items) {
      for (const item of data.items) {
        await productService.updateStock(item.productId, -item.quantity);
      }
    }
    
    return firestoreService.update<Invoice>(COLLECTIONS.INVOICES, id, data);
  },

  async delete(id: number): Promise<boolean> {
    const invoice = await this.getById(id);
    
    if (!invoice) return false;
    
    // Restore stock quantities
    for (const item of invoice.items) {
      await productService.updateStock(item.productId, item.quantity);
    }
    
    return firestoreService.delete(COLLECTIONS.INVOICES, id);
  },

  async getTotalRevenue(): Promise<number> {
    const invoices = await this.getAll();
    return invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  },
};
