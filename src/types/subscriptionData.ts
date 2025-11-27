export type SubscriptionData = {
  nfStatusNotificationUri: string;
  subscriptionId?: string;
  reqNfInstanceId?: string;
  sharedDataIds?: string[];
  subscrCond?: any;
  validityTime?: string;
  reqNotifEvents?: NotificationEventType[];
  plmnId?: PlmnId;
  nid?: string;
  notifCondition?: any;
  reqNfType?: string;
  reqNfFqdn?: string;
  reqSnssais?: any[];
  reqPerPlmnSnssais?: any[];
  reqPlmnList?: PlmnId[];
  reqSnpnList?: any[];
  servingScope?: string[];
  requesterFeatures?: string;
  nrfSupportedFeatures?: string;
  hnrfUri?: string;
  onboardingCapability?: boolean;
  targetHni?: string;
  preferredLocality?: string;
  extPreferredLocality?: Record<string, any[]>;
  completeProfileSubscription?: boolean;
};

export type NotificationEventType =
  | 'NF_REGISTERED'
  | 'NF_DEREGISTERED'
  | 'NF_PROFILE_CHANGED'
  | 'NF_STATUS_CHANGED';

export type PlmnId = {
  mcc: string;
  mnc: string;
};
