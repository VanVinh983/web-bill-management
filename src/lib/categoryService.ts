import { Category } from '@/types/models';
import { getFromStorage, saveToStorage, getNextId, STORAGE_KEYS } from './localStorage';

export const categoryService = {
  getAll(): Category[] {
    return getFromStorage<Category>(STORAGE_KEYS.CATEGORIES);
  },

  getById(id: number): Category | undefined {
    const categories = this.getAll();
    return categories.find(c => c.id === id);
  },

  create(data: Omit<Category, 'id'>): Category {
    const categories = this.getAll();
    const newCategory: Category = {
      id: getNextId(STORAGE_KEYS.CATEGORY_COUNTER),
      ...data,
    };
    categories.push(newCategory);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  },

  update(id: number, data: Partial<Omit<Category, 'id'>>): Category | null {
    const categories = this.getAll();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    categories[index] = { ...categories[index], ...data };
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  },

  delete(id: number): boolean {
    const categories = this.getAll();
    const filtered = categories.filter(c => c.id !== id);
    
    if (filtered.length === categories.length) return false;
    
    saveToStorage(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },
};

