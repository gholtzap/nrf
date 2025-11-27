export interface NFService {
  serviceInstanceId: string;
  serviceName: string;
  versions: Array<{
    apiVersionInUri: string;
    apiFullVersion: string;
  }>;
  scheme: 'http' | 'https';
  nfServiceStatus: 'REGISTERED' | 'SUSPENDED' | 'UNDISCOVERABLE';
  fqdn?: string;
  ipEndPoints?: Array<{
    ipv4Address?: string;
    ipv6Address?: string;
    transport?: 'TCP' | 'UDP';
    port?: number;
  }>;
  allowedPlmns?: Array<{
    mcc: string;
    mnc: string;
  }>;
  capacity?: number;
  load?: number;
  priority?: number;
}
