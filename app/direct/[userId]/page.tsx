'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Message, Reaction } from '@/app/types/channel';
import { Hash, AtSign, Smile, Paperclip, Gift, Send, Pin, Reply, Edit, MoreVertical, Search, Bell, Inbox, HelpCircle, Users, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import DirectLayout from '@/app/components/layout/DirectLayout';
import { useWebSocket } from '@/lib/websocket';
import { useParams, useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { getUserProfile } from '@/app/lib/api';
import CryptoJS from 'crypto-js';
import { MessageSecurity } from '@/app/lib/security/MessageSecurity';
import EmojiPicker from '@/app/components/EmojiPicker';
import GifPicker from '@/app/components/GifPicker';
import { loadEmojis, EmojiCategory, Emoji } from '@/app/lib/api/emojis';
import { processMessageEmojis } from '@/app/lib/utils/emojiUtils';

// Emoji kodunu HTML'e dönüştür
const emojiCodeToHtml = (emojiCode: string, emojis: EmojiCategory[]): string => {
  // Emoji kodunu ayrıştır
  const match = emojiCode.match(/<:([^:]+):([^>]+)>/);
  if (!match) return emojiCode;
  
  const name = match[1];
  const id = match[2];
  
  // Tüm emojileri düzleştir
  const allEmojis = emojis.flatMap(category => category.emojis);
  
  // Emojiyi bul
  const emoji = allEmojis.find(e => e.id === id && e.name === name);
  
  if (emoji) {
    return `<img src="${emoji.url}" alt="${emoji.name}" class="inline-block w-5 h-5 align-middle" title="${emoji.name}" />`;
  }
  
  return emojiCode; // Emoji bulunamazsa orijinal kodu döndür
};

// Şifreleme sabitleri
const ENCRYPTION_PREFIX = 'RING_';
const ENCRYPTION_SUFFIX = '_APP';

// Şifreleme fonksiyonu
const encryptMessage = (message: string, userId: string): string => {
  const key = ENCRYPTION_PREFIX + CryptoJS.MD5(userId).toString() + ENCRYPTION_SUFFIX;
  return CryptoJS.AES.encrypt(message, key).toString();
};

// Çözme fonksiyonu
const decryptMessage = (encryptedMessage: string, userId: string): string => {
  const key = ENCRYPTION_PREFIX + CryptoJS.MD5(userId).toString() + ENCRYPTION_SUFFIX;
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

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
  const router = useRouter();
  const userId = params.userId as string;
  const currentUserId = getCookie('user_id') as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [mentioningUser, setMentioningUser] = useState<boolean>(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [emojiCategories, setEmojiCategories] = useState<EmojiCategory[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  
  // WebSocket bağlantısı
  const { connect, disconnect, sendDirectMessage, messages: wsMessages, isConnected } = useWebSocket();
  
  // Mesaj formatlama fonksiyonu
  const formatMessage = useCallback((content: string) => {
    // Emojileri işle
    content = processMessageEmojis(content, emojiCategories);
    
    // Kalın metin
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong className="font-bold">$1</strong>');
    
    // Alıntı
    content = content.replace(/^>(.*?)$/gm, '<blockquote className="border-l-4 border-[var(--primary)] pl-4 py-2 my-2 bg-[var(--card)] rounded-r-lg shadow-sm">$1</blockquote>');
    
    // Kod bloğu
    content = content.replace(/```([\s\S]*?)```/g, '<pre className="bg-[var(--card)] p-4 rounded-lg my-2 overflow-x-auto border border-[var(--border)]"><code className="text-sm font-mono text-[var(--text-primary)]">$1</code></pre>');
    
    // İtalik
    content = content.replace(/\_(.*?)\_/g, '<em className="italic">$1</em>');
    
    return content;
  }, [emojiCategories]);
  
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

  // Kullanıcı kendisiyle mesajlaşmaya çalışıyorsa ana sayfaya yönlendir
  useEffect(() => {
    if (userId === currentUserId) {
      router.push('/');
    }
  }, [userId, currentUserId, router]);

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

  // Ses dosyasını yükle ve kullanıcı etkileşimi için hazırla
  useEffect(() => {
    notificationSound.current = new Audio('/blink.mp3');
    notificationSound.current.load();

    // Kullanıcı etkileşimi için bir buton ekle
    const handleUserInteraction = () => {
      setIsSoundEnabled(true);
      // Kullanıcı etkileşiminden sonra event listener'ı kaldır
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Ses çalma fonksiyonu
  const playNotificationSound = async () => {
    if (!isSoundEnabled || !notificationSound.current) return;

    try {
      // Ses dosyasını sıfırla ve tekrar yükle
      notificationSound.current.currentTime = 0;
      await notificationSound.current.play();
      console.log('Bildirim sesi çalıyor');
    } catch (error) {
      console.error('Ses çalma hatası:', error);
      // Hata durumunda sesi tekrar yükle
      notificationSound.current.load();
    }
  };

  // Bildirim göster
  const showNotification = (title: string, body: string) => {
    if (!isNotificationEnabled) return;

    // Eğer sayfa görünür durumdaysa bildirim gösterme
    if (document.visibilityState === 'visible') return;

    const notification = new Notification(title, {
      body: body,
      icon: '/logo/logo.png',
      badge: '/logo/logo.png',
      tag: 'new-message',
      requireInteraction: true, // Kullanıcı etkileşimi gerektir
      silent: false, // Varsayılan sesi kullan
      data: {
        url: window.location.href, // Bildirime tıklandığında açılacak URL
        timestamp: new Date().toISOString()
      }
    });

    // Bildirime tıklandığında sayfaya yönlendir
    notification.onclick = () => {
      window.focus();
      window.location.href = notification.data.url;
    };
  };

  // Bildirim izni iste
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setIsNotificationEnabled(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setIsNotificationEnabled(permission === 'granted');
        });
      }
    }
  }, []);

  // WebSocket mesajlarını dinle
  useEffect(() => {
    if (wsMessages.length > 0) {
      const lastMessage = wsMessages[wsMessages.length - 1];
      
      // Mesajın sadece bu iki kullanıcı arasında olduğunu kontrol et
      const isValidMessage = (
        (lastMessage.user_id === currentUserId && lastMessage.recipient_id === userId) ||
        (lastMessage.user_id === userId && lastMessage.recipient_id === currentUserId)
      );
      
      if (isValidMessage) {
        try {
          // Mesaj içeriğini parse et
          let parsedContent;
          if (lastMessage.content.startsWith('dm:')) {
            const jsonContent = lastMessage.content.substring(3);
            parsedContent = JSON.parse(jsonContent);
          }

          // Reaksiyon mesajlarını işle
          if (parsedContent?.type === 'reaction') {
            const reactionData = JSON.parse(MessageSecurity.decryptMessage(
              parsedContent.content,
              currentUserId
            ) || '{}');
            
            if (reactionData.type === 'reaction') {
              setMessages(prevMessages => {
                return prevMessages.map(message => {
                  if (message.id === reactionData.message_id) {
                    const reactions = message.reactions || [];
                    const existingReaction = reactions.find(r => r.emoji === reactionData.emoji);
                    
                    if (reactionData.action === 'add') {
                      if (existingReaction) {
                        if (!existingReaction.users.includes(reactionData.user_id)) {
                          return {
                            ...message,
                            reactions: reactions.map(r => 
                              r.emoji === reactionData.emoji 
                                ? { ...r, count: r.count + 1, users: [...r.users, reactionData.user_id] } 
                                : r
                            )
                          };
                        }
                      } else {
                        return {
                          ...message,
                          reactions: [
                            ...reactions,
                            { emoji: reactionData.emoji, count: 1, users: [reactionData.user_id] }
                          ]
                        };
                      }
                    } else if (reactionData.action === 'remove') {
                      if (existingReaction) {
                        const updatedUsers = existingReaction.users.filter(id => id !== reactionData.user_id);
                        
                        if (updatedUsers.length === 0) {
                          return {
                            ...message,
                            reactions: reactions.filter(r => r.emoji !== reactionData.emoji)
                          };
                        } else {
                          return {
                            ...message,
                            reactions: reactions.map(r => 
                              r.emoji === reactionData.emoji 
                                ? { ...r, count: updatedUsers.length, users: updatedUsers } 
                                : r
                            )
                          };
                        }
                      }
                    }
                  }
                  return message;
                });
              });
            }
            return; // Reaksiyon mesajlarını normal mesaj olarak işleme
          }
          
          // GIF mesajlarını işle
          if (parsedContent?.type === 'gif') {
            const gifData = JSON.parse(MessageSecurity.decryptMessage(
              parsedContent.content,
              currentUserId
            ) || '{}');
            
            if (gifData.type === 'gif') {
              const formattedMessage: Message = {
                id: Date.now().toString(),
                content: '',
                type: 'gif',
                gifUrl: gifData.content,
                gifTitle: gifData.alt,
                author: {
                  id: lastMessage.user_id,
                  name: lastMessage.username,
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
                  status: 'online'
                },
                timestamp: new Date().toISOString()
              };
              
              setMessages(prev => [...prev, formattedMessage]);
              
              // Sadece alıcı için ses çal ve bildirim göster
              if (lastMessage.recipient_id === currentUserId) {
                playNotificationSound();
                showNotification(
                  lastMessage.username,
                  'GIF gönderdi'
                );
              }
              return;
            }
          }
          
          // Normal mesajları işle
          if (!parsedContent?.type || parsedContent.type === 'DirectMessage') {
            let messageContent = lastMessage.content;
            let replyTo = null;
            let mentions: string[] = [];
            
            if (lastMessage.content.startsWith('dm:')) {
              // Mesajı çöz
              messageContent = MessageSecurity.decryptMessage(
                parsedContent.content,
                currentUserId
              ) || 'Mesaj çözülemedi';
              
              // Yanıtlanan mesajı çöz
              if (parsedContent.reply_to) {
                const decryptedReply = MessageSecurity.decryptMessage(
                  parsedContent.reply_to.content,
                  currentUserId
                );
                
                if (decryptedReply) {
                  replyTo = {
                    ...parsedContent.reply_to,
                    content: decryptedReply
                  };
                }
              }
              
              mentions = parsedContent.mentions || [];
            }
            
            const formattedMessage: Message = {
              id: Date.now().toString(),
              content: messageContent,
              author: {
                id: lastMessage.user_id,
                name: lastMessage.username,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
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
            
            // Sadece alıcı için ses çal ve bildirim göster
            if (lastMessage.recipient_id === currentUserId) {
              playNotificationSound();
              showNotification(
                lastMessage.username,
                messageContent.length > 50 
                  ? messageContent.substring(0, 50) + '...' 
                  : messageContent
              );
            }
          }
        } catch (error) {
          console.error('Mesaj parse edilemedi:', error);
        }
      }
    }
  }, [wsMessages, userId, currentUserId, isSoundEnabled, isNotificationEnabled]);

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
      
      // Mesajı şifrele
      const encryptedContent = MessageSecurity.encryptMessage(
        messageInput,
        currentUserId,
        recipientId
      );
      
      const messageData = {
        recipient_id: recipientId,
        content: encryptedContent,
        reply_to: replyingTo ? {
          message_id: replyingTo.id,
          content: MessageSecurity.encryptMessage(
            replyingTo.content,
            currentUserId,
            recipientId
          ),
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

  // Emoji verilerini yükle
  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const emojis = await loadEmojis();
        setEmojiCategories(emojis);
      } catch (error) {
        console.error('Emoji verileri yüklenirken hata oluştu:', error);
      }
    };
    
    fetchEmojis();
  }, []);
  
  // Emoji seçildiğinde
  const handleEmojiSelect = (emojiCode: string) => {
    setMessageInput(prev => prev + emojiCode);
    setShowEmojiPicker(false);
  };

  // Reaksiyon ekleme fonksiyonu
  const handleAddReaction = async (messageId: string, emoji: string) => {
    setMessages(prevMessages => {
      return prevMessages.map(message => {
        if (message.id === messageId) {
          // Check if user already reacted with this emoji
          const existingReaction = message.reactions?.find(r => r.emoji === emoji);
          
          let updatedReactions: Reaction[] = [...(message.reactions || [])];
          
          if (existingReaction) {
            // If user already reacted, remove their reaction
            updatedReactions = updatedReactions.filter(r => r.emoji !== emoji);
          } else {
            // Add new reaction
            updatedReactions.push({
              emoji,
              userId: currentUserId,
              timestamp: new Date().toISOString()
            });
          }
          
          // Send reaction via WebSocket
          const reactionData = {
            messageId,
            emoji,
            action: existingReaction ? 'remove' : 'add',
            userId: currentUserId,
            timestamp: new Date().toISOString()
          };
          
          sendDirectMessage(userId, `dm:${JSON.stringify({
            type: 'reaction',
            content: MessageSecurity.encryptMessage(
              JSON.stringify(reactionData),
              currentUserId,
              userId
            )
          })}`);
          
          return { ...message, reactions: updatedReactions };
        }
        return message;
      });
    });
  };
  
  // Reaksiyon seçici bileşeni
  const ReactionPicker = ({ messageId, onClose }: { messageId: string, onClose: () => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
    const pickerRef = useRef<HTMLDivElement>(null);
    
    // Emoji verilerini yükle
    useEffect(() => {
      const fetchEmojis = async () => {
        try {
          const categories = await loadEmojis();
          const allEmojis: Emoji[] = [];
          
          // Tüm kategorilerdeki emojileri birleştir
          categories.forEach(category => {
            allEmojis.push(...category.emojis);
          });
          
          // Duplicate emojileri filtrele
          const uniqueEmojis = allEmojis.filter((emoji, index, self) => 
            index === self.findIndex(e => e.id === emoji.id && e.name === emoji.name)
          );
          
          setFilteredEmojis(uniqueEmojis);
        } catch (error) {
          console.error('Emoji verileri yüklenirken hata oluştu:', error);
        }
      };
      
      fetchEmojis();
    }, []);
    
    // Arama terimine göre emojileri filtrele
    useEffect(() => {
      const filterEmojis = async () => {
        try {
          const categories = await loadEmojis();
          const allEmojis: Emoji[] = [];
          
          // Tüm kategorilerdeki emojileri birleştir
          categories.forEach(category => {
            allEmojis.push(...category.emojis);
          });
          
          // Duplicate emojileri filtrele
          const uniqueEmojis = allEmojis.filter((emoji, index, self) => 
            index === self.findIndex(e => e.id === emoji.id && e.name === emoji.name)
          );
          
          if (searchTerm.trim() === '') {
            setFilteredEmojis(uniqueEmojis);
          } else {
            const filtered = uniqueEmojis.filter(emoji => 
              emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEmojis(filtered);
          }
        } catch (error) {
          console.error('Emoji verileri yüklenirken hata oluştu:', error);
        }
      };
      
      filterEmojis();
    }, [searchTerm]);
    
    // Dışarı tıklandığında kapat
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClose]);
    
    return (
      <div 
        ref={pickerRef}
        className="absolute bottom-full mb-2 right-0 w-64 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] z-50"
      >
        <div className="p-2 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Reaksiyon Ekle</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded"
          >
            <X size={14} className="text-[var(--text-secondary)]" />
          </button>
        </div>
        
        <div className="p-2">
          <input
            type="text"
            placeholder="Emoji ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        
        <div className="p-2 grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji.name}-${emoji.id}-${index}`}
              onClick={() => handleAddReaction(messageId, `<:${emoji.name}:${emoji.id}>`)}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded"
              title={emoji.name}
            >
              <img 
                src={emoji.url} 
                alt={emoji.name} 
                className="w-6 h-6 object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // GIF seçildiğinde çalışacak fonksiyon
  const handleGifSelect = (gif: { url: string, title: string }) => {
    // GIF mesajını hazırla
    const gifMessage = {
      type: 'gif',
      content: gif.url,
      alt: gif.title
    };

    // Şifrelenmiş mesajı gönder
    if (isConnected) {
      sendDirectMessage(userId, `dm:${JSON.stringify({
        type: 'gif',
        content: MessageSecurity.encryptMessage(
          JSON.stringify(gifMessage),
          currentUserId,
          userId
        )
      })}`);
    }

    setShowGifPicker(false);
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
                            
                            {/* GIF mesajlarını göster */}
                            {message.type === 'gif' && message.gifUrl ? (
                              <div className="relative max-w-[300px] aspect-video bg-[var(--card)] rounded-lg overflow-hidden">
                                <img 
                                  src={message.gifUrl} 
                                  alt={message.gifTitle || 'GIF'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <p 
                                className="text-sm sm:text-base text-[var(--text-primary)] whitespace-pre-wrap break-words [&_strong]:font-bold [&_em]:italic [&_del]:line-through [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--primary)] [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-2 [&_blockquote]:bg-[var(--card)] [&_blockquote]:rounded-r-lg [&_blockquote]:shadow-sm [&_pre]:bg-[var(--card)] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-[var(--border)] [&_code]:text-sm [&_code]:font-mono [&_code]:text-[var(--text-primary)] [&_img]:inline-block [&_img]:w-5 [&_img]:h-5 [&_img]:align-middle"
                                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                              />
                            )}
                            
                            {/* Reaksiyonlar */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {message.reactions.map((reaction) => {
                                  const hasReacted = reaction.users.includes(currentUserId);
                                  const emojiHtml = emojiCodeToHtml(reaction.emoji, emojiCategories);
                                  
                                  return (
                                    <button
                                      key={reaction.emoji}
                                      onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                                        hasReacted 
                                          ? 'bg-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/30' 
                                          : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                                      }`}
                                    >
                                      <span dangerouslySetInnerHTML={{ __html: emojiHtml }} className="w-4 h-4 flex items-center justify-center" />
                                      <span className="font-medium">{reaction.count}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                        <div className="flex items-start gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleReply(message)}
                                className="p-1 rounded hover:bg-white/5 text-[var(--text-secondary)]" 
                                title="Yanıtla"
                            >
                                <Reply size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            
                            {/* Reaksiyon Ekleme Butonu */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                                    className="p-1 rounded hover:bg-white/5 text-[var(--text-secondary)]" 
                                    title="Reaksiyon Ekle"
                                >
                                    <Smile size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                {showReactionPicker === message.id && (
                                    <ReactionPicker 
                                        messageId={message.id} 
                                        onClose={() => setShowReactionPicker(null)} 
                                    />
                                )}
                            </div>
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
                <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder={`Mesajınızı yazın...`}
                    className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none min-h-[40px] max-h-[200px] py-2"
                    rows={1}
                />
                <div className="flex items-center gap-0.5 sm:gap-1">
                    <button 
                        onClick={handleMention}
                        className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]"
                    >
                        <AtSign size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]"
                        >
                            <Smile size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        {showEmojiPicker && (
                            <EmojiPicker 
                                onEmojiSelect={handleEmojiSelect} 
                                onClose={() => setShowEmojiPicker(false)} 
                            />
                        )}
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setShowGifPicker(!showGifPicker)}
                            className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]"
                        >
                            <Gift size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        {showGifPicker && (
                            <GifPicker 
                                onSelect={handleGifSelect}
                                onClose={() => setShowGifPicker(false)}
                            />
                        )}
                    </div>
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
