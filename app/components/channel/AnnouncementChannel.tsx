'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '@/app/types/channel';
import { Megaphone, Bell, Pin, Search, HelpCircle, Shield, Calendar, Settings, PlusCircle, MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnnouncementChannelProps {
  channelId: string;
  channelName: string;
  topic?: string;
  isAdmin?: boolean;
}

const SAMPLE_ANNOUNCEMENTS: Message[] = [
  {
    id: '1',
    content: '🎉 **Yeni Özellik**: Artık sesli sohbetlerde ekran paylaşımı yapabilirsiniz!\n\nYeni güncellememizle birlikte:\n- HD kalitesinde ekran paylaşımı\n- Çoklu ekran desteği\n- Optimize edilmiş performans\n\nHemen deneyin ve geri bildirimlerinizi bekliyoruz!',
    author: {
      id: '1',
      name: 'Sistem',
      avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&q=80',
      role: 'Admin',
      status: 'online'
    },
    timestamp: '2025-03-28T09:00:00',
    pinned: true,
    reactions: [
      { 
        emoji: '🎉', 
        count: 25, 
        users: [], 
        userId: '1',
        timestamp: new Date().toISOString()
      },
      { 
        emoji: '👍', 
        count: 15, 
        users: [], 
        userId: '1',
        timestamp: new Date().toISOString()
      },
      { 
        emoji: '🚀', 
        count: 10, 
        users: [], 
        userId: '1',
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    content: '⚠️ **Planlı Bakım Duyurusu**\n\nYarın 03:00-05:00 (UTC) arasında sunucularımızda bakım çalışması yapılacaktır.\n\n**Etkilenecek Servisler:**\n- Sesli sohbet\n- Dosya paylaşımı\n- Bot servisleri\n\n_Anlayışınız için teşekkür ederiz._',
    author: {
      id: '2',
      name: 'Moderatör',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80',
      role: 'Moderator',
      status: 'online'
    },
    timestamp: '2025-03-28T09:05:00',
    reactions: [
      { 
        emoji: '👍', 
        count: 15, 
        users: [], 
        userId: '2',
        timestamp: new Date().toISOString()
      },
      { 
        emoji: '📝', 
        count: 5, 
        users: [], 
        userId: '2',
        timestamp: new Date().toISOString()
      }
    ]
  }
];

export default function AnnouncementChannel({ channelId, channelName, topic, isAdmin = false }: AnnouncementChannelProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [announcements, setAnnouncements] = useState<Message[]>(SAMPLE_ANNOUNCEMENTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdminState = true;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [announcements]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Kanal Başlığı */}
      <div className="h-14 flex items-center sticky top-0 justify-between px-4 bg-[var(--surface)] border-b border-white/5">
        <div className="flex items-center gap-3 text-center align-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary)] bg-opacity-10">
            <Megaphone className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h1 className="text-[var(--text-primary)] font-semibold flex items-center gap-2">
              {channelName}
            </h1>
            {topic && (
              <p className="text-xs text-[var(--text-secondary)]">{topic}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--card)] text-[var(--text-secondary)]">
              <Search size={14} />
              <input
                type="text"
                placeholder="Duyurularda ara"
                className="w-32 bg-transparent border-none outline-none text-sm"
              />
            </div>
          </div>
          <button className="hidden md:block p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <Bell size={18} />
          </button>
          <button className="hidden md:block p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <Pin size={18} />
          </button>
          <button className="hidden md:block p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      {/* Duyuru Listesi */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {announcements.map((announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[var(--surface)] to-[var(--card)] rounded-xl overflow-hidden shadow-lg border border-white/5"
          >
            {/* Duyuru Başlığı */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)]">
                  <Image
                    src={announcement.author.avatar}
                    alt={announcement.author.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {announcement.author.name}
                    </span>
                    {announcement.author.role && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--primary)] text-white font-medium">
                        {announcement.author.role}
                      </span>
                    )}
                  </div>
                  
                </div>
              </div>
              <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">
                    {new Intl.DateTimeFormat('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }).format(new Date(announcement.timestamp))}
                  </span>
                  
                {announcement.pinned && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs">
                    <Pin size={12} />
                    Sabitlendi
                  </span>
                )}
                
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Duyuru İçeriği */}
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-[var(--text-primary)] text-lg leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            </div>

            {/* Duyuru Alt Kısmı */}
            <div className="px-6 py-4 bg-[var(--card)] flex items-center justify-between">
              <div className="flex gap-2">
                {announcement.reactions?.map((reaction, index) => (
                  <button
                    key={index}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                      reaction.users.includes(reaction.userId)
                        ? 'bg-[var(--primary)] text-white scale-110'
                        : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:scale-105'
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
                  <ThumbsUp size={14} />
                  <span>Tepki Ekle</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm hover:bg-white/5 transition-colors">
                  <MessageCircle size={14} />
                  <span>Yorum Yap</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Alt Panel */}
      <div className="bg-[var(--surface)] border-t border-white/5 sticky bottom-0">
        {isAdminState === true ? (
          // Yönetici Paneli
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[var(--text-primary)] font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--primary)]" />
                Yönetici Paneli {isAdminState}
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity">
                <PlusCircle size={18} />
                <span>Yeni Duyuru</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-[var(--card)] to-[var(--surface)] hover:from-[var(--card-hover)] hover:to-[var(--surface-hover)] transition-colors group">
                <div className="p-3 rounded-full bg-[var(--primary)] bg-opacity-10 group-hover:bg-opacity-20 transition-colors">
                  <Calendar className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <span className="text-sm text-[var(--text-primary)]">Planlanmış Duyurular</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-[var(--card)] to-[var(--surface)] hover:from-[var(--card-hover)] hover:to-[var(--surface-hover)] transition-colors group">
                <div className="p-3 rounded-full bg-[var(--primary)] bg-opacity-10 group-hover:bg-opacity-20 transition-colors">
                  <Pin className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <span className="text-sm text-[var(--text-primary)]">Sabitlenmiş Duyurular</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-[var(--card)] to-[var(--surface)] hover:from-[var(--card-hover)] hover:to-[var(--surface-hover)] transition-colors group">
                <div className="p-3 rounded-full bg-[var(--primary)] bg-opacity-10 group-hover:bg-opacity-20 transition-colors">
                  <Settings className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <span className="text-sm text-[var(--text-primary)]">Kanal Ayarları</span>
              </button>
            </div>
          </div>
        ) : (
          // Kullanıcı Paneli
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-sm text-[var(--text-primary)]">
                Bu kanalda yeni duyurular yayınlandığında bildirim al
              </span>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isFollowing
                  ? 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  : 'bg-[var(--primary)] text-white hover:opacity-90'
              }`}
            >
              {isFollowing ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Bırak</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Takip</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
