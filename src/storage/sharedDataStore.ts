import { SharedData } from '../types/sharedData';
import { storageAdapter, StorageCollection } from '../db/storageAdapter';

class SharedDataStore {
  private collection: StorageCollection<SharedData> | null = null;

  initialize(): void {
    this.collection = storageAdapter.getCollection<SharedData>('shared-data', 'sharedDataId');
  }

  async get(sharedDataId: string): Promise<SharedData | null> {
    if (!this.collection) {
      throw new Error('SharedDataStore not initialized');
    }
    return await this.collection.findOne({ sharedDataId });
  }

  async set(sharedDataId: string, sharedData: SharedData): Promise<void> {
    if (!this.collection) {
      throw new Error('SharedDataStore not initialized');
    }
    await this.collection.updateOne(
      { sharedDataId },
      { $set: sharedData },
      { upsert: true }
    );
  }

  async delete(sharedDataId: string): Promise<boolean> {
    if (!this.collection) {
      throw new Error('SharedDataStore not initialized');
    }
    const result = await this.collection.deleteOne({ sharedDataId });
    return result.deletedCount > 0;
  }

  async getAll(): Promise<SharedData[]> {
    if (!this.collection) {
      throw new Error('SharedDataStore not initialized');
    }
    const cursor = await this.collection.find({});
    return await cursor.toArray();
  }

  async has(sharedDataId: string): Promise<boolean> {
    if (!this.collection) {
      throw new Error('SharedDataStore not initialized');
    }
    const count = await this.collection.countDocuments({ sharedDataId });
    return count > 0;
  }
}

export const sharedDataStore = new SharedDataStore();
