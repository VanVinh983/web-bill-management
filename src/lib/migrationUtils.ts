/**
 * Migration utilities to transfer data from localStorage to Firestore
 * 
 * IMPORTANT: This is a one-time migration script. 
 * Use with caution as it will overwrite existing Firestore data.
 */

import { Category, Product, Invoice } from '@/types/models';
import { categoryService } from './categoryService';
import { productService } from './productService';
import { invoiceService } from './invoiceService';

// Keys used in localStorage
const LOCAL_STORAGE_KEYS = {
  CATEGORIES: 'ngoc-vy-categories',
  PRODUCTS: 'ngoc-vy-products',
  INVOICES: 'ngoc-vy-invoices',
  CATEGORY_COUNTER: 'ngoc-vy-category-counter',
  PRODUCT_COUNTER: 'ngoc-vy-product-counter',
  INVOICE_COUNTER: 'ngoc-vy-invoice-counter',
};

/**
 * Get data from localStorage
 */
function getFromLocalStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
}

/**
 * Migration status interface
 */
export interface MigrationStatus {
  categoriesMigrated: number;
  productsMigrated: number;
  invoicesMigrated: number;
  errors: string[];
}

/**
 * Migrate all data from localStorage to Firestore
 * 
 * @returns Promise with migration status
 */
export async function migrateAllData(): Promise<MigrationStatus> {
  const status: MigrationStatus = {
    categoriesMigrated: 0,
    productsMigrated: 0,
    invoicesMigrated: 0,
    errors: [],
  };

  console.log('🚀 Starting migration from localStorage to Firestore...');

  try {
    // Step 1: Migrate Categories
    console.log('📁 Migrating categories...');
    const localCategories = getFromLocalStorage<Category>(LOCAL_STORAGE_KEYS.CATEGORIES);
    
    for (const category of localCategories) {
      try {
        // Check if category already exists in Firestore
        const existing = await categoryService.getById(category.id);
        if (!existing) {
          // Manually create with the same ID
          await categoryService.create({ name: category.name });
          status.categoriesMigrated++;
        } else {
          console.log(`Category ${category.id} already exists, skipping...`);
        }
      } catch (error) {
        status.errors.push(`Failed to migrate category ${category.id}: ${error}`);
      }
    }
    console.log(`✅ Migrated ${status.categoriesMigrated} categories`);

    // Step 2: Migrate Products
    console.log('📦 Migrating products...');
    const localProducts = getFromLocalStorage<Product>(LOCAL_STORAGE_KEYS.PRODUCTS);
    
    for (const product of localProducts) {
      try {
        const existing = await productService.getById(product.id);
        if (!existing) {
          await productService.create({
            name: product.name,
            categoryId: product.categoryId,
            note: product.note,
            expirationDate: product.expirationDate,
            costPrice: product.costPrice,
            salePrice: product.salePrice,
            stockQuantity: product.stockQuantity,
          });
          status.productsMigrated++;
        } else {
          console.log(`Product ${product.id} already exists, skipping...`);
        }
      } catch (error) {
        status.errors.push(`Failed to migrate product ${product.id}: ${error}`);
      }
    }
    console.log(`✅ Migrated ${status.productsMigrated} products`);

    // Step 3: Migrate Invoices
    console.log('📄 Migrating invoices...');
    const localInvoices = getFromLocalStorage<Invoice>(LOCAL_STORAGE_KEYS.INVOICES);
    
    for (const invoice of localInvoices) {
      try {
        const existing = await invoiceService.getById(invoice.id);
        if (!existing) {
          // Note: Creating invoice will also update product stock
          // We need to restore stock first before creating invoice
          // because invoice creation will deduct stock
          
          // Restore stock for all items in the invoice
          for (const item of invoice.items) {
            const product = await productService.getById(item.productId);
            if (product) {
              await productService.updateStock(item.productId, item.quantity);
            }
          }
          
          // Now create the invoice (which will deduct stock again)
          await invoiceService.create({
            orderDate: invoice.orderDate,
            customerName: invoice.customerName,
            customerPhone: invoice.customerPhone,
            customerAddress: invoice.customerAddress,
            shipFee: invoice.shipFee,
            discountOrDeposit: invoice.discountOrDeposit,
            totalAmount: invoice.totalAmount,
            items: invoice.items,
          });
          status.invoicesMigrated++;
        } else {
          console.log(`Invoice ${invoice.id} already exists, skipping...`);
        }
      } catch (error) {
        status.errors.push(`Failed to migrate invoice ${invoice.id}: ${error}`);
      }
    }
    console.log(`✅ Migrated ${status.invoicesMigrated} invoices`);

    console.log('🎉 Migration completed!');
    console.log('Summary:', status);

  } catch (error) {
    status.errors.push(`Migration failed: ${error}`);
    console.error('❌ Migration error:', error);
  }

  return status;
}

/**
 * Export current localStorage data as JSON
 * Useful for backup before migration
 */
export function exportLocalStorageData() {
  const data = {
    categories: getFromLocalStorage<Category>(LOCAL_STORAGE_KEYS.CATEGORIES),
    products: getFromLocalStorage<Product>(LOCAL_STORAGE_KEYS.PRODUCTS),
    invoices: getFromLocalStorage<Invoice>(LOCAL_STORAGE_KEYS.INVOICES),
    counters: {
      category: localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORY_COUNTER),
      product: localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCT_COUNTER),
      invoice: localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICE_COUNTER),
    },
  };

  console.log('📋 LocalStorage Data Export:');
  console.log(JSON.stringify(data, null, 2));
  
  // Download as file
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `localStorage-backup-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return data;
}

/**
 * Clear localStorage data after successful migration
 * CAUTION: This will delete all local data!
 */
export function clearLocalStorageData() {
  if (typeof window === 'undefined') return;
  
  const confirmed = confirm(
    '⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa tất cả dữ liệu localStorage?\n' +
    'Hành động này không thể hoàn tác!\n' +
    'Đảm bảo bạn đã backup và migration thành công.'
  );
  
  if (!confirmed) {
    console.log('❌ Cancelled clearing localStorage');
    return;
  }
  
  Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ LocalStorage data cleared');
}

