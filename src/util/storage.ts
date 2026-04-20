const STORAGE_PREFIX = 'app_';

export function getStorageKey(key: string, userId?: string): string {
  return userId ? `${STORAGE_PREFIX}${userId}_${key}` : `${STORAGE_PREFIX}${key}`;
}

export function getItem<T>(key: string, userId?: string): T | null {
  try {
    const storageKey = getStorageKey(key, userId);
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T, userId?: string): void {
  try {
    const storageKey = getStorageKey(key, userId);
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
}

export function removeItem(key: string, userId?: string): void {
  try {
    const storageKey = getStorageKey(key, userId);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
  }
}

export function getItemSync(key: string, userId?: string): string | null {
  try {
    const storageKey = getStorageKey(key, userId);
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function setItemSync(key: string, value: string, userId?: string): void {
  try {
    const storageKey = getStorageKey(key, userId);
    localStorage.setItem(storageKey, value);
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
}