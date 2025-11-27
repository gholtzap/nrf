export type HeartbeatMetadata = {
  nfInstanceId: string;
  lastHeartbeat: Date;
  heartBeatTimer: number;
  expiresAt: Date;
};
