export interface NFProfile {
  nfInstanceId: string;
  nfType: string;
  nfStatus: 'REGISTERED' | 'SUSPENDED' | 'UNDISCOVERABLE';
  heartBeatTimer?: number;
  plmnList?: Array<{
    mcc: string;
    mnc: string;
  }>;
  sNssais?: Array<{
    sst: number;
    sd?: string;
  }>;
  nsiList?: string[];
  fqdn?: string;
  ipv4Addresses?: string[];
  ipv6Addresses?: string[];
  allowedPlmns?: Array<{
    mcc: string;
    mnc: string;
  }>;
  allowedNfTypes?: string[];
  allowedNssais?: Array<{
    sst: number;
    sd?: string;
  }>;
  capacity?: number;
  load?: number;
  locality?: string;
  priority?: number;
  nfServices?: Array<{
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
  }>;
  nfProfileChangesSupportInd?: boolean;
  nfProfileChangesInd?: boolean;
}
