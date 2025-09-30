import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Draft } from 'immer';
import { Subject, Exam, StudySession, Lesson } from '@shared/types';
import { UseBoundStore, StoreApi } from 'zustand';
interface Entity {
  id: string;
  [key: string]: any;
}
interface ApiStore<T extends Entity> {
  items: T[];
  loading: boolean;
  error: string | null;
  setItems: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addItem: (item: T) => void;
  updateItem: (item: T) => void;
  removeItem: (id: string) => void;
}
const createApiStore = <T extends Entity>() =>
  create(
    immer<ApiStore<T>>((set) => ({
      items: [],
      loading: true,
      error: null,
      setItems: (items) => set({ items, loading: false, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      addItem: (item) => set((state) => {
        state.items.push(item as Draft<T>);
      }),
      updateItem: (item) => set((state) => {
        const index = state.items.findIndex((i) => i.id === item.id);
        if (index !== -1) {
          state.items[index] = item as Draft<T>;
        }
      }),
      removeItem: (id) => set((state) => {
        state.items = state.items.filter((item) => item.id !== id);
      }),
    }))
  );
const subjectStore = createApiStore<Subject>();
const examStore = createApiStore<Exam>();
const studySessionStore = createApiStore<StudySession>();
const lessonStore = createApiStore<Lesson>();
const stores = {
  subjects: subjectStore,
  exams: examStore,
  studysessions: studySessionStore,
  lessons: lessonStore,
};
type EntityName = keyof typeof stores;
export function useApi<T extends Entity>(entityName: EntityName, params?: Record<string, string>) {
  const store = stores[entityName] as unknown as UseBoundStore<StoreApi<ApiStore<T>>>;
  const { items, loading, error, setItems, setLoading, setError, addItem, updateItem, removeItem } = store();
  const paramsString = useMemo(() => params ? JSON.stringify(params) : '', [params]);
  const loadItems = useCallback(async () => {
    const currentParams = paramsString ? JSON.parse(paramsString) : undefined;
    const queryString = currentParams ? `?${new URLSearchParams(currentParams).toString()}` : '';
    const endpoint = `/api/${entityName}${queryString}`;
    if (store.getState().items.length > 0 && !currentParams) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await api<{ items: T[] }>(endpoint);
      setItems(result.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      toast.error(`Error loading ${entityName}:`, { description: errorMessage });
    }
  }, [entityName, paramsString, setItems, setLoading, setError, store]);
  useEffect(() => {
    loadItems();
  }, [loadItems]);
  const createItem = useCallback(async (data: Omit<T, 'id'>) => {
    try {
      const newItem = await api<T>(`/api/${entityName}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      addItem(newItem);
      toast.success(`${entityName.slice(0, -1)} created successfully!`);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to create ${entityName.slice(0, -1)}`;
      toast.error(`Error creating ${entityName.slice(0, -1)}:`, { description: errorMessage });
      throw err;
    }
  }, [addItem, entityName]);
  const editItem = useCallback(async (id: string, data: Partial<T>) => {
    try {
      const updatedItem = await api<T>(`/api/${entityName}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      updateItem(updatedItem);
      toast.success(`${entityName.slice(0, -1)} updated successfully!`);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update ${entityName.slice(0, -1)}`;
      toast.error(`Error updating ${entityName.slice(0, -1)}:`, { description: errorMessage });
      throw err;
    }
  }, [updateItem, entityName]);
  const deleteItem = useCallback(async (id: string) => {
    try {
      await api(`/api/${entityName}/${id}`, { method: 'DELETE' });
      removeItem(id);
      toast.success(`${entityName.slice(0, -1)} deleted successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${entityName.slice(0, -1)}`;
      toast.error(`Error deleting ${entityName.slice(0, -1)}:`, { description: errorMessage });
      throw err;
    }
  }, [removeItem, entityName]);
  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    editItem,
    deleteItem,
  };
}
export const useSubjects = () => useApi<Subject>('subjects');
export const useExams = () => useApi<Exam>('exams');
export const useStudySessions = () => useApi<StudySession>('studysessions');
export const useLessons = (subjectId?: string) => useApi<Lesson>('lessons', subjectId ? { subjectId } : undefined);