export class MemoryCollection<T extends { [key: string]: any }> {
  private data: Map<string, T> = new Map();
  private idField: string;

  constructor(idField: string) {
    this.idField = idField;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    const entries = Array.from(this.data.values());
    const result = entries.find(item => this.matchesFilter(item, filter));
    return result || null;
  }

  async find(filter: Partial<T> = {}): Promise<{ toArray: () => Promise<T[]> }> {
    const entries = Array.from(this.data.values());
    const results = Object.keys(filter).length === 0
      ? entries
      : entries.filter(item => this.matchesFilter(item, filter));

    return {
      toArray: async () => results
    };
  }

  async updateOne(
    filter: Partial<T>,
    update: { $set?: Partial<T> },
    options?: { upsert?: boolean }
  ): Promise<void> {
    const existing = await this.findOne(filter);

    if (existing) {
      const id = existing[this.idField];
      const updated = { ...existing, ...(update.$set || {}) };
      this.data.set(id, updated);
    } else if (options?.upsert && update.$set) {
      const id = update.$set[this.idField];
      if (id) {
        this.data.set(id, update.$set as T);
      }
    }
  }

  async deleteOne(filter: Partial<T>): Promise<{ deletedCount: number }> {
    const existing = await this.findOne(filter);
    if (existing) {
      const id = existing[this.idField];
      this.data.delete(id);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async countDocuments(filter: Partial<T>): Promise<number> {
    const results = await this.find(filter);
    const arr = await results.toArray();
    return arr.length;
  }

  async insertOne(document: T): Promise<void> {
    const id = document[this.idField];
    if (id) {
      this.data.set(id, document);
    } else {
      throw new Error(`Document missing required id field: ${this.idField}`);
    }
  }

  async deleteMany(filter: any): Promise<{ deletedCount: number }> {
    const entries = Array.from(this.data.entries());
    let deletedCount = 0;

    for (const [id, item] of entries) {
      if (this.matchesComplexFilter(item, filter)) {
        this.data.delete(id);
        deletedCount++;
      }
    }

    return { deletedCount };
  }

  private matchesComplexFilter(item: T, filter: any): boolean {
    if (filter.$expr) {
      return this.evaluateExpression(item, filter.$expr);
    }
    return this.matchesFilter(item, filter);
  }

  private evaluateExpression(item: T, expr: any): boolean {
    if (expr.$lt) {
      const left = this.evaluateValue(item, expr.$lt[0]);
      const right = this.evaluateValue(item, expr.$lt[1]);
      return left < right;
    }
    return false;
  }

  private evaluateValue(item: T, valueExpr: any): any {
    if (typeof valueExpr === 'number') {
      return valueExpr;
    }
    if (typeof valueExpr === 'string' && valueExpr.startsWith('$')) {
      return item[valueExpr.substring(1)];
    }
    if (valueExpr.$add) {
      return valueExpr.$add.reduce((sum: number, v: any) => sum + this.evaluateValue(item, v), 0);
    }
    if (valueExpr.$multiply) {
      return valueExpr.$multiply.reduce((prod: number, v: any) => prod * this.evaluateValue(item, v), 1);
    }
    return valueExpr;
  }

  private matchesFilter(item: T, filter: Partial<T>): boolean {
    for (const key in filter) {
      const filterValue = filter[key];
      const itemValue = item[key];

      if (typeof filterValue === 'object' && filterValue !== null && !Array.isArray(filterValue)) {
        if ('$lt' in filterValue) {
          if (!(itemValue < (filterValue as any).$lt)) return false;
        }
        if ('$gt' in filterValue) {
          if (!(itemValue > (filterValue as any).$gt)) return false;
        }
        if ('$lte' in filterValue) {
          if (!(itemValue <= (filterValue as any).$lte)) return false;
        }
        if ('$gte' in filterValue) {
          if (!(itemValue >= (filterValue as any).$gte)) return false;
        }
      } else {
        if (itemValue !== filterValue) return false;
      }
    }
    return true;
  }

  clear(): void {
    this.data.clear();
  }
}

class MemoryStore {
  private collections: Map<string, MemoryCollection<any>> = new Map();

  getCollection<T extends { [key: string]: any }>(collectionName: string, idField: string = '_id'): MemoryCollection<T> {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new MemoryCollection<T>(idField));
    }
    return this.collections.get(collectionName)!;
  }

  clear(): void {
    this.collections.clear();
  }
}

export const memoryStore = new MemoryStore();
