export type ChannelType = 'announcement' | 'text' | 'voice' | 'game' | 'qa' | 'support' | 'blog';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  topic?: string;
  unreadCount?: number;
  mentionCount?: number;
}

export interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

export interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  userId: string;
  timestamp: string;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
}

export interface Message {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  edited?: boolean;
  pinned?: boolean;
  reactions?: Reaction[];
  attachments?: Attachment[];
  replyTo?: {
    id: string;
    content: string;
    author: Author;
  };
  mentions?: string[];
  type?: 'text' | 'gif';
  gifUrl?: string;
  gifTitle?: string;
}
