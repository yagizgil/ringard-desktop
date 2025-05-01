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

interface Participant {
  id: string;
  username: string;
  avatar_id: string | null;
  custom_status: string | null;
  status: number;
  display_name: string;
  is_online: boolean | null;
  last_online_at: string | null;
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
  participants: Participant[];
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

const getConversationDisplayName = (conversation: Conversation, currentUserId: string | null) => {
  if (!currentUserId) return conversation.name;
  
  if (conversation.conversation_type === 'private') {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant ? otherParticipant.username : conversation.name;
  }
  
  return conversation.name;
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
        const userId = getCookie('user_id');
        if (!token || !userId) return;

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
    { 
      id: 'social' as TabType, 
      label: 'Sosyal', 
      icon: <Users className="w-5 h-5" />,
      count: null
    },
    { 
      id: 'news' as TabType, 
      label: 'Haberler', 
      icon: <Newspaper className="w-5 h-5" />,
      count: 5
    },
    { 
      id: 'updates' as TabType, 
      label: 'Güncellemeler', 
      icon: <Bell className="w-5 h-5" />,
      count: 2
    },
    { 
      id: 'market' as TabType, 
      label: 'Market', 
      icon: <ShoppingBag className="w-5 h-5" />,
      count: null
    }
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
        participantId => participantId.id !== currentUserId
      );
      if (otherParticipantId) {
        // Mesajları çek
        await fetchMessages(conversation.id);
        router.push(`/direct/${otherParticipantId.id}`);
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
      {pathname === '/' ? (
        <div className="grid grid-cols-4 gap-1 p-2 bg-white/5 rounded-lg mx-2 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.count && (
                <span className={`absolute top-1 right-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="px-2 space-y-1 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push('/')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {tab.icon}
              </div>
              <span className="font-medium text-sm">{tab.label}</span>
              {tab.count && (
                <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* DM Listesi */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        <div className="px-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Konuşmalar
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="px-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="w-10 h-10 rounded-full bg-white/10"></div>
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded w-24 mb-2"></div>
                  <div className="h-2 bg-white/10 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all group relative"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg ring-2 ring-white/10">
                    <span className="text-lg font-medium text-white">
                      {getConversationDisplayName(conversation, currentUserId).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[2.5px] border-[var(--surface)]
                    ${conversation.is_active ? 'bg-green-500' : 'bg-gray-500'}
                    shadow-sm transition-colors`} 
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-white transition-colors">
                      {getConversationDisplayName(conversation, currentUserId)}
                    </p>
                    {conversation.last_message_at && (
                      <span className="text-[10px] text-[var(--text-secondary)] group-hover:text-white/50 transition-colors flex-shrink-0">
                        {new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {conversation.last_message_content && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[var(--text-secondary)] truncate group-hover:text-white/70 transition-colors flex-1">
                        {decryptLastMessage(conversation.last_message_content, currentUserId || '')}
                      </p>
                      {conversation.unread_count && conversation.unread_count > 0 && (
                        <span className="flex-shrink-0 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-md">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Kullanıcı Profili */}
      <MiniProfile />
    </div>
  );
}
