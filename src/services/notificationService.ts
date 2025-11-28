import { subscriptionStore } from '../storage/subscriptionStore';
import { NotificationData } from '../types/notificationData';
import { NFProfile } from '../types/nfProfile';
import { SubscriptionData, NotificationEventType } from '../types/subscriptionData';
import axios from 'axios';
import { configService } from './configService';

class NotificationService {
  private maxRetries: number;
  private retryDelay: number;
  private timeout: number;

  constructor() {
    const config = configService.get();
    this.maxRetries = config.notification.retryAttempts;
    this.retryDelay = config.notification.retryDelay;
    this.timeout = config.notification.timeout;
  }

  async sendNotifications(
    nfProfile: NFProfile,
    event: NotificationEventType,
    nfInstanceUri: string,
    profileChanges?: any[]
  ): Promise<void> {
    const subscriptions = await subscriptionStore.getAll();

    const matchingSubscriptions = subscriptions.filter(sub =>
      this.matchesSubscription(sub, nfProfile, event)
    );

    for (const subscription of matchingSubscriptions) {
      await this.sendNotification(subscription, nfProfile, event, nfInstanceUri, profileChanges);
    }
  }

  private matchesSubscription(
    subscription: SubscriptionData,
    nfProfile: NFProfile,
    event: NotificationEventType
  ): boolean {
    if (subscription.reqNotifEvents && subscription.reqNotifEvents.length > 0) {
      if (!subscription.reqNotifEvents.includes(event)) {
        return false;
      }
    }

    if (subscription.reqNfInstanceId && subscription.reqNfInstanceId !== nfProfile.nfInstanceId) {
      return false;
    }

    if (subscription.reqNfType && subscription.reqNfType !== nfProfile.nfType) {
      return false;
    }

    if (subscription.reqNfFqdn && subscription.reqNfFqdn !== nfProfile.fqdn) {
      return false;
    }

    if (subscription.reqPlmnList && subscription.reqPlmnList.length > 0) {
      if (!nfProfile.plmnList || nfProfile.plmnList.length === 0) {
        return false;
      }
      const hasMatchingPlmn = subscription.reqPlmnList.some(reqPlmn =>
        nfProfile.plmnList!.some(plmn =>
          plmn.mcc === reqPlmn.mcc && plmn.mnc === reqPlmn.mnc
        )
      );
      if (!hasMatchingPlmn) {
        return false;
      }
    }

    return true;
  }

  private async sendNotification(
    subscription: SubscriptionData,
    nfProfile: NFProfile,
    event: NotificationEventType,
    nfInstanceUri: string,
    profileChanges?: any[]
  ): Promise<void> {
    const notificationData: NotificationData = {
      event,
      nfInstanceUri,
      nfProfile: event === 'NF_DEREGISTERED' ? undefined : nfProfile,
      profileChanges: event === 'NF_PROFILE_CHANGED' ? profileChanges : undefined
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await axios.post(subscription.nfStatusNotificationUri, notificationData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        });
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    console.error(
      `Failed to send notification to ${subscription.nfStatusNotificationUri} after ${this.maxRetries} attempts:`,
      lastError
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const notificationService = new NotificationService();
