import { Category } from '@/types/models';
import { firestoreService, COLLECTIONS } from './firestoreService';

const COUNTER_NAME = 'category_counter';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return firestoreService.getAll<Category>(COLLECTIONS.CATEGORIES);
  },

  async getById(id: number): Promise<Category | null> {
    return firestoreService.getById<Category>(COLLECTIONS.CATEGORIES, id);
  },

  async create(data: Omit<Category, 'id'>): Promise<Category> {
    return firestoreService.create<Category>(
      COLLECTIONS.CATEGORIES,
      data,
      COUNTER_NAME
    );
  },

  async update(id: number, data: Partial<Omit<Category, 'id'>>): Promise<Category | null> {
    return firestoreService.update<Category>(COLLECTIONS.CATEGORIES, id, data);
  },

  async delete(id: number): Promise<boolean> {
    return firestoreService.delete(COLLECTIONS.CATEGORIES, id);
  },
};
