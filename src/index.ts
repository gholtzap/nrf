import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nfInstancesRouter from './routes/nfInstances';
import sharedDataRouter from './routes/sharedData';
import subscriptionsRouter from './routes/subscriptions';
import nfDiscoveryRouter from './routes/nfDiscovery';
import bootstrappingRouter from './routes/bootstrapping';
import oauth2Router from './routes/oauth2';
import { mongoClient } from './db/mongodb';
import { nfStore } from './storage/nfStore';
import { sharedDataStore } from './storage/sharedDataStore';
import { subscriptionStore } from './storage/subscriptionStore';
import { tokenStore } from './storage/tokenStore';
import { heartbeatService } from './services/heartbeatService';
import { configService } from './services/configService';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const config = configService.get();
const PORT = config.server.port;

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (config.logging.level === 'debug' || config.logging.level === 'info') {
    const logMessage = config.logging.format === 'json'
      ? JSON.stringify({ timestamp: new Date().toISOString(), method: req.method, path: req.path })
      : `${new Date().toISOString()} ${req.method} ${req.path}`;
    console.log(logMessage);
  }
  next();
});

app.use('/nnrf-nfm/v1/nf-instances', nfInstancesRouter);
app.use('/nnrf-nfm/v1/shared-data', sharedDataRouter);
app.use('/nnrf-nfm/v1/subscriptions', subscriptionsRouter);
app.use('/nnrf-disc/v1/nf-instances', nfDiscoveryRouter);
app.use('/bootstrapping', bootstrappingRouter);
app.use('/oauth2', oauth2Router);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    type: 'application/problem+json',
    title: 'Internal Server Error',
    status: 500,
    detail: err.message
  });
});

async function startServer() {
  const mongoUri = config.database.uri;
  const dbName = config.database.name;

  if (!mongoUri) {
    console.error('MONGODB_URI is required in configuration');
    process.exit(1);
  }

  await mongoClient.connect(mongoUri, dbName);

  nfStore.initialize();
  sharedDataStore.initialize();
  subscriptionStore.initialize();
  tokenStore.initialize();
  heartbeatService.initialize({
    checkInterval: config.heartbeat.checkInterval * 1000,
    gracePeriod: config.heartbeat.gracePeriod * 1000,
    defaultHeartbeatTimer: config.heartbeat.defaultTimer
  });

  const sampleProfile = {
    nfInstanceId: '550e8400-e29b-41d4-a716-446655440000',
    nfType: 'AMF',
    nfStatus: 'REGISTERED' as const,
    heartBeatTimer: 30,
    plmnList: [{
      mcc: '001',
      mnc: '01'
    }],
    sNssais: [{
      sst: 1,
      sd: '000001'
    }],
    fqdn: 'amf.example.com',
    ipv4Addresses: ['192.168.1.100'],
    capacity: 100,
    load: 50,
    priority: 1,
    nfServices: [{
      serviceInstanceId: '0',
      serviceName: 'namf-comm',
      versions: [{
        apiVersionInUri: 'v1',
        apiFullVersion: '1.0.0'
      }],
      scheme: 'https' as const,
      nfServiceStatus: 'REGISTERED' as const,
      fqdn: 'amf.example.com',
      ipEndPoints: [{
        ipv4Address: '192.168.1.100',
        transport: 'TCP' as const,
        port: 8080
      }],
      capacity: 100,
      load: 50,
      priority: 1
    }]
  };

  await nfStore.set(sampleProfile.nfInstanceId, sampleProfile);

  app.listen(PORT, () => {
    console.log(`NRF server listening on port ${PORT}`);
    console.log(`Configuration loaded from: ${process.env.CONFIG_FILE || 'config.yaml'}`);
    console.log(`Database: ${dbName}`);
    console.log(`Log level: ${config.logging.level}`);
    console.log(`Heartbeat check interval: ${config.heartbeat.checkInterval}s`);
    console.log(`Sample NF Instance available at: http://localhost:${PORT}/nnrf-nfm/v1/nf-instances/${sampleProfile.nfInstanceId}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
