export type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';

export interface PlatformConnection {
  platform: string;
  status: ConnectionStatus;
}

export interface PublishQueueItem {
  id: string;
  platform: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface DegradedModeState {
  enabled: boolean;
  reason: string;
}
