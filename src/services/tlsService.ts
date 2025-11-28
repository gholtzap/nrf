import fs from 'fs';
import https from 'https';
import { Config } from '../types/config';

export type TlsOptions = {
  cert: Buffer;
  key: Buffer;
  ca?: Buffer;
  requestCert: boolean;
  rejectUnauthorized: boolean;
};

class TlsService {
  loadCertificates(config: Config): TlsOptions | null {
    if (!config.security.tlsEnabled) {
      return null;
    }

    const { certPath, keyPath, caPath, mtlsEnabled } = config.security;

    if (!certPath || !keyPath) {
      throw new Error('TLS enabled but certPath or keyPath not configured');
    }

    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificate file not found: ${certPath}`);
    }

    if (!fs.existsSync(keyPath)) {
      throw new Error(`Key file not found: ${keyPath}`);
    }

    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);
    let ca: Buffer | undefined;

    if (mtlsEnabled) {
      if (!caPath) {
        throw new Error('mTLS enabled but caPath not configured');
      }

      if (!fs.existsSync(caPath)) {
        throw new Error(`CA file not found: ${caPath}`);
      }

      ca = fs.readFileSync(caPath);
    }

    return {
      cert,
      key,
      ca,
      requestCert: mtlsEnabled,
      rejectUnauthorized: mtlsEnabled
    };
  }

  createHttpsServer(app: any, tlsOptions: TlsOptions): https.Server {
    return https.createServer(tlsOptions, app);
  }
}

export const tlsService = new TlsService();
