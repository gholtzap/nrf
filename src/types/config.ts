export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type Config = {
  server: {
    port: number;
    fqdn?: string;
    ipAddress?: string;
  };
  database: {
    uri: string;
    name: string;
  };
  heartbeat: {
    defaultTimer: number;
    gracePeriod: number;
    checkInterval: number;
  };
  logging: {
    level: LogLevel;
    format: 'json' | 'text';
  };
  security: {
    tlsEnabled: boolean;
    certPath?: string;
    keyPath?: string;
    caPath?: string;
    mtlsEnabled: boolean;
    oauth: {
      enabled: boolean;
      tokenExpiry: number;
    };
  };
  notification: {
    retryAttempts: number;
    retryDelay: number;
    timeout: number;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
};
