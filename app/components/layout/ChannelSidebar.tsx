'use client';

import Image from 'next/image';
import { Search, Users, Bell, ShoppingBag, Newspaper, Mic, MicOff, Headphones, PhoneOff, Settings } from 'lucide-react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MiniProfile from './MiniProfile';
import { TabType } from '@/app/types/tabs';
type Status = 'online' | 'idle' | 'dnd' | 'offline';
type VoiceStatus = 'connected' | 'muted' | 'deafened' | 'disconnected';

interface DM {
  id: number;
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

const DM_LIST: DM[] = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&q=80",
    status: "online",
    lastMessage: "Yarın görüşelim mi?",
    unreadCount: 2,
    lastActive: "2 dk önce"
  },
  {
    id: 2,
    name: "Merve Demir",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80",
    status: "idle",
    lastMessage: "Projeyi tamamladım",
    unreadCount: 0,
    lastActive: "15 dk önce"
  },
  {
    id: 3,
    name: "Can Kaya",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80",
    status: "dnd",
    lastMessage: "Toplantıdayım",
    unreadCount: 0,
    lastActive: "1 saat önce"
  },
  {
    id: 4,
    name: "Zeynep Ak",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=80",
    status: "offline",
    lastMessage: "Teşekkürler!",
    unreadCount: 0,
    lastActive: "3 saat önce"
  }
];

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
        {DM_LIST.map((dm) => (
          <button
            key={dm.id}
            onClick={() => router.push(`/direct/${dm.id}`)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={dm.avatar}
                  alt={dm.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--surface)] ${
                dm.status === 'online' ? 'bg-green-500' :
                dm.status === 'idle' ? 'bg-yellow-500' :
                dm.status === 'dnd' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[var(--text-primary)]">{dm.name}</p>
              {dm.lastMessage && (
                <p className="text-xs text-[var(--text-secondary)] truncate max-w-[120px]">
                  {dm.lastMessage}
                </p>
              )}
            </div>
            {dm.unreadCount && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {dm.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kullanıcı Profili */}
      <MiniProfile />
    </div>
  );
}
