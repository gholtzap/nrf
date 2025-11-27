import { Collection } from 'mongodb';
import { NFProfile } from '../types/nfProfile';
import { mongoClient } from '../db/mongodb';

class NFStore {
  private collection: Collection<NFProfile> | null = null;

  initialize(): void {
    this.collection = mongoClient.getCollection<NFProfile>('nf-instances');
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
    return await this.collection.find({}).toArray();
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
