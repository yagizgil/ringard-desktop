'use client';

import Image from 'next/image';
import { Search, Users, Bell, ShoppingBag, Newspaper, Mic, MicOff, Headphones, PhoneOff, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MiniProfile from './MiniProfile';
import { TabType } from '@/app/types/tabs';
import { getCookie } from 'cookies-next';
import { MessageSecurity } from '@/app/lib/security/MessageSecurity';

type Status = 'online' | 'idle' | 'dnd' | 'offline';
type VoiceStatus = 'connected' | 'muted' | 'deafened' | 'disconnected';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  attachments: any[];
  embeds: any[];
  reactions: any[];
  read_status: any[];
}

interface Conversation {
  id: string;
  conversation_type: string;
  name: string;
  icon_id: string | null;
  owner_id: string;
  created_at: string;
  last_message_at: string;
  last_message_content: string;
  last_message_sender_id: string;
  is_active: boolean;
  participants: string[];
  unread_count: number | null;
}

interface DM {
  id: string;
  name: string;
  avatar: string;
  status: Status;
  lastMessage: string;
  unreadCount: number;
  lastActive?: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  voiceStatus: VoiceStatus;
}

const STATUS_COLORS: Record<Status, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500'
};

const currentUser: UserProfile = {
  id: '1',
  name: 'Deniz Yılmaz',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
  status: 'online',
  voiceStatus: 'connected'
};

export default function ChannelSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>('social');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(currentUser.voiceStatus);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    const userId = getCookie('user_id');
    if (userId) {
      setCurrentUserId(userId as string);
    }
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = getCookie('access_token');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/p2p/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = getCookie('access_token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/p2p/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(prev => ({
        ...prev,
        [conversationId]: data
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    const tabChangeEvent = new CustomEvent('tabChange', { detail: tabId });
    window.dispatchEvent(tabChangeEvent);
  };

  const tabs = [
    { id: 'social', label: 'Sosyal', icon: <Users className="w-5 h-5" /> },
    { id: 'news', label: 'Haberler', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'updates', label: 'Güncellemeler', icon: <Bell className="w-5 h-5" /> },
    { id: 'market', label: 'Market', icon: <ShoppingBag className="w-5 h-5" /> }
  ];

  const toggleMic = () => {
    setVoiceStatus(prev => prev === 'muted' ? 'connected' : 'muted');
  };

  const toggleDeafen = () => {
    setVoiceStatus(prev => prev === 'deafened' ? 'connected' : 'deafened');
  };

  const disconnect = () => {
    setVoiceStatus('disconnected');
  };

  const handleConversationClick = async (conversation: Conversation) => {
    if (!currentUserId) return;

    if (conversation.conversation_type === 'private') {
      // Private mesaj için karşı tarafın ID'sini bul
      const otherParticipantId = conversation.participants.find(
        participantId => participantId !== currentUserId
      );
      if (otherParticipantId) {
        // Mesajları çek
        await fetchMessages(conversation.id);
        router.push(`/direct/${otherParticipantId}`);
      }
    } else if (conversation.conversation_type === 'group') {
      // Grup sohbeti için grup ID'sini kullan
      await fetchMessages(conversation.id);
      router.push(`/group/${conversation.id}`);
    }
  };

  // Son mesajı çöz
  const decryptLastMessage = (content: string, userId: string) => {
    if (!content) return '';
    if (content.startsWith('RING_')) {
      return MessageSecurity.decryptMessage(content, userId) || 'Mesaj çözülemedi';
    }
    return content;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] w-[240px] border-r border-white/5">
      {/* Header - Arama */}
      <div className="p-4 border-b border-[var(--card)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Sohbet veya kişi ara"
            className="w-full pl-9 pr-4 py-2 bg-[var(--card)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] rounded-lg text-sm focus:outline-none focus:ring-2 ring-[var(--primary)] transition-all"
          />
        </div>
      </div>

      {/* Tab Butonları */}
      {pathname === '/' && (
        <div className="px-2 space-y-1 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'hover:bg-white/5 text-[var(--text-secondary)]'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              {tab.id === 'updates' && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  2
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {pathname !== '/' && (
        <div className="px-2 space-y-1 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push('/')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'hover:bg-white/5 text-[var(--text-secondary)]'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              {tab.id === 'updates' && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  2
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* DM Listesi */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Direkt Mesajlar
          </h3>
        </div>
        {isLoading ? (
          <div className="px-4 py-2">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-[var(--card)] rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-[var(--card)] rounded"></div>
                  <div className="h-4 bg-[var(--card)] rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--card)] flex items-center justify-center">
                  <span className="text-lg font-medium text-[var(--text-primary)]">
                    {conversation.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--surface)] ${
                  conversation.is_active ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">{conversation.name}</p>
                {conversation.last_message_content && (
                  <p className="text-xs text-[var(--text-secondary)] truncate max-w-[120px]">
                    {decryptLastMessage(conversation.last_message_content, currentUserId || '')}
                  </p>
                )}
              </div>
              {conversation.unread_count && conversation.unread_count > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {conversation.unread_count}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Kullanıcı Profili */}
      <MiniProfile />
    </div>
  );
}
