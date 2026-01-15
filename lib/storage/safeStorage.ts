/**
 * Safari-safe localStorage wrapper
 *
 * Safari throws "The operation is insecure" error when localStorage is accessed:
 * - In private browsing mode
 * - When tracking prevention blocks storage
 * - In certain iframe contexts
 *
 * This utility wraps all localStorage operations in try-catch blocks and
 * falls back to an in-memory store when localStorage is unavailable.
 */

// In-memory fallback store for when localStorage is unavailable
const memoryStore = new Map<string, string>();

// Track whether localStorage is available
let localStorageAvailable: boolean | null = null;

/**
 * Check if localStorage is available and accessible
 */
function isLocalStorageAvailable(): boolean {
  if (localStorageAvailable !== null) {
    return localStorageAvailable;
  }

  if (typeof window === 'undefined') {
    localStorageAvailable = false;
    return false;
  }

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    localStorageAvailable = true;
    return true;
  } catch {
    console.warn('[SafeStorage] localStorage is not available, using in-memory fallback');
    localStorageAvailable = false;
    return false;
  }
}

/**
 * Safely get an item from storage
 * Falls back to in-memory store if localStorage is unavailable
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (isLocalStorageAvailable()) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn(`[SafeStorage] Failed to get item "${key}":`, error);
      return memoryStore.get(key) ?? null;
    }
  }

  return memoryStore.get(key) ?? null;
}

/**
 * Safely set an item in storage
 * Falls back to in-memory store if localStorage is unavailable
 */
export function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch (error) {
      console.warn(`[SafeStorage] Failed to set item "${key}":`, error);
    }
  }

  memoryStore.set(key, value);
}

/**
 * Safely remove an item from storage
 * Removes from both localStorage and in-memory store
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[SafeStorage] Failed to remove item "${key}":`, error);
    }
  }

  memoryStore.delete(key);
}

/**
 * Check if storage is using the in-memory fallback
 * Useful for debugging and warning users about persistence
 */
export function isUsingMemoryFallback(): boolean {
  return !isLocalStorageAvailable();
}
