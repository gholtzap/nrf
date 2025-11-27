export type PatchOperation = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

export interface PatchItem {
  op: PatchOperation;
  path: string;
  value?: any;
  from?: string;
}
