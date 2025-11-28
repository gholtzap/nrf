import { NFService } from './nfService';

export interface NFProfile {
  nfInstanceId: string;
  nfType: string;
  nfStatus: 'REGISTERED' | 'SUSPENDED' | 'UNDISCOVERABLE';
  heartBeatTimer?: number;
  nfSetId?: string;
  plmnList?: Array<{
    mcc: string;
    mnc: string;
  }>;
  sNssais?: Array<{
    sst: number;
    sd?: string;
  }>;
  nsiList?: string[];
  taiList?: Array<{
    plmnId: {
      mcc: string;
      mnc: string;
    };
    tac: string;
  }>;
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
  dnnList?: string[];
  capacity?: number;
  load?: number;
  locality?: string;
  priority?: number;
  nfServices?: NFService[];
  nfProfileChangesSupportInd?: boolean;
  nfProfileChangesInd?: boolean;
}
