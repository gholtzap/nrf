import { Collection } from 'mongodb';
import { HeartbeatMetadata } from '../types/heartbeatMetadata';
import { mongoClient } from '../db/mongodb';
import { nfStore } from '../storage/nfStore';
import { notificationService } from './notificationService';

type HeartbeatConfig = {
  checkInterval: number;
  gracePeriod: number;
  defaultHeartbeatTimer: number;
};

class HeartbeatService {
  private collection: Collection<HeartbeatMetadata> | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private config: HeartbeatConfig = {
    checkInterval: 10000,
    gracePeriod: 5000,
    defaultHeartbeatTimer: 30
  };

  initialize(config?: Partial<HeartbeatConfig>): void {
    this.collection = mongoClient.getCollection<HeartbeatMetadata>('heartbeats');

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.startMonitoring();
  }

  async recordHeartbeat(nfInstanceId: string, heartBeatTimer?: number): Promise<void> {
    if (!this.collection) {
      throw new Error('HeartbeatService not initialized');
    }

    const timer = heartBeatTimer || this.config.defaultHeartbeatTimer;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + timer * 1000);

    const metadata: HeartbeatMetadata = {
      nfInstanceId,
      lastHeartbeat: now,
      heartBeatTimer: timer,
      expiresAt
    };

    await this.collection.updateOne(
      { nfInstanceId },
      { $set: metadata },
      { upsert: true }
    );
  }

  async getHeartbeat(nfInstanceId: string): Promise<HeartbeatMetadata | null> {
    if (!this.collection) {
      throw new Error('HeartbeatService not initialized');
    }
    return await this.collection.findOne({ nfInstanceId });
  }

  async deleteHeartbeat(nfInstanceId: string): Promise<void> {
    if (!this.collection) {
      throw new Error('HeartbeatService not initialized');
    }
    await this.collection.deleteOne({ nfInstanceId });
  }

  private async checkExpiredHeartbeats(): Promise<void> {
    if (!this.collection) {
      return;
    }

    try {
      const now = new Date();
      const gracePeriodDate = new Date(now.getTime() + this.config.gracePeriod);

      const expiredHeartbeats = await this.collection.find({
        expiresAt: { $lt: gracePeriodDate }
      }).toArray();

      for (const heartbeat of expiredHeartbeats) {
        console.log(`Heartbeat expired for NF Instance ${heartbeat.nfInstanceId}. Auto-deregistering...`);

        const profile = await nfStore.get(heartbeat.nfInstanceId);

        await nfStore.delete(heartbeat.nfInstanceId);

        await this.deleteHeartbeat(heartbeat.nfInstanceId);

        if (profile) {
          const nfInstanceUri = `/nnrf-nfm/v1/nf-instances/${heartbeat.nfInstanceId}`;
          await notificationService.sendNotifications(
            profile,
            'NF_DEREGISTERED',
            nfInstanceUri
          );
        }
      }

      if (expiredHeartbeats.length > 0) {
        console.log(`Auto-deregistered ${expiredHeartbeats.length} expired NF instance(s)`);
      }
    } catch (error) {
      console.error('Error checking expired heartbeats:', error);
    }
  }

  private startMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.checkExpiredHeartbeats();
    }, this.config.checkInterval);

    console.log(`Heartbeat monitoring started (check interval: ${this.config.checkInterval}ms, grace period: ${this.config.gracePeriod}ms)`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Heartbeat monitoring stopped');
    }
  }

  getConfig(): HeartbeatConfig {
    return { ...this.config };
  }
}

export const heartbeatService = new HeartbeatService();
