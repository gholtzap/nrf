import { NFProfile } from '../types/nfProfile';

class NFStore {
  private profiles: Map<string, NFProfile> = new Map();

  get(nfInstanceId: string): NFProfile | undefined {
    return this.profiles.get(nfInstanceId);
  }

  set(nfInstanceId: string, profile: NFProfile): void {
    this.profiles.set(nfInstanceId, profile);
  }

  delete(nfInstanceId: string): boolean {
    return this.profiles.delete(nfInstanceId);
  }

  getAll(): NFProfile[] {
    return Array.from(this.profiles.values());
  }

  has(nfInstanceId: string): boolean {
    return this.profiles.has(nfInstanceId);
  }
}

export const nfStore = new NFStore();
