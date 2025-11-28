import { NFProfile } from '../types/nfProfile';
import { storageAdapter, StorageCollection } from '../db/storageAdapter';

class NFStore {
  private collection: StorageCollection<NFProfile> | null = null;

  initialize(): void {
    this.collection = storageAdapter.getCollection<NFProfile>('nf-instances', 'nfInstanceId');
  }

  async get(nfInstanceId: string): Promise<NFProfile | null> {
    if (!this.collection) {
      throw new Error('NFStore not initialized');
    }
    return await this.collection.findOne({ nfInstanceId });
  }

  async set(nfInstanceId: string, profile: NFProfile): Promise<void> {
    if (!this.collection) {
      throw new Error('NFStore not initialized');
    }
    await this.collection.updateOne(
      { nfInstanceId },
      { $set: profile },
      { upsert: true }
    );
  }

  async delete(nfInstanceId: string): Promise<boolean> {
    if (!this.collection) {
      throw new Error('NFStore not initialized');
    }
    const result = await this.collection.deleteOne({ nfInstanceId });
    return result.deletedCount > 0;
  }

  async getAll(): Promise<NFProfile[]> {
    if (!this.collection) {
      throw new Error('NFStore not initialized');
    }
    const cursor = await this.collection.find({});
    return await cursor.toArray();
  }

  async has(nfInstanceId: string): Promise<boolean> {
    if (!this.collection) {
      throw new Error('NFStore not initialized');
    }
    const count = await this.collection.countDocuments({ nfInstanceId });
    return count > 0;
  }
}

export const nfStore = new NFStore();
