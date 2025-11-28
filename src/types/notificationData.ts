import { NFProfile } from './nfProfile';
import { NotificationEventType } from './subscriptionData';

export type NotificationData = {
  event: NotificationEventType;
  nfInstanceUri: string;
  nfProfile?: NFProfile;
  profileChanges?: any[];
};
