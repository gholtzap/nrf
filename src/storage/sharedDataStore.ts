import { Collection } from 'mongodb';
import { SharedData } from '../types/sharedData';
import { mongoClient } from '../db/mongodb';

class SharedDataStore {
  private collection: Collection<SharedData> | null = null;

  initialize(): void {
    this.collection = mongoClient.getCollection<SharedData>('shared-data');
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
    return await this.collection.find({}).toArray();
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
