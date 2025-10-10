import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreService';

/**
 * Initialize or update counter values for invoice IDs
 * This function can be called from the browser console or a setup page
 */
export async function setInvoiceCounter(value: number): Promise<void> {
  try {
    const counterRef = doc(db, COLLECTIONS.COUNTERS, 'invoice_counter');
    
    // Set the counter to value - 1 because the next invoice will increment it
    await setDoc(counterRef, { value: value - 1 }, { merge: true });
    
    console.log(`✅ Invoice counter set to ${value - 1}. Next invoice ID will be ${value}`);
  } catch (error) {
    console.error('❌ Error setting invoice counter:', error);
    throw error;
  }
}

/**
 * Get current counter value
 */
export async function getCounterValue(counterName: string): Promise<number> {
  try {
    const counterRef = doc(db, COLLECTIONS.COUNTERS, counterName);
    const counterDoc = await getDoc(counterRef);
    
    if (counterDoc.exists()) {
      return counterDoc.data().value || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Error getting counter value:', error);
    return 0;
  }
}

/**
 * Initialize all counters with custom starting values
 */
export async function initializeAllCounters(config: {
  invoiceStartId?: number;
  productStartId?: number;
  categoryStartId?: number;
}): Promise<void> {
  try {
    if (config.invoiceStartId) {
      await setDoc(
        doc(db, COLLECTIONS.COUNTERS, 'invoice_counter'),
        { value: config.invoiceStartId - 1 },
        { merge: true }
      );
      console.log(`✅ Invoice counter initialized. Next ID: ${config.invoiceStartId}`);
    }
    
    if (config.productStartId) {
      await setDoc(
        doc(db, COLLECTIONS.COUNTERS, 'product_counter'),
        { value: config.productStartId - 1 },
        { merge: true }
      );
      console.log(`✅ Product counter initialized. Next ID: ${config.productStartId}`);
    }
    
    if (config.categoryStartId) {
      await setDoc(
        doc(db, COLLECTIONS.COUNTERS, 'category_counter'),
        { value: config.categoryStartId - 1 },
        { merge: true }
      );
      console.log(`✅ Category counter initialized. Next ID: ${config.categoryStartId}`);
    }
    
    console.log('✅ All counters initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing counters:', error);
    throw error;
  }
}

