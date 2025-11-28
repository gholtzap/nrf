import { Collection } from 'mongodb';
import { mongoClient } from './mongodb';
import { memoryStore, MemoryCollection } from './memoryStore';
import { configService } from '../services/configService';

export type StorageCollection<T extends { [key: string]: any }> = Collection<T> | MemoryCollection<T>;

class StorageAdapter {
  private initialized = false;
  private storageType: 'memory' | 'mongodb' = 'memory';

  async initialize(type: 'memory' | 'mongodb', mongoUri?: string, dbName?: string): Promise<void> {
    this.storageType = type;

    if (type === 'mongodb') {
      if (!mongoUri || !dbName) {
        throw new Error('MongoDB URI and database name required for mongodb storage type');
      }
      await mongoClient.connect(mongoUri, dbName);
    }

    this.initialized = true;
  }

  getCollection<T extends { [key: string]: any }>(collectionName: string, idField: string = '_id'): StorageCollection<T> {
    if (!this.initialized) {
      throw new Error('StorageAdapter not initialized. Call initialize() first.');
    }

    if (this.storageType === 'mongodb') {
      return mongoClient.getCollection<T>(collectionName);
    } else {
      return memoryStore.getCollection<T>(collectionName, idField);
    }
  }

  getStorageType(): 'memory' | 'mongodb' {
    return this.storageType;
  }

  async close(): Promise<void> {
    if (this.storageType === 'mongodb') {
      await mongoClient.close();
    } else {
      memoryStore.clear();
    }
    this.initialized = false;
  }
}

export const storageAdapter = new StorageAdapter();
