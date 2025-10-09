import { Invoice } from '@/types/models';
import { getFromStorage, saveToStorage, getNextId, STORAGE_KEYS } from './localStorage';
import { productService } from './productService';

export const invoiceService = {
  getAll(): Invoice[] {
    return getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
  },

  getById(id: number): Invoice | undefined {
    const invoices = this.getAll();
    return invoices.find(i => i.id === id);
  },

  create(data: Omit<Invoice, 'id'>): Invoice {
    const invoices = this.getAll();
    const newInvoice: Invoice = {
      id: getNextId(STORAGE_KEYS.INVOICE_COUNTER),
      ...data,
    };
    
    // Deduct stock quantities
    data.items.forEach(item => {
      productService.updateStock(item.productId, -item.quantity);
    });
    
    invoices.push(newInvoice);
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
    return newInvoice;
  },

  update(id: number, data: Partial<Omit<Invoice, 'id'>>): Invoice | null {
    const invoices = this.getAll();
    const index = invoices.findIndex(i => i.id === id);
    
    if (index === -1) return null;
    
    const oldInvoice = invoices[index];
    
    // Restore old stock quantities
    oldInvoice.items.forEach(item => {
      productService.updateStock(item.productId, item.quantity);
    });
    
    // Deduct new stock quantities
    if (data.items) {
      data.items.forEach(item => {
        productService.updateStock(item.productId, -item.quantity);
      });
    }
    
    invoices[index] = { ...oldInvoice, ...data };
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
    return invoices[index];
  },

  delete(id: number): boolean {
    const invoices = this.getAll();
    const invoice = invoices.find(i => i.id === id);
    
    if (!invoice) return false;
    
    // Restore stock quantities
    invoice.items.forEach(item => {
      productService.updateStock(item.productId, item.quantity);
    });
    
    const filtered = invoices.filter(i => i.id !== id);
    saveToStorage(STORAGE_KEYS.INVOICES, filtered);
    return true;
  },

  getTotalRevenue(): number {
    const invoices = this.getAll();
    return invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  },
};

