'use client';

import Image from 'next/image';
import { MicOff, Headphones, Settings, Hash, Volume2, GamepadIcon, HelpCircle, TicketIcon, BookOpen, Bell, ChevronRight, Plus, BadgeCheck, Crown, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import MiniProfile from './MiniProfile';
import { useParams } from 'next/navigation';
import { useState } from 'react';

type VoiceStatus = 'connected' | 'muted' | 'deafened' | 'disconnected';
type ChannelType = 'announcement' | 'text' | 'voice' | 'game' | 'qa' | 'support' | 'blog';

interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  unreadCount?: number;
  mentionCount?: number;
}

interface Category {
  id: string;
  name: string;
  channels: Channel[];
  collapsed?: boolean;
}

interface ServerInfo {
  id: string;
  name: string;
  icon: string;
  banner: string;
  isVerified: boolean;
  isPremium: boolean;
  memberCount: number;
  boostLevel: number;
  categories: Category[];
}

const SERVER_DATA: ServerInfo = {
  id: '1',
  name: 'Ringard',
  icon: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=256&h=256&fit=crop',
  banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=400&fit=crop',
  isVerified: true,
  isPremium: true,
  memberCount: 120,
  boostLevel: 3,
  categories: [
    {
      id: '1',
      name: 'Bilgilendirme',
      channels: [
        { id: '1', name: 'duyurular', type: 'announcement', unreadCount: 2 },
        { id: '2', name: 'kurallar', type: 'text' }
      ]
    },
    {
      id: '2',
      name: 'Sohbet Kanalları',
      channels: [
        { id: '3', name: 'genel', type: 'text', mentionCount: 3 },
        { id: '4', name: 'sohbet', type: 'text' }
      ]
    },
    {
      id: '3',
      name: 'Sesli Kanallar',
      channels: [
        { id: '5', name: 'Genel Sohbet', type: 'voice' },
        { id: '6', name: 'Müzik', type: 'voice' }
      ]
    },
    {
      id: '4',
      name: 'Oyun Odaları',
      channels: [
        { id: '7', name: 'minecraft', type: 'game' },
        { id: '8', name: 'valorant', type: 'game' }
      ]
    },
    {
      id: '5',
      name: 'Destek',
      channels: [
        { id: '9', name: 'soru-cevap', type: 'qa' },
        { id: '10', name: 'destek-talebi', type: 'support' }
      ]
    },
    {
      id: '6',
      name: 'İçerik',
      channels: [
        { id: '11', name: 'blog', type: 'blog' }
      ]
    }
  ]
};

const currentUser = {
  id: '1',
  name: 'Deniz Yılmaz',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
  status: 'online' as const,
  voiceStatus: 'connected' as VoiceStatus
};

const getChannelIcon = (type: ChannelType) => {
  switch (type) {
    case 'announcement': return <Bell size={18} />;
    case 'text': return <Hash size={18} />;
    case 'voice': return <Volume2 size={18} />;
    case 'game': return <GamepadIcon size={18} />;
    case 'qa': return <HelpCircle size={18} />;
    case 'support': return <TicketIcon size={18} />;
    case 'blog': return <BookOpen size={18} />;
  }
};

export default function ChannelsSidebar() {
  const params = useParams();
  const currentChannelId = params.channelId as string;
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="flex flex-col w-full h-full bg-[var(--surface)] w-[240px] border-r border-white/5">
      {/* Sunucu Banner ve Bilgileri */}
      <div className="relative">
        <div className="h-24 w-full overflow-hidden">
          <Image
            src={SERVER_DATA.banner}
            alt={SERVER_DATA.name}
            width={240}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute -bottom-4 left-4">
          <div className="relative">
            <Image
              src={SERVER_DATA.icon}
              alt={SERVER_DATA.name}
              width={40}
              height={40}
              className="rounded-full border-4 border-[var(--surface)]"
            />
            {SERVER_DATA.isVerified && (
              <div className="absolute -right-1 -bottom-1 bg-[var(--surface)] rounded-full p-0.5">
                <BadgeCheck size={14} className="text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sunucu Bilgileri */}
      <div className="pt-6 px-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{SERVER_DATA.name}</h1>
          {SERVER_DATA.isPremium && (
            <Crown size={16} className="text-yellow-500" />
          )}
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {SERVER_DATA.memberCount.toLocaleString()} üye • Seviye {SERVER_DATA.boostLevel}
        </p>
      </div>

      {/* Kategoriler ve Kanallar */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {SERVER_DATA.categories.map((category) => (
          <div key={category.id} className='bg-[var(--background)] p-2 rounded-md'>
            <button 
              className="w-full flex items-center gap-1 px-1 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
              onClick={() => toggleCategory(category.id)}
            >
              <ChevronDown 
                size={12} 
                className={`flex-shrink-0 transition-transform duration-200 ${
                  collapsedCategories[category.id] ? '-rotate-90' : ''
                }`} 
              />
              <span className="uppercase tracking-wider">{category.name}</span>
              <Plus size={12} className="ml-auto opacity-0 group-hover:opacity-100" />
            </button>
            <div className={`transition-all duration-200 ${
              collapsedCategories[category.id] 
                ? 'h-0 overflow-hidden opacity-0 m-0 p-0 border-none' 
                : 'mt-1 space-y-0.5 opacity-100'
            }`}>
              {category.channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/server/${SERVER_DATA.id}/channel/${channel.id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 my-1 rounded-md group ${
                    currentChannelId === channel.id
                      ? 'bg-[var(--primary)] text-white'
                      : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {getChannelIcon(channel.type)}
                  <span className="flex-1 truncate">{channel.name}</span>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {channel.unreadCount}
                    </span>
                  )}
                  {channel.mentionCount && channel.mentionCount > 0 && (
                    <span className="bg-[var(--primary)] text-white text-xs px-1.5 py-0.5 rounded-full">
                      @{channel.mentionCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Kullanıcı Profili */}
      <MiniProfile />
    </div>
  );
}
