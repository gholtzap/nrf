import { NFProfile } from './nfProfile';
import { NFService } from './nfService';

export interface SharedData {
  sharedDataId: string;
  sharedProfileData?: NFProfile;
  sharedServiceData?: NFService;
}
