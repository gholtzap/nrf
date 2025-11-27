import { SharedData } from '../types/sharedData';

class SharedDataStore {
  private data: Map<string, SharedData> = new Map();

  get(sharedDataId: string): SharedData | undefined {
    return this.data.get(sharedDataId);
  }

  set(sharedDataId: string, sharedData: SharedData): void {
    this.data.set(sharedDataId, sharedData);
  }

  delete(sharedDataId: string): boolean {
    return this.data.delete(sharedDataId);
  }

  getAll(): SharedData[] {
    return Array.from(this.data.values());
  }

  has(sharedDataId: string): boolean {
    return this.data.has(sharedDataId);
  }
}

export const sharedDataStore = new SharedDataStore();
