import express, { Request, Response, NextFunction } from 'express';
import nfInstancesRouter from './routes/nfInstances';
import { nfStore } from './storage/nfStore';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use('/nnrf-nfm/v1/nf-instances', nfInstancesRouter);

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

nfStore.set(sampleProfile.nfInstanceId, sampleProfile);

app.listen(PORT, () => {
  console.log(`NRF server listening on port ${PORT}`);
  console.log(`Sample NF Instance available at: http://localhost:${PORT}/nnrf-nfm/v1/nf-instances/${sampleProfile.nfInstanceId}`);
});
