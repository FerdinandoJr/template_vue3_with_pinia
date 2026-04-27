const STORAGE_PREFIX = 'app_';

const ALGORITHM = 'AES-GCM';

async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(data)
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const dataBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return `${ivBase64}:${dataBase64}`;
}

async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const [ivBase64, dataBase64] = encryptedData.split(':');
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataBase64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}

let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const storedKey = localStorage.getItem('datacrm_storage_key');
  if (storedKey) {
    const keyData = JSON.parse(atob(storedKey));
    cachedKey = await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: ALGORITHM, length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    return cachedKey;
  }

  const newKey = await generateKey();
  const exportedKey = await crypto.subtle.exportKey('jwk', newKey);
  localStorage.setItem('datacrm_storage_key', btoa(JSON.stringify(exportedKey)));
  cachedKey = newKey;
  return newKey;
}

export function getStorageKey(key: string, userId?: string): string {
  return userId ? `${STORAGE_PREFIX}${userId}_${key}` : `${STORAGE_PREFIX}${key}`;
}

export async function getItem<T>(key: string, userId?: string): Promise<T | null> {
  try {
    const storageKey = getStorageKey(key, userId);
    const item = localStorage.getItem(storageKey);
    if (!item) return null;

    const key = await getEncryptionKey();
    const decrypted = await decrypt(item, key);
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T, userId?: string): Promise<void> {
  try {
    const storageKey = getStorageKey(key, userId);
    const key = await getEncryptionKey();
    const encrypted = await encrypt(JSON.stringify(value), key);
    localStorage.setItem(storageKey, encrypted);
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
}

export async function removeItem(key: string, userId?: string): Promise<void> {
  try {
    const storageKey = getStorageKey(key, userId);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
  }
}

export async function clearUserStorage(userId: string): Promise<void> {
  const keys = Object.keys(localStorage).filter(k => k.includes(userId));
  keys.forEach(k => localStorage.removeItem(k));
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