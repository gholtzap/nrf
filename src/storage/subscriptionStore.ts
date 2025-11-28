import { SubscriptionData } from '../types/subscriptionData';
import { storageAdapter, StorageCollection } from '../db/storageAdapter';

class SubscriptionStore {
  private collection: StorageCollection<SubscriptionData> | null = null;

  initialize(): void {
    this.collection = storageAdapter.getCollection<SubscriptionData>('subscriptions', 'subscriptionId');
  }

  async get(subscriptionId: string): Promise<SubscriptionData | null> {
    if (!this.collection) {
      throw new Error('SubscriptionStore not initialized');
    }
    return await this.collection.findOne({ subscriptionId });
  }

  async set(subscriptionId: string, subscription: SubscriptionData): Promise<void> {
    if (!this.collection) {
      throw new Error('SubscriptionStore not initialized');
    }
    await this.collection.updateOne(
      { subscriptionId },
      { $set: subscription },
      { upsert: true }
    );
  }

  async delete(subscriptionId: string): Promise<boolean> {
    if (!this.collection) {
      throw new Error('SubscriptionStore not initialized');
    }
    const result = await this.collection.deleteOne({ subscriptionId });
    return result.deletedCount > 0;
  }

  async getAll(): Promise<SubscriptionData[]> {
    if (!this.collection) {
      throw new Error('SubscriptionStore not initialized');
    }
    const cursor = await this.collection.find({});
    return await cursor.toArray();
  }

  async has(subscriptionId: string): Promise<boolean> {
    if (!this.collection) {
      throw new Error('SubscriptionStore not initialized');
    }
    const count = await this.collection.countDocuments({ subscriptionId });
    return count > 0;
  }
}

export const subscriptionStore = new SubscriptionStore();
