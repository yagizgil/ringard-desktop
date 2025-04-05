'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '@/app/types/channel';
import { Hash, AtSign, Smile, Paperclip, Gift, Send, Pin, Reply, Edit, MoreVertical, Search, Bell, Inbox, HelpCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface TextChannelProps {
  channelId: string;
  channelName: string;
  topic?: string;
}

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Herkese merhaba! Yeni sunucumuza hoş geldiniz 👋',
    author: {
      id: '1',
      name: 'Deniz',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
      role: 'Admin',
      status: 'online'
    },
    timestamp: '2025-03-28T09:00:00',
    pinned: true
  },
  {
    id: '2',
    content: 'Teşekkürler! Harika bir topluluk olacağına eminim.',
    author: {
      id: '2',
      name: 'Ayşe',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80',
      status: 'online'
    },
    timestamp: '2025-03-28T09:05:00',
    reactions: [
      { emoji: '❤️', count: 3, reacted: true },
      { emoji: '👍', count: 2, reacted: false }
    ]
  },
  {
    id: '3',
    content: 'Merhaba! Ben de yeni katıldım. Burada olmak harika!',
    author: {
      id: '3',
      name: 'Mehmet',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80',
      status: 'online'
    },
    timestamp: '2025-03-28T09:10:00',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=300&fit=crop',
        name: 'welcome.jpg',
        size: 1024 * 1024 // 1MB
      }
    ]
  },
  {
    id: '4',
    content: 'Merhaba! Ben de yeni katıldım. Burada olmak harika!',
    author: {
      id: '3',
      name: 'Mehmet',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80',
      status: 'online'
    },
    timestamp: '2025-03-28T09:10:00',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=300&fit=crop',
        name: 'welcome.jpg',
        size: 1024 * 1024 // 1MB
      }
    ]
  },
  {
    id: '5',
    content: 'Merhaba! Ben de yeni katıldım. Burada olmak harika!',
    author: {
      id: '3',
      name: 'Mehmet',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80',
      status: 'online'
    },
    timestamp: '2025-03-28T09:10:00',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=300&fit=crop',
        name: 'welcome.jpg',
        size: 1024 * 1024 // 1MB
      }
    ]
  },
  {
    id: '6',
    content: 'Merhaba! Ben de yeni katıldım. Burada olmak harika!',
    author: {
      id: '3',
      name: 'Mehmet',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80',
      status: 'online'
    },
    timestamp: '2025-03-28T09:10:00',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=300&fit=crop',
        name: 'welcome.jpg',
        size: 1024 * 1024 // 1MB
      }
    ]
  },
  {
    id: '7',
    content: 'Merhaba! Ben de yeni katıldım. Burada olmak harika!',
    author: {
      id: '3',
      name: 'Mehmet',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80',
      status: 'online'
    },
    timestamp: '2025-03-28T09:10:00',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=300&fit=crop',
        name: 'welcome.jpg',
        size: 1024 * 1024 // 1MB
      }
    ]
  },
  {
    id: '8',
    content: 'Merhaba! Ben de yeni katıldım. Burada olmak harika!',
    author: {
      id: '3',
      name: 'Mehmet',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80',
      status: 'online'
    },
    timestamp: '2025-03-28T09:10:00',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=300&fit=crop',
        name: 'welcome.jpg',
        size: 1024 * 1024 // 1MB
      }
    ]
  }
];

export default function TextChannel({ channelId, channelName, topic }: TextChannelProps) {
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      author: {
        id: '1',
        name: 'Deniz',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
        role: 'Admin',
        status: 'online'
      },
      timestamp: new Date().toTimeString()
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Dosya yükleme simülasyonu
    const file = files[0];
    const newMessage: Message = {
      id: Date.now().toString(),
      content: '',
      author: {
        id: '1',
        name: 'Deniz',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
        role: 'Admin',
        status: 'online'
      },
      timestamp: new Date().toISOString(),
      attachments: [
        {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        }
      ]
    };

    setMessages([...messages, newMessage]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Kanal Başlığı - Sabit */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[var(--surface)] select-none sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-[var(--text-secondary)]" />
          <div>
            <h1 className="text-[var(--text-primary)] font-semibold">{channelName}</h1>
            {topic && (
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block">{topic}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-2">
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <Bell size={18} />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <Pin size={18} />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <Users size={18} />
          </button>
          <div className="h-5 w-[1px] bg-white/5 mx-0.5 sm:mx-1 hidden sm:block" />
          <div className="relative hidden sm:block">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--card)] text-[var(--text-secondary)]">
              <Search size={16} />
              <input
                type="text"
                placeholder="Ara"
                className="w-32 bg-transparent border-none outline-none text-sm"
              />
            </div>
          </div>
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <Search size={18} className="block sm:hidden" />
            <Inbox size={18} className="hidden sm:block" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      {/* Mesaj Listesi - Kaydırılabilir Alan */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex gap-2 sm:gap-4 hover:bg-white/5 p-2 rounded-lg -mx-2"
          >
            <div className="flex-shrink-0">
              <Image
                src={message.author.avatar}
                alt={message.author.name}
                width={32}
                height={32}
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="font-medium text-sm sm:text-base text-[var(--text-primary)]">
                  {message.author.name}
                </span>
                {message.author.role && (
                  <span className="px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs bg-[var(--primary)] text-white">
                    {message.author.role}
                  </span>
                )}
                <span className="text-xs text-[var(--text-secondary)]">
                  {new Intl.DateTimeFormat('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }).format(new Date(message.timestamp))}
                </span>
                {message.pinned && (
                  <Pin size={12} className="text-[var(--text-secondary)]" />
                )}
              </div>
              {message.content && (
                <p className="text-sm sm:text-base text-[var(--text-primary)] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-1 sm:mt-2 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {attachment.type === 'image' ? (
                        <Image
                          src={attachment.url}
                          alt={attachment.name}
                          width={500}
                          height={300}
                          className="max-w-full sm:max-w-[500px] rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 sm:p-3 bg-[var(--card)] rounded-lg">
                          <Paperclip className="text-[var(--text-secondary)]" />
                          <span className="text-sm sm:text-base text-[var(--text-primary)] truncate">{attachment.name}</span>
                          <span className="text-[10px] sm:text-xs text-[var(--text-secondary)]">
                            {Math.round(attachment.size! / 1024)}KB
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.reactions.map((reaction, index) => (
                    <button
                      key={index}
                      className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs sm:text-sm ${
                        reaction.reacted
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                      }`}
                    >
                      <span>{reaction.emoji}</span>
                      <span>{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-start gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded hover:bg-white/5 text-[var(--text-secondary)]" title="Yanıtla">
                <Reply size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button className="p-1 rounded hover:bg-white/5 text-[var(--text-secondary)]" title="Düzenle">
                <Edit size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button className="p-1 rounded hover:bg-white/5 text-[var(--text-secondary)]" title="Daha Fazla">
                <MoreVertical size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Giriş Alanı - Sabit */}
      <div className="p-2 sm:p-4 bg-[var(--surface)] sticky bottom-0 z-10">
        <div className="flex items-center gap-1 sm:gap-2 bg-[var(--card)] rounded-lg p-1.5 sm:p-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]"
          >
            <Paperclip size={18} className="sm:w-5 sm:h-5" />
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`#${channelName} kanalına mesaj gönder`}
            className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
          />
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
              <AtSign size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
              <Smile size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)] hidden sm:block">
              <Gift size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--primary)] disabled:opacity-50"
            >
              <Send size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
