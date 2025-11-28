import { StoredAccessToken } from '../types/accessToken';
import { storageAdapter, StorageCollection } from '../db/storageAdapter';

class TokenStore {
  private collection: StorageCollection<StoredAccessToken> | null = null;

  initialize(): void {
    this.collection = storageAdapter.getCollection<StoredAccessToken>('access-tokens', 'access_token');
  }

  async store(token: StoredAccessToken): Promise<void> {
    if (!this.collection) {
      throw new Error('TokenStore not initialized');
    }
    await this.collection.insertOne(token);
  }

  async get(accessToken: string): Promise<StoredAccessToken | null> {
    if (!this.collection) {
      throw new Error('TokenStore not initialized');
    }
    return await this.collection.findOne({ access_token: accessToken });
  }

  async deleteExpired(): Promise<void> {
    if (!this.collection) {
      throw new Error('TokenStore not initialized');
    }
    const now = Date.now();
    await this.collection.deleteMany({
      $expr: {
        $lt: [{ $add: ['$created_at', { $multiply: ['$expires_in', 1000] }] }, now]
      }
    });
  }

  async isValid(accessToken: string): Promise<boolean> {
    const token = await this.get(accessToken);
    if (!token) {
      return false;
    }
    const now = Date.now();
    const expiryTime = token.created_at + (token.expires_in * 1000);
    return now < expiryTime;
  }
}

export const tokenStore = new TokenStore();
