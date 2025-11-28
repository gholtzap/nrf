import { randomUUID } from 'crypto';

export const generateNfInstanceId = (): string => {
  return randomUUID();
};
