import { MongoClient, Db, Collection, Document } from 'mongodb';

class MongoDBClient {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(uri: string, dbName: string): Promise<void> {
    if (this.client) {
      return;
    }

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(dbName);
    console.log(`Connected to MongoDB database: ${dbName}`);
  }

  getCollection<T extends Document>(collectionName: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection<T>(collectionName);
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

export const mongoClient = new MongoDBClient();
