export type MessageType = 'text' | 'image' | 'video' | 'gif' | 'file' | 'catalog';

export type MessageSender = 'me' | 'other';

export interface Message {
  id: string;
  type: MessageType;
  text?: string | null;
  uri?: string | null;
  width?: number | null;
  height?: number | null;
  fileName?: string | null;
  fileSize?: string | null;
  title?: string | null;
  items?: number | null;
  sender: MessageSender;
  timestamp: string;
}

export interface PusherConfig {
  appKey: string;
  cluster: string;
  channelName: string;
  eventName: string;
}

export interface UserConfig {
  userId: string;
  userName: string;
}

export type TabId = 'Updates' | 'Chat' | 'Settings';

