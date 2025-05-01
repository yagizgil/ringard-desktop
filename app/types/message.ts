import { Reaction } from './channel';

export interface MessageAuthor {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
}

export interface MessageReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
}

export interface Message {
  id: string;
  content: string;
  author: MessageAuthor;
  timestamp: string;
  reactions: Reaction[];
  attachments: any[];
  embeds: any[];
  replyTo?: MessageReply;
  gifUrl?: string;
  gifTitle?: string;
  type?: 'text' | 'gif';
} 