import { NFService } from './nfService';

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
  nfServices?: NFService[];
  nfProfileChangesSupportInd?: boolean;
  nfProfileChangesInd?: boolean;
}
