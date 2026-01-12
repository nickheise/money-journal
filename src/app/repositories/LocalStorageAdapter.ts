import { IStorage } from './interfaces';

/**
 * LocalStorageAdapter - Implements IStorage using browser's localStorage
 * 
 * This adapter makes localStorage async-compatible with our repository pattern.
 * Makes it easy to swap to IndexedDB or API later without changing repositories.
 */
export class LocalStorageAdapter implements IStorage {
  /**
   * Get item from localStorage
   * Wrapped in Promise for consistency with async storage APIs
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`LocalStorage getItem error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   * Wrapped in Promise for consistency with async storage APIs
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`LocalStorage setItem error for key "${key}":`, error);
      
      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some data or export and clear your data.');
      }
      
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove item from localStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`LocalStorage removeItem error for key "${key}":`, error);
      throw new Error(`Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all items from localStorage
   * WARNING: This clears ALL localStorage, not just our app's data
   */
  async clear(): Promise<void> {
    try {
      // Only clear our app's keys to avoid breaking other apps
      const keys = await this.keys();
      const appKeys = keys.filter(key => 
        key.startsWith('money_journal_') || 
        key.startsWith('user_')
      );
      
      for (const key of appKeys) {
        await this.removeItem(key);
      }
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      throw new Error(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all keys in localStorage
   */
  async keys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('LocalStorage keys error:', error);
      return [];
    }
  }

  /**
   * Check if localStorage is available and working
   * Useful for detecting incognito mode or disabled storage
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get approximate storage usage in bytes
   * Useful for warning users before hitting quota
   */
  async getUsageBytes(): Promise<number> {
    try {
      const keys = await this.keys();
      let total = 0;
      
      for (const key of keys) {
        const value = await this.getItem(key);
        if (value) {
          // Approximate size: key length + value length (in UTF-16, so * 2)
          total += (key.length + value.length) * 2;
        }
      }
      
      return total;
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return 0;
    }
  }

  /**
   * Get storage usage as human-readable string
   */
  async getUsageString(): Promise<string> {
    const bytes = await this.getUsageBytes();
    
    if (bytes < 1024) {
      return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }
}

/**
 * Singleton instance
 * Export a single instance to use throughout the app
 */
export const localStorageAdapter = new LocalStorageAdapter();
