import { useCallback } from 'react';
import { ProjectDataSchema, type ProjectData } from '../schemas';

const STORAGE_KEYS = {
  PROJECT_DATA: 'project-lite-data',
  PROJECT_FILENAME: 'project-lite-filename',
} as const;

export function useLocalStorage() {
  const saveToStorage = useCallback((data: ProjectData, filename: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECT_DATA, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.PROJECT_FILENAME, filename);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, []);

  const loadFromStorage = useCallback((): { data: ProjectData | null; filename: string } => {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.PROJECT_DATA);
      const filename = localStorage.getItem(STORAGE_KEYS.PROJECT_FILENAME) || '';
      
      if (dataStr) {
        const rawData = JSON.parse(dataStr);
        // Validate the data structure
        const validationResult = ProjectDataSchema.safeParse(rawData);
        if (validationResult.success) {
          return { data: validationResult.data, filename };
        } else {
          console.warn('Invalid cached data, clearing localStorage');
          clearStorage();
        }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      clearStorage();
    }
    
    return { data: null, filename: '' };
  }, []);

  const clearStorage = useCallback((): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECT_DATA);
      localStorage.removeItem(STORAGE_KEYS.PROJECT_FILENAME);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, []);

  const hasStoredData = useCallback((): boolean => {
    return Boolean(localStorage.getItem(STORAGE_KEYS.PROJECT_DATA));
  }, []);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
    hasStoredData,
  };
}