'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '@/app/types/channel';
import { Hash, AtSign, Smile, Paperclip, Gift, Send, Pin, Reply, Edit, MoreVertical, Search, Bell, Inbox, HelpCircle, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import DirectLayout from '@/app/components/layout/DirectLayout';
import { useWebSocket } from '@/lib/websocket';
import { useParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { getUserProfile } from '@/app/lib/api';

// Örnek mesajlar
const SAMPLE_MESSAGES: Message[] = [
  /* {
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
  } */
];

export default function DirectMessagePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [mentioningUser, setMentioningUser] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // WebSocket bağlantısı
  const { connect, disconnect, sendDirectMessage, messages: wsMessages, isConnected } = useWebSocket();
  
  // Kullanıcı bilgilerini al
  const currentUserId = getCookie('user_id') as string;

  // Kullanıcı profilini al
  useEffect(() => {
    const token = getCookie('access_token');
    if (!token || typeof token !== 'string') return;

    getUserProfile(token)
      .then((profile) => {
        setCurrentUsername(profile.username);
      })
      .catch((err) => {
        console.error('Profil çekilemedi:', err);
      });
  }, []);

  // WebSocket bağlantısını kur
  useEffect(() => {
    if (currentUserId && !isConnected && currentUsername) {
      console.log('WebSocket bağlantısı kuruluyor...');
      connect(currentUserId, currentUsername);
    }
    
    return () => {
      // Sadece sayfa tamamen kapatıldığında bağlantıyı kes
      // disconnect();
    };
  }, [currentUserId, connect, isConnected, currentUsername]);

  // WebSocket mesajlarını dinle
  useEffect(() => {
    if (wsMessages.length > 0) {
        const lastMessage = wsMessages[wsMessages.length - 1];
        
        // Sadece bu kullanıcı ile ilgili mesajları göster
        if (lastMessage.message_type === 'DirectMessage' && 
            (lastMessage.user_id === userId || lastMessage.recipient_id === userId)) {
            
            try {
                // Eğer content bir JSON string ise, onu parse et
                let messageContent = lastMessage.content;
                let replyTo = null;
                let mentions: string[] = [];
                
                if (lastMessage.content.startsWith('dm:')) {
                    const jsonContent = lastMessage.content.substring(3);
                    const parsedContent = JSON.parse(jsonContent);
                    messageContent = parsedContent.content;
                    replyTo = parsedContent.reply_to;
                    mentions = parsedContent.mentions || [];
                }
                
                // Mesajı uygun formata dönüştür
                const formattedMessage: Message = {
                    id: Date.now().toString(),
                    content: messageContent,
                    author: {
                        id: lastMessage.user_id,
                        name: lastMessage.username,
                        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80', // Varsayılan avatar
                        status: 'online'
                    },
                    timestamp: new Date().toISOString(),
                    replyTo: replyTo ? {
                        id: replyTo.message_id,
                        content: replyTo.content,
                        author: {
                            id: replyTo.author.id,
                            name: replyTo.author.name,
                            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
                            status: 'online'
                        }
                    } : undefined,
                    mentions: mentions.length > 0 ? mentions : undefined
                };
                
                setMessages(prev => [...prev, formattedMessage]);
            } catch (error) {
                console.error('Mesaj parse edilemedi:', error);
            }
        }
    }
  }, [wsMessages, userId]);

  // Sayfa yüklendiğinde örnek mesajları göster
  useEffect(() => {
    setMessages(SAMPLE_MESSAGES);
  }, []);

  // Mesajlar güncellendiğinde en alta kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && isConnected) {
        const recipientId = params.userId as string;
        const messageData = {
            recipient_id: recipientId,
            content: messageInput,
            reply_to: replyingTo ? {
                message_id: replyingTo.id,
                content: replyingTo.content,
                author: {
                    id: replyingTo.author.id,
                    name: replyingTo.author.name
                }
            } : null,
            mentions: []
        };

        sendDirectMessage(recipientId, `dm:${JSON.stringify(messageData)}`);
        setMessageInput('');
        setReplyingTo(null);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handleMention = () => {
    setMentioningUser(true);
    setMessageInput(messageInput + `@${userId} `);
    inputRef.current?.focus();
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
        id: currentUserId,
        name: currentUsername,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80', // Varsayılan avatar
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

    setMessages(prev => [...prev, newMessage]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <DirectLayout>
      <div className="flex flex-col h-full">
        {/* Kanal Başlığı - Sabit */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[var(--surface)] select-none sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-[var(--text-secondary)]" />
            <div>
              <h1 className="text-[var(--text-primary)] font-semibold">Özel Mesaj: {userId}</h1>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-2">
            <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
              <Pin size={18} />
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
          </div>
        </div>

        {/* Mesaj Listesi */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
            {messages.map((message, index) => {
                const isSameUser = index > 0 && messages[index - 1].author.id === message.author.id;
                const isRepliedTo = messages.some(m => m.replyTo?.id === message.id);
                
                return (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: isSameUser ? 1 : 16 }}
                        className={`group flex gap-2 sm:gap-4 hover:bg-white/5 p-2 rounded-lg -mx-2`}
                    >
                        {!isSameUser && (
                            <div className="flex-shrink-0">
                                <Image
                                    src={message.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
                                    alt={message.author.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
                                />
                            </div>
                        )}
                        <div className={`flex-1 min-w-0 ${isSameUser ? 'ml-12 sm:ml-14' : ''}`}>
                            {!isSameUser && (
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                    <span className="font-medium text-sm sm:text-base text-[var(--text-primary)]">
                                        {message.author.name}
                                    </span>
                                    <span className="text-xs text-[var(--text-secondary)]">
                                        {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                            {message.replyTo && (
                                <div className="mb-2 text-xs bg-white/5 p-2 rounded-lg border-l-2 border-[var(--primary)]">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Reply size={12} className="text-[var(--text-secondary)]" />
                                        <span className="font-medium text-[var(--text-primary)]">
                                            {message.replyTo.author.name}
                                        </span>
                                    </div>
                                    <p className="text-[var(--text-secondary)] line-clamp-2">{message.replyTo.content}</p>
                                </div>
                            )}
                            <p className="text-sm sm:text-base text-[var(--text-primary)] whitespace-pre-wrap break-words">
                                {message.content}
                            </p>
                        </div>
                        <div className="flex items-start gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleReply(message)}
                                className="p-1 rounded hover:bg-white/5 text-[var(--text-secondary)]" 
                                title="Yanıtla"
                            >
                                <Reply size={14} className="sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Mesaj Giriş Alanı - Sabit */}
        <div className="p-2 sm:p-4 bg-[var(--surface)] sticky bottom-0 z-10">
            {replyingTo && (
                <div className="mb-2 flex items-center justify-between bg-[var(--card)] p-2 rounded-lg border-l-2 border-[var(--primary)]">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Reply size={14} className="text-[var(--text-secondary)]" />
                            <span className="text-sm text-[var(--text-secondary)]">
                                {replyingTo.author.name} yanıtlanıyor
                            </span>
                        </div>
                        <p className="text-sm text-[var(--text-primary)] ml-6 line-clamp-2">
                            {replyingTo.content}
                        </p>
                    </div>
                    <button 
                        onClick={() => setReplyingTo(null)}
                        className="p-1 hover:bg-white/5 rounded"
                    >
                        <X size={14} className="text-[var(--text-secondary)]" />
                    </button>
                </div>
            )}
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
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`${userId} kullanıcısına mesaj gönder`}
                    className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                />
                <div className="flex items-center gap-0.5 sm:gap-1">
                    <button 
                        onClick={handleMention}
                        className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]"
                    >
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
    </DirectLayout>
  );
}
