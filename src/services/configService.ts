import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Config } from '../types/config';

const DEFAULT_CONFIG: Config = {
  server: {
    port: 8080,
    http2Enabled: false,
  },
  database: {
    type: 'memory',
    uri: '',
    name: 'nrf',
  },
  heartbeat: {
    defaultTimer: 30,
    gracePeriod: 10,
    checkInterval: 5,
  },
  logging: {
    level: 'info',
    format: 'text',
  },
  security: {
    tlsEnabled: false,
    mtlsEnabled: false,
    oauth: {
      enabled: false,
      tokenExpiry: 3600,
    },
  },
  notification: {
    retryAttempts: 3,
    retryDelay: 5000,
    timeout: 10000,
  },
  rateLimit: {
    enabled: true,
    windowMs: 60000,
    maxRequests: 100,
  },
};

class ConfigService {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    let fileConfig: Partial<Config> = {};

    const configPath = process.env.CONFIG_FILE || path.join(process.cwd(), 'config.yaml');

    if (fs.existsSync(configPath)) {
      const fileContents = fs.readFileSync(configPath, 'utf8');

      if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
        fileConfig = yaml.load(fileContents) as Partial<Config>;
      } else if (configPath.endsWith('.json')) {
        fileConfig = JSON.parse(fileContents);
      }
    }

    const config: Config = {
      server: {
        port: this.getEnvNumber('PORT') || fileConfig.server?.port || DEFAULT_CONFIG.server.port,
        fqdn: process.env.SERVER_FQDN || fileConfig.server?.fqdn || DEFAULT_CONFIG.server.fqdn,
        ipAddress: process.env.SERVER_IP || fileConfig.server?.ipAddress || DEFAULT_CONFIG.server.ipAddress,
        http2Enabled: this.getEnvBoolean('HTTP2_ENABLED') ?? fileConfig.server?.http2Enabled ?? DEFAULT_CONFIG.server.http2Enabled,
      },
      database: {
        type: (process.env.DATABASE_TYPE as 'memory' | 'mongodb') || fileConfig.database?.type || DEFAULT_CONFIG.database.type,
        uri: process.env.MONGODB_URI || fileConfig.database?.uri || DEFAULT_CONFIG.database.uri,
        name: process.env.MONGODB_DB_NAME || fileConfig.database?.name || DEFAULT_CONFIG.database.name,
      },
      heartbeat: {
        defaultTimer: this.getEnvNumber('HEARTBEAT_DEFAULT_TIMER') || fileConfig.heartbeat?.defaultTimer || DEFAULT_CONFIG.heartbeat.defaultTimer,
        gracePeriod: this.getEnvNumber('HEARTBEAT_GRACE_PERIOD') || fileConfig.heartbeat?.gracePeriod || DEFAULT_CONFIG.heartbeat.gracePeriod,
        checkInterval: this.getEnvNumber('HEARTBEAT_CHECK_INTERVAL') || fileConfig.heartbeat?.checkInterval || DEFAULT_CONFIG.heartbeat.checkInterval,
      },
      logging: {
        level: (process.env.LOG_LEVEL as any) || fileConfig.logging?.level || DEFAULT_CONFIG.logging.level,
        format: (process.env.LOG_FORMAT as any) || fileConfig.logging?.format || DEFAULT_CONFIG.logging.format,
      },
      security: {
        tlsEnabled: this.getEnvBoolean('TLS_ENABLED') ?? fileConfig.security?.tlsEnabled ?? DEFAULT_CONFIG.security.tlsEnabled,
        certPath: process.env.TLS_CERT_PATH || fileConfig.security?.certPath || DEFAULT_CONFIG.security.certPath,
        keyPath: process.env.TLS_KEY_PATH || fileConfig.security?.keyPath || DEFAULT_CONFIG.security.keyPath,
        caPath: process.env.TLS_CA_PATH || fileConfig.security?.caPath || DEFAULT_CONFIG.security.caPath,
        mtlsEnabled: this.getEnvBoolean('MTLS_ENABLED') ?? fileConfig.security?.mtlsEnabled ?? DEFAULT_CONFIG.security.mtlsEnabled,
        oauth: {
          enabled: this.getEnvBoolean('OAUTH_ENABLED') ?? fileConfig.security?.oauth.enabled ?? DEFAULT_CONFIG.security.oauth.enabled,
          tokenExpiry: this.getEnvNumber('OAUTH_TOKEN_EXPIRY') || fileConfig.security?.oauth.tokenExpiry || DEFAULT_CONFIG.security.oauth.tokenExpiry,
        },
      },
      notification: {
        retryAttempts: this.getEnvNumber('NOTIFICATION_RETRY_ATTEMPTS') || fileConfig.notification?.retryAttempts || DEFAULT_CONFIG.notification.retryAttempts,
        retryDelay: this.getEnvNumber('NOTIFICATION_RETRY_DELAY') || fileConfig.notification?.retryDelay || DEFAULT_CONFIG.notification.retryDelay,
        timeout: this.getEnvNumber('NOTIFICATION_TIMEOUT') || fileConfig.notification?.timeout || DEFAULT_CONFIG.notification.timeout,
      },
      rateLimit: {
        enabled: this.getEnvBoolean('RATE_LIMIT_ENABLED') ?? fileConfig.rateLimit?.enabled ?? DEFAULT_CONFIG.rateLimit.enabled,
        windowMs: this.getEnvNumber('RATE_LIMIT_WINDOW_MS') || fileConfig.rateLimit?.windowMs || DEFAULT_CONFIG.rateLimit.windowMs,
        maxRequests: this.getEnvNumber('RATE_LIMIT_MAX_REQUESTS') || fileConfig.rateLimit?.maxRequests || DEFAULT_CONFIG.rateLimit.maxRequests,
      },
    };

    return config;
  }

  private getEnvNumber(key: string): number | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  }

  private getEnvBoolean(key: string): boolean | undefined {
    const value = process.env[key];
    if (value === undefined) return undefined;
    return value.toLowerCase() === 'true' || value === '1';
  }

  public get(): Config {
    return this.config;
  }

  public reload(): void {
    this.config = this.loadConfig();
  }
}

export const configService = new ConfigService();
