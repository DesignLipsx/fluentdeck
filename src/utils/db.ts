import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'fluent-deck-cache';
const DB_VERSION = 1;
const STORE_NAME = 'json-cache';

interface CacheSchema extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: {
      timestamp: number;
      data: any;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<CacheSchema>> | null = null;

const getDb = (): Promise<IDBPDatabase<CacheSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<CacheSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await getDb();
    const cached = await db.get(STORE_NAME, key);
    if (!cached) return null;

    // Cache is valid for 1 day
    const isCacheValid = (Date.now() - cached.timestamp) < 86400000; // 24 * 60 * 60 * 1000

    if (isCacheValid) {
      return cached.data as T;
    } else {
      // Cache is stale, delete it
      await db.delete(STORE_NAME, key);
      return null;
    }
  } catch (error) {
    console.error('Failed to get data from IndexedDB', error);
    return null;
  }
};

export const setCachedData = async (key: string, data: any): Promise<void> => {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, { timestamp: Date.now(), data }, key);
  } catch (error) {
    console.error('Failed to set data in IndexedDB', error);
  }
};