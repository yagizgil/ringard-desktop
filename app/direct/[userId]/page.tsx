'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Message as ChannelMessage, Reaction } from '@/app/types/channel';
import { Hash, AtSign, Smile, Paperclip, Gift, Send, Pin, Reply, Edit, MoreVertical, Search, Bell, Inbox, HelpCircle, Users, X, Plus, Eye, EyeOff, UserPlus, Flag, User } from 'lucide-react';
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

interface Message extends ChannelMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
    status: 'online' | 'idle' | 'dnd' | 'offline';
  };
  timestamp: string;
  reactions: Reaction[];
  attachments: any[];
  embeds: any[];
  gifUrl?: string;
  gifTitle?: string;
  type?: 'text' | 'gif';
}

interface ApiMessage {
  id: string;
  content: string;
  conversation_id: string;
  created_at: string;
  edited_at: string | null;
  sender_id: string;
  reactions: any[];
  attachments: any[];
  embeds: any[];
  read_status: any[];
}

export default function DirectMessagePage() {
  const params = useParams() as { userId: string };
  const routeUserId = params.userId;
  const router = useRouter();
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [hiddenMessages, setHiddenMessages] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageViewMode, setMessageViewMode] = useState<'discord' | 'whatsapp' | 'bubbles' | 'modern'>('discord');
  const [messageFontSize, setMessageFontSize] = useState<number>(16);
  const [showFontSizeSlider, setShowFontSizeSlider] = useState<boolean>(false);
  
  // WebSocket bağlantısı
  const { connect, disconnect, sendDirectMessage, messages: wsMessages, isConnected } = useWebSocket();
  
  // Emoji map'i oluştur
  const emojiMap = {
    smile: '/emojis/smile.png',
    angelsmile: '/emojis/angel_smile.png',
    cyanstar: '/emojis/cyan_star.gif',
    wink: '/emojis/wink.png',
    heart: '/emojis/heart.png',
    thumbsup: '/emojis/thumbsup.png',
    thumbsdown: '/emojis/thumbsdown.png',
    ok: '/emojis/ok.png',
    pray: '/emojis/pray.png',
    dog: '/emojis/dog.png',
    cat: '/emojis/cat.png',
    rabbit: '/emojis/rabbit.png',
    fox: '/emojis/fox.png',
  };

  // Mesajdaki emojileri işle
  const processEmojis = (text: string) => {
    // Emoji formatı: <:emojiname:emojiname>
    const emojiRegex = /<:(\w+):\w+>/g;
    
    // Emojileri img elementleriyle değiştir
    return text.split(emojiRegex).map((part, index) => {
      // Eğer bu parça bir emoji adıysa
      if (emojiMap[part as keyof typeof emojiMap]) {
        return (
          <img
            key={index}
            src={emojiMap[part as keyof typeof emojiMap]}
            alt={`:${part}:`}
            className="inline-block w-6 h-6 align-middle"
            loading="lazy"
          />
        );
      }
      // Normal metin ise
      return part;
    });
  };

  // Mesaj formatlama fonksiyonu
  const formatAndProcessText = (text: string) => {
    // Kalın metin
    const boldRegex = /\*\*(.*?)\*\*/g;
    // İtalik metin
    const italicRegex = /_(.*?)_/g;
    // Alıntı
    const quoteRegex = /^>(.*?)$/gm;
    // Kod bloğu
    const codeBlockRegex = /```([\s\S]*?)```/g;
    
    // Yeni satırları koruyarak metni formatlayıp döndür
    let formattedContent = text;
    
    // HTML entities dönüşümü
    formattedContent = formattedContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Kod bloklarını işle
    formattedContent = formattedContent.replace(codeBlockRegex, (match, codeContent) => {
      return `<pre class="bg-[var(--card)] p-3 rounded-lg my-2 overflow-x-auto border border-[var(--border)] text-sm font-mono"><code>${codeContent}</code></pre>`;
    });
    
    // Alıntıları işle
    formattedContent = formattedContent.replace(quoteRegex, (match, quoteContent) => {
      return `<blockquote class="border-l-4 border-[var(--primary)] pl-3 py-1 my-2 bg-[var(--card)]/50 rounded-r-lg">${quoteContent}</blockquote>`;
    });
    
    // Kalın metni işle
    formattedContent = formattedContent.replace(boldRegex, '<strong class="font-bold">$1</strong>');
    
    // İtalik metni işle
    formattedContent = formattedContent.replace(italicRegex, '<em class="italic">$1</em>');
    
    // Yeni satırları <br> etiketine dönüştür
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    // Emojileri işle
    formattedContent = processMessageEmojis(formattedContent, emojiCategories);
    
    return (
      <div 
        className="break-words whitespace-pre-wrap overflow-hidden"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

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
    if (routeUserId === currentUserId) {
      router.push('/');
    }
  }, [routeUserId, currentUserId, router]);

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
      console.log('Yeni WebSocket mesajı:', lastMessage);
      
      // Mesajın sadece bu iki kullanıcı arasında olduğunu kontrol et
      const isValidMessage = (
        (lastMessage.user_id === currentUserId && lastMessage.recipient_id === routeUserId) ||
        (lastMessage.user_id === routeUserId && lastMessage.recipient_id === currentUserId)
      );
      
      if (isValidMessage) {
        try {
          // Mesaj içeriğini parse et
          let messageContent = lastMessage.content;
          let replyData = null;
          
          if (typeof messageContent === 'string' && messageContent.startsWith('dm:')) {
            const dmData = JSON.parse(messageContent.substring(3));
            
            // Yanıt verisi varsa al
            if (dmData.replyTo) {
              replyData = dmData.replyTo;
            }
            
            // Şifrelenmiş içeriği parse et
            if (dmData.content && typeof dmData.content === 'string') {
              // JSON parse işlemini güvenli bir şekilde yap
              let wsEncryptedContent;
              try {
                wsEncryptedContent = JSON.parse(dmData.content);
              } catch (parseError) {
                console.log('JSON parse edilemedi, doğrudan kullanılıyor:', dmData.content);
                wsEncryptedContent = dmData.content;
              }
              
              // Gönderen veya alıcı için doğru userId'yi seç
              const isCurrentUserSender = lastMessage.user_id === currentUserId;
              const targetUserId = isCurrentUserSender ? currentUserId : routeUserId;
              
              // Şifreli mesajı çöz
              const decryptedContent = MessageSecurity.decryptMessage(wsEncryptedContent, targetUserId);
              
              // Özel GIF mesajı kontrolü
              if (dmData.type === 'gif') {
                messageContent = `dm:${JSON.stringify({
                  type: 'gif',
                  content: dmData.content
                })}`;
              } else {
                messageContent = decryptedContent || 'Mesaj çözülemedi';
              }
                
              if (!decryptedContent && dmData.type !== 'gif') {
                console.error('Mesaj çözülemedi:', {
                  content: dmData.content,
                  targetUserId,
                  isCurrentUserSender
                });
              }
            } else {
              messageContent = dmData.content || 'Mesaj içeriği bulunamadı';
            }
          }

          // Mesaj ID'si oluştur (sunucudan gelen ID veya tarih tabanlı bir ID)
          const messageId = lastMessage.id || `ws-${Date.now()}`;
          
          // Bu ID'ye sahip bir mesaj zaten varsa, tekrar ekleme
          const isMessageExists = messages.some(m => m.id === messageId);
          
          if (!isMessageExists) {
            // Yanıt verisi için ilgili mesajı bul
            let replyToMessage: Message | undefined;
            if (replyData) {
              replyToMessage = messages.find(m => m.id === replyData.id);
            }
            
            // Mesajı oluştur
            const newMessage: Message = {
              id: messageId,
              content: messageContent,
              author: {
                id: lastMessage.user_id,
                name: lastMessage.user_id === currentUserId ? currentUsername : 'Diğer Kullanıcı',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
                status: 'online'
              },
              timestamp: lastMessage.timestamp || new Date().toISOString(),
              reactions: [],
              attachments: [],
              embeds: [],
              replyTo: replyToMessage
            };

            // Mesajları güncelle
            setMessages(prev => [...prev, newMessage]);
            
            // Sadece alıcı için ses çal ve bildirim göster
            if (lastMessage.recipient_id === currentUserId) {
              playNotificationSound();
              showNotification(
                lastMessage.username || 'Yeni Mesaj',
                typeof messageContent === 'string' ? messageContent : 'Yeni mesaj'
              );
            }
          } else {
            console.log('Bu mesaj zaten mevcut, tekrar eklenmedi:', messageId);
          }
        } catch (error) {
          console.error('WebSocket mesajı işlenirken hata:', error);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsMessages]);

  // Mesaj gönderme fonksiyonu
  const sendMessage = async (content: string) => {
    try {
      // Mesaj ID'si oluştur
      const messageId = `local-${Date.now()}`;
      
      // Yanıt verisi
      const replyData = replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        author: {
          id: replyingTo.author.id,
          name: replyingTo.author.name
        }
      } : null;
      
      // Şifrelenmiş mesajı hazırla
      const encryptedContent = MessageSecurity.encryptMessage(content, currentUserId, routeUserId);
      const messageData = {
        recipientId: routeUserId,
        content: encryptedContent,
        replyTo: replyData,
        mentions: [],
        messageId: messageId
      };

      // WebSocket üzerinden şifreli mesajı gönder
      sendDirectMessage(routeUserId, `dm:${JSON.stringify(messageData)}`);

      // Bu ID'ye sahip bir mesaj zaten varsa, tekrar ekleme
      const isMessageExists = messages.some(m => m.id === messageId);
      
      if (!isMessageExists) {
        // UI'a ham mesajı ekle
        const newMessage: Message = {
          id: messageId,
          content: content, // Ham mesajı göster
          author: {
            id: currentUserId,
            name: currentUsername,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
            status: 'online'
          },
          timestamp: new Date().toISOString(),
          reactions: [],
          attachments: [],
          embeds: [],
          replyTo: replyingTo || undefined
        };

        setMessages(prev => [...prev, newMessage]);
      } else {
        console.log('Bu mesaj zaten gönderilmiş:', messageId);
      }
    } catch (error) {
      console.error('Mesaj gönderirken hata:', error);
      // toast.error('Mesaj gönderilemedi');
    }
  };

  // Mesajı gönder butonu/enter tuşu handler
  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      sendMessage(messageInput.trim());
      setMessageInput('');
      setReplyingTo(null);
    }
  };

  // Sayfa yüklendiğinde örnek mesajları göster
  useEffect(() => {
    setMessages([]);
  }, []);

  // Mesajlar güncellendiğinde en alta kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handleMention = () => {
    setMentioningUser(true);
    setMessageInput(messageInput + `@${routeUserId} `);
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
        id: currentUserId || '',
        name: currentUsername || '',
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
      ],
      reactions: [],
      embeds: []
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
      const updatedMessages = prevMessages.map(message => {
        if (message.id === messageId) {
          const reactions = message.reactions || [];
          const existingReaction = reactions.find(r => r.emoji === emoji);
          
          let updatedReactions: Reaction[];
          
          if (existingReaction) {
            // Kullanıcı zaten tepki vermişse, tepkiyi kaldır
            const filteredUsers = existingReaction.users.filter(id => id !== currentUserId);
            if (filteredUsers.length === 0) {
              updatedReactions = reactions.filter(r => r.emoji !== emoji);
            } else {
              updatedReactions = reactions.map(r => 
                r.emoji === emoji 
                  ? {
                      emoji: r.emoji,
                      count: filteredUsers.length,
                      users: filteredUsers,
                      userId: r.userId,
                      timestamp: r.timestamp
                    }
                  : r
              );
            }
          } else {
            // Yeni tepki ekle
            updatedReactions = [
              ...reactions,
              {
                emoji,
                count: 1,
                users: [currentUserId],
                userId: currentUserId,
                timestamp: new Date().toISOString()
              }
            ];
          }
          
          return { ...message, reactions: updatedReactions };
        }
        return message;
      });
      
      return updatedMessages;
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

    // Gif mesajını JSON olarak dönüştür
    const gifContent = JSON.stringify(gifMessage);
    
    // Şifrelenmiş mesajı gönder
    if (isConnected) {
      // Mesaj ID'si oluştur
      const messageId = `gif-${Date.now()}`;
      
      // Şifrelenmiş içeriği hazırla
      const encryptedContent = MessageSecurity.encryptMessage(gifContent, currentUserId, routeUserId);
      
      // Mesaj verisini hazırla
      const messageData = {
        recipientId: routeUserId,
        content: encryptedContent,
        type: 'gif',
        replyTo: replyingTo ? {
          id: replyingTo.id,
          content: replyingTo.content,
          author: {
            id: replyingTo.author.id,
            name: replyingTo.author.name
          }
        } : null,
        mentions: [],
        messageId: messageId
      };

      // WebSocket üzerinden şifreli mesajı gönder
      sendDirectMessage(routeUserId, `dm:${JSON.stringify(messageData)}`);
      
      // UI'a GIF mesajını ekle
      const newMessage: Message = {
        id: messageId,
        content: JSON.stringify(gifMessage),
        author: {
          id: currentUserId,
          name: currentUsername,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
          status: 'online'
        },
        timestamp: new Date().toISOString(),
        reactions: [],
        attachments: [],
        embeds: [],
        replyTo: replyingTo || undefined,
        type: 'gif',
        gifUrl: gif.url,
        gifTitle: gif.title
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Yanıtlama modunu kapat
      if (replyingTo) {
        setReplyingTo(null);
      }
    }

    setShowGifPicker(false);
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  };

  const handleMoreClick = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    setShowMoreMenu(showMoreMenu === messageId ? null : messageId);
  };

  const handleReport = (message: Message) => {
    setSelectedMessage(message);
    setShowReportModal(true);
    setContextMenu(null);
    setShowMoreMenu(null);
  };

  const handleHideMessage = (messageId: string) => {
    setHiddenMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
    setContextMenu(null);
    setShowMoreMenu(null);
  };

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
    setContextMenu(null);
    setShowMoreMenu(null);
  };

  const handleAddFriend = () => {
    // TODO: Implement add friend functionality
    setContextMenu(null);
    setShowMoreMenu(null);
  };

  const handleSubmitReport = () => {
    if (!selectedMessage || !reportReason) return;
    
    // TODO: Implement report submission
    console.log('Report submitted:', {
      messageId: selectedMessage.id,
      reason: reportReason,
      details: reportDetails
    });
    
    setShowReportModal(false);
    setSelectedMessage(null);
    setReportReason('');
    setReportDetails('');
  };

  // Mesaj içeriğini render etme fonksiyonu
  const renderMessageContent = (content: string) => {
    // GIF mesajı kontrolü
    if (content.startsWith('{"type":"gif"') || content.startsWith('dm:{"type":"gif"')) {
      try {
        // dm: ile başlıyorsa prefix'i kaldır
        const jsonContent = content.startsWith('dm:') ? content.substring(3) : content;
        const gifData = JSON.parse(jsonContent);
        
        if (gifData.type === 'gif' && gifData.content) {
          return (
            <div className="my-2 max-w-full">
              <img 
                src={gifData.content} 
                alt={gifData.alt || 'GIF'} 
                className="rounded-lg max-w-full h-auto"
                loading="lazy"
              />
            </div>
          );
        }
      } catch (error) {
        console.error('GIF mesajı parse edilemedi:', error);
      }
    }
    
    // Normal metin mesajı
    return formatAndProcessText(content);
  };

  // Report Modal Component
  const ReportModal = () => {
    if (!showReportModal || !selectedMessage) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[var(--surface)] rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Mesajı Raporla</h2>
          
          <div className="mb-4 p-4 bg-[var(--card)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={selectedMessage.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
                alt={selectedMessage.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-medium text-[var(--text-primary)]">
                {selectedMessage.author.name}
              </span>
            </div>
            <p className="text-[var(--text-primary)]">
              {selectedMessage.content}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Rapor Nedeni
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">Seçiniz</option>
              <option value="spam">Spam</option>
              <option value="harassment">Taciz</option>
              <option value="hate_speech">Nefret Söylemi</option>
              <option value="inappropriate">Uygunsuz İçerik</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Ek Bilgiler (Opsiyonel)
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              maxLength={200}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-primary)] resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Lütfen ek bilgiler ekleyin (maksimum 200 karakter)"
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onBlur={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div className="text-right text-xs text-[var(--text-secondary)]">
              {reportDetails.length}/200
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 rounded-lg bg-[var(--card)] text-[var(--text-primary)] hover:bg-white/5"
            >
              İptal
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={!reportReason}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white disabled:opacity-50"
            >
              Raporla
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Context Menu Component
  const ContextMenu = () => {
    if (!contextMenu) return null;

    return (
      <div 
        className="fixed z-50 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[200px] backdrop-blur-sm bg-opacity-95"
        style={{ 
          top: contextMenu.y, 
          left: contextMenu.x,
          transform: 'translateY(-100%)',
          marginTop: '-8px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => handleReply(contextMenu.message)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <Reply size={16} />
            Yanıtla
          </button>
          <button 
            onClick={() => setShowReactionPicker(contextMenu.message.id)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <Smile size={16} />
            Tepki Ekle
          </button>
          <button 
            onClick={() => handleViewProfile(contextMenu.message.author.name)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <User size={16} />
            Profili Gör
          </button>
          <button 
            onClick={handleAddFriend}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <UserPlus size={16} />
            Arkadaş Ekle
          </button>
          <button 
            onClick={() => handleReport(contextMenu.message)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <Flag size={16} />
            Raporla
          </button>
          <button 
            onClick={() => handleHideMessage(contextMenu.message.id)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            {hiddenMessages.includes(contextMenu.message.id) ? <Eye size={16} /> : <EyeOff size={16} />}
            {hiddenMessages.includes(contextMenu.message.id) ? 'Göster' : 'Gizle'}
          </button>
        </div>
      </div>
    );
  };

  // More Menu Component
  const MoreMenu = ({ messageId }: { messageId: string }) => {
    if (showMoreMenu !== messageId) return null;

    return (
      <div 
        className="absolute right-0 top-6 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[200px] backdrop-blur-sm bg-opacity-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => handleReply(messages.find(m => m.id === messageId)!)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <Reply size={16} />
            Yanıtla
          </button>
          <button 
            onClick={() => setShowReactionPicker(messageId)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <Smile size={16} />
            Tepki Ekle
          </button>
          <button 
            onClick={() => handleViewProfile(messages.find(m => m.id === messageId)!.author.name)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <User size={16} />
            Profili Gör
          </button>
          <button 
            onClick={handleAddFriend}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <UserPlus size={16} />
            Arkadaş Ekle
          </button>
          <button 
            onClick={() => handleReport(messages.find(m => m.id === messageId)!)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            <Flag size={16} />
            Raporla
          </button>
          <button 
            onClick={() => handleHideMessage(messageId)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors"
          >
            {hiddenMessages.includes(messageId) ? <Eye size={16} /> : <EyeOff size={16} />}
            {hiddenMessages.includes(messageId) ? 'Göster' : 'Gizle'}
          </button>
        </div>
      </div>
    );
  };

  // Geçmiş mesajları yükle
  useEffect(() => {
    const loadMessages = async () => {
      const token = getCookie('access_token');
      if (!token || typeof token !== 'string') return;

      try {
        // Önce konuşmayı kontrol et
        const checkResponse = await fetch(`https://api.ringard.net/p2p/private/${routeUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const checkData = await checkResponse.json();
        
        if (checkData.exists) {
          setConversationId(checkData.conversation_id);
          
          // Mesajları getir
          const messagesResponse = await fetch(`https://api.ringard.net/p2p/conversations/${checkData.conversation_id}/messages`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const messagesData = await messagesResponse.json();
          
          // Sadece ilk yüklemede, mevcut mesajları tamamen temizle ve yeni mesajları ekle
          // Bu sayede çift mesaj sorunu olmaz
          
          // API mesajlarını uygulama formatına dönüştür
          const formattedMessages = messagesData.messages.map((msg: ApiMessage) => {
            // Mesaj içeriğini parse et ve decrypt et
            let messageContent = msg.content;
            if (messageContent.startsWith('dm:')) {
              try {
                const dmData = JSON.parse(messageContent.substring(3));
                if (dmData.content && typeof dmData.content === 'string') {
                  // JSON parse işlemini güvenli bir şekilde yap
                  let msgEncryptedContent;
                  try {
                    msgEncryptedContent = JSON.parse(dmData.content);
                  } catch (parseError) {
                    console.log('JSON parse edilemedi, doğrudan kullanılıyor:', dmData.content);
                    msgEncryptedContent = dmData.content;
                  }
                  
                  // Gönderen veya alıcı şifrelemesini seç
                  const isCurrentUserSender = msg.sender_id === currentUserId;
                  const targetUserId = isCurrentUserSender ? currentUserId : routeUserId;
                  
                  // Şifreli mesajı çöz
                  const decryptedContent = MessageSecurity.decryptMessage(msgEncryptedContent, targetUserId);
                  console.log(decryptedContent);
                  messageContent = decryptedContent || 'Mesaj çözülemedi';
                  
                  if (!decryptedContent) {
                    console.error('Mesaj çözülemedi:', {
                      content: dmData.content,
                      targetUserId,
                      isCurrentUserSender
                    });
                  }
                }
              } catch (error) {
                console.error('Mesaj çözme hatası:', error);
                messageContent = 'Mesaj çözülemedi';
              }
            }

            return {
              id: msg.id,
              content: messageContent,
              author: {
                id: msg.sender_id,
                name: msg.sender_id === currentUserId ? currentUsername : 'Diğer Kullanıcı',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80',
                status: 'online'
              },
              timestamp: msg.created_at,
              reactions: msg.reactions || [],
              attachments: msg.attachments || [],
              embeds: msg.embeds || []
            };
          });
          
          // Mesajları tarih sırasına göre sırala
          const sortByTimestamp = (a: Message, b: Message) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          };
          
          formattedMessages.sort(sortByTimestamp);
          setMessages(formattedMessages);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Mesajlar yüklenirken hata:', error);
        setIsLoading(false);
      }
    };

    // Sadece gerekli bağımlılıkları kullan, messages eklemiyoruz
    loadMessages();
  }, [routeUserId, currentUserId, currentUsername]);

  return (
    <DirectLayout>
      <div className="flex flex-col h-full" onClick={() => {
        setContextMenu(null);
        setShowMoreMenu(null);
      }}>
        {/* Kanal Başlığı - Sabit */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[var(--surface)] select-none sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-[var(--text-secondary)]" />
            <div>
              <h1 className="text-[var(--text-primary)] font-semibold">Özel Mesaj: {routeUserId}</h1>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-2">
            <div className="relative">
              <button 
                className="relative inline-flex items-center justify-between px-3 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] cursor-pointer transition-all hover:bg-[var(--card)]/80 text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--primary)]"
                onClick={() => {
                  const viewModeElement = document.getElementById('viewMode');
                  if (viewModeElement) {
                    viewModeElement.focus();
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {messageViewMode === 'discord' && (
                    <>
                      <div className="w-4 h-4 rounded-full bg-[#5865F2]"></div>
                      <span>Discord</span>
                    </>
                  )}
                  {messageViewMode === 'whatsapp' && (
                    <>
                      <div className="w-4 h-4 rounded-full bg-[#25D366]"></div>
                      <span>WhatsApp</span>
                    </>
                  )}
                  {messageViewMode === 'bubbles' && (
                    <>
                      <div className="w-4 h-4 rounded-full bg-[#0088cc]"></div>
                      <span>Baloncuklar</span>
                    </>
                  )}
                  {messageViewMode === 'modern' && (
                    <>
                      <div className="w-4 h-4 rounded-full bg-[var(--primary)]"></div>
                      <span>Modern</span>
                    </>
                  )}
                </div>
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <select
                id="viewMode"
                value={messageViewMode}
                onChange={(e) => setMessageViewMode(e.target.value as 'discord' | 'whatsapp' | 'bubbles' | 'modern')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="discord">Discord Stili</option>
                <option value="whatsapp">WhatsApp Stili</option>
                <option value="bubbles">Baloncuklar</option>
                <option value="modern">Modern</option>
              </select>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowFontSizeSlider(!showFontSizeSlider)}
                className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]"
                title="Metin Boyutu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7"></polyline>
                  <line x1="9" y1="20" x2="15" y2="20"></line>
                  <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
              </button>
              
              {showFontSizeSlider && (
                <div className="absolute right-0 top-full mt-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-20 w-48">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--text-primary)]">Metin Boyutu</span>
                      <span className="text-sm text-[var(--text-secondary)]">{messageFontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="12" 
                      max="24" 
                      value={messageFontSize}
                      onChange={(e) => setMessageFontSize(parseInt(e.target.value))}
                      className="w-full accent-[var(--primary)]"
                    />
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Küçük</span>
                      <span>Büyük</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
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
            messages.map((message, index) => {
              const isSameUser = index > 0 && messages[index - 1].author.id === message.author.id;
              const isRepliedTo = messages.some(m => m.replyTo?.id === message.id);
              const isHidden = hiddenMessages.includes(message.id);
              const isCurrentUser = message.author.id === currentUserId;
              
              if (isHidden) {
                return (
                  <div
                    key={message.id}
                    className="flex items-center justify-center p-4 bg-[var(--card)] rounded-lg cursor-pointer"
                    onClick={() => handleHideMessage(message.id)}
                  >
                    <Eye size={16} className="mr-2 text-[var(--text-secondary)]" />
                    <span className="text-[var(--text-secondary)]">Bu mesaj gizlendi</span>
                  </div>
                );
              }
              
              // WhatsApp stili
              if (messageViewMode === 'whatsapp') {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                  >
                    <div className="max-w-[75%]">
                      {message.replyTo && (
                        <div className={`mb-1 text-xs bg-[#f0f0f0]/30 p-2 rounded-t ${
                          isCurrentUser ? 'border-r-2 border-[#4fce5d]' : 'border-l-2 border-[#34b7f1]'
                        }`}>
                          <div className="flex items-center gap-1">
                            <Reply size={12} className="text-[#667781]" />
                            <span className="font-medium text-[#667781]">
                              {message.replyTo.author.name}
                            </span>
                          </div>
                          <p className="text-[#667781] line-clamp-1 mt-1">{message.replyTo.content}</p>
                        </div>
                      )}
                      
                      <div className={`p-2 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-[#dcf8c6] text-[#303030] ml-auto' 
                          : 'bg-white text-[#303030]'
                      }`}>
                        <div className="break-words whitespace-pre-wrap">
                          {renderMessageContent(message.content)}
                        </div>
                        
                        <div className="text-right mt-1">
                          <span className="text-[10px] text-[#667781]">
                            {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {showReactionPicker === message.id && (
                      <div className={`absolute ${isCurrentUser ? 'right-0' : 'left-0'} mt-1 z-10`}>
                        <ReactionPicker 
                          messageId={message.id} 
                          onClose={() => setShowReactionPicker(null)} 
                        />
                      </div>
                    )}
                  </motion.div>
                );
              }
              
              // Modern stili
              if (messageViewMode === 'modern') {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="my-4 px-2 relative group"
                    onContextMenu={(e) => handleContextMenu(e, message)}
                  >
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-start`}>
                      {!isCurrentUser && (
                        <div className="flex-shrink-0 mr-3 mt-1">
                          <Image
                            src={message.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
                            alt={message.author.name}
                            width={36}
                            height={36}
                            className="rounded-full shadow-md"
                          />
                        </div>
                      )}
                      <div className={`max-w-[75%]`}>
                        {!isSameUser && (
                          <div className={`text-xs mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            <span className="font-medium text-[var(--text-secondary)] mr-2">
                              {message.author.name}
                            </span>
                            <span className="text-[var(--text-muted)]">
                              {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        
                        {message.replyTo && (
                          <div className={`mb-2 text-xs bg-[var(--card)]/10 p-2 rounded border-l-2 ${
                            isCurrentUser 
                              ? 'bg-[var(--primary)]/10 border-[var(--primary)] ml-auto text-right' 
                              : 'bg-[var(--text-secondary)]/10 border-[var(--text-secondary)]'
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Reply size={12} className="text-[var(--text-secondary)]" />
                              <span className="font-medium text-[var(--text-secondary)]">
                                {message.replyTo.author.name}
                              </span>
                            </div>
                            <p className="text-[var(--text-secondary)] line-clamp-2">{message.replyTo.content}</p>
                          </div>
                        )}
                        
                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isCurrentUser 
                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white' 
                            : 'bg-[var(--card)] text-[var(--text-primary)]'
                        }`} style={{ fontSize: `${messageFontSize}px` }}>
                          {renderMessageContent(message.content)}
                        </div>
                        
                        {message.reactions && message.reactions.length > 0 && (
                          <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {message.reactions.map((reaction) => {
                              const hasReacted = reaction.users.includes(currentUserId);
                              const emojiHtml = emojiCodeToHtml(reaction.emoji, emojiCategories);
                              
                              return (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                    hasReacted 
                                      ? 'bg-[var(--primary)]/20 text-[var(--primary)]' 
                                      : 'bg-[var(--card)] text-[var(--text-secondary)]'
                                  }`}
                                >
                                  <span dangerouslySetInnerHTML={{ __html: emojiHtml }} className="w-3 h-3" />
                                  <span className="font-medium">{reaction.count}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {isCurrentUser && (
                        <div className="flex-shrink-0 ml-3 mt-1">
                          <Image
                            src={message.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
                            alt={message.author.name}
                            width={36}
                            height={36}
                            className="rounded-full shadow-md"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className={`mt-1 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button 
                          onClick={() => handleReply(message)}
                          className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                          title="Yanıtla"
                        >
                          <Reply size={12} />
                        </button>
                        <button 
                          onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                          className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                          title="Reaksiyon Ekle"
                        >
                          <Smile size={12} />
                        </button>
                        <button 
                          onClick={(e) => handleMoreClick(e, message.id)}
                          className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                          title="Daha Fazla"
                        >
                          <MoreVertical size={12} />
                        </button>
                      </div>
                    </div>
                    
                    {showReactionPicker === message.id && (
                      <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full mt-1 z-10">
                        <ReactionPicker 
                          messageId={message.id} 
                          onClose={() => setShowReactionPicker(null)} 
                        />
                      </div>
                    )}
                    <MoreMenu messageId={message.id} />
                  </motion.div>
                );
              }

              // Baloncuklar stili
              if (messageViewMode === 'bubbles') {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3 relative`}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                  >
                    {!isCurrentUser && (!isSameUser || true) && (
                      <Image
                        src={message.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
                        alt={message.author.name}
                        width={28}
                        height={28}
                        className="rounded-full mr-2 self-end mb-1 flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col max-w-[75%]">
                      {!isSameUser && (
                        <div className={`text-xs mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          <span className={`font-medium ${isCurrentUser ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                            {message.author.name}
                          </span>
                        </div>
                      )}
                      
                      {message.replyTo && (
                        <div className={`mb-2 text-xs bg-white/5 p-1.5 rounded ${isCurrentUser ? 'rounded-tr-none ml-auto' : 'rounded-tl-none'} max-w-[100%]`}>
                          <p className="text-[var(--text-secondary)] line-clamp-1">
                            <span className="font-medium text-[var(--text-primary)] mr-1">
                              {message.replyTo.author.name}:
                            </span>
                            {message.replyTo.content}
                          </p>
                        </div>
                      )}
                      
                      <div className={`rounded-2xl px-3 py-2 ${
                        isCurrentUser 
                          ? 'bg-[var(--primary)] text-white rounded-tr-none ml-auto' 
                          : 'bg-[var(--card)] text-[var(--text-primary)] rounded-tl-none'
                      } max-w-full shadow-sm relative`} style={{ fontSize: `${messageFontSize}px` }}>
                        <div className="break-words whitespace-pre-wrap">
                          {renderMessageContent(message.content)}
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] ${isCurrentUser ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}>
                            {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {message.reactions && message.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {message.reactions.map((reaction) => {
                            const hasReacted = reaction.users.includes(currentUserId);
                            const emojiHtml = emojiCodeToHtml(reaction.emoji, emojiCategories);
                            
                            return (
                              <button
                                key={reaction.emoji}
                                onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                className="bg-[var(--card)] rounded-full h-5 min-w-5 flex items-center justify-center px-1"
                              >
                                <span dangerouslySetInnerHTML={{ __html: emojiHtml }} className="w-3 h-3" />
                                <span className="text-[10px] ml-1">{reaction.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {isCurrentUser && (!isSameUser || true) && (
                      <Image
                        src={message.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
                        alt={message.author.name}
                        width={28}
                        height={28}
                        className="rounded-full ml-2 self-end mb-1 flex-shrink-0"
                      />
                    )}
                    
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity right-0 bottom-0 flex items-center gap-0.5 bg-[var(--card)]/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm translate-y-1/2">
                      <button 
                        onClick={() => handleReply(message)}
                        className="p-1 rounded-full hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                        title="Yanıtla"
                      >
                        <Reply size={10} />
                      </button>
                      <button 
                        onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                        className="p-1 rounded-full hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                        title="Reaksiyon Ekle"
                      >
                        <Smile size={10} />
                      </button>
                    </div>
                    
                    {showReactionPicker === message.id && (
                      <div className={`absolute ${isCurrentUser ? 'right-0' : 'left-0'} mt-1 z-10`}>
                        <ReactionPicker 
                          messageId={message.id} 
                          onClose={() => setShowReactionPicker(null)} 
                        />
                      </div>
                    )}
                  </motion.div>
                );
              }

              // Discord stili (varsayılan)
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group flex items-start gap-3 px-6 py-2 hover:bg-[var(--card)]/30 rounded-md ${
                    isSameUser ? 'mt-0.5 pt-0.5' : 'mt-2 pt-2'
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, message)}
                >
                  {/* Her zaman aynı hizada kalması için PP boşluğu */}
                  <div className="flex-shrink-0 w-10 h-10">
                    {!isSameUser ? (
                      <Image
                        src={message.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
                        alt={message.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {!isSameUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[var(--text-primary)]">{message.author.name}</span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {message.replyTo && (
                      <div className="mb-2 bg-[var(--card)]/30 p-2 rounded-md border-l-2 border-[var(--primary)] max-w-[85%]">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Reply size={12} className="text-[var(--text-secondary)]" />
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            @{message.replyTo.author.name}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                          {message.replyTo.content}
                        </p>
                      </div>
                    )}
                    
                    <div className={`px-3 py-1.5 rounded-md ${
                      isCurrentUser 
                        ? 'text-[var(--text-primary)]' 
                        : 'bg-[var(--card)]/60 text-[var(--text-primary)]'
                    } break-words whitespace-pre-wrap max-w-[90%]`} style={{ fontSize: `${messageFontSize}px` }}>
                      {renderMessageContent(message.content)}
                    </div>
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.reactions.map((reaction) => {
                          const hasReacted = reaction.users.includes(currentUserId);
                          const emojiHtml = emojiCodeToHtml(reaction.emoji, emojiCategories);
                          
                          return (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleAddReaction(message.id, reaction.emoji)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs ${
                                hasReacted 
                                  ? 'bg-[var(--primary)]/20 text-[var(--primary)]' 
                                  : 'bg-[var(--card)] text-[var(--text-secondary)]'
                              }`}
                            >
                              <span dangerouslySetInnerHTML={{ __html: emojiHtml }} className="w-4 h-4" />
                              <span className="font-medium">{reaction.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                    <button 
                      onClick={() => handleReply(message)}
                      className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                      title="Yanıtla"
                    >
                      <Reply size={14} />
                    </button>
                    <button 
                      onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                      className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                      title="Reaksiyon Ekle"
                    >
                      <Smile size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleMoreClick(e, message.id)}
                      className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
                      title="Daha Fazla"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  
                  {showReactionPicker === message.id && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 translate-y-16 z-10">
                      <ReactionPicker 
                        messageId={message.id} 
                        onClose={() => setShowReactionPicker(null)} 
                      />
                    </div>
                  )}
                  
                  <MoreMenu messageId={message.id} />
                </motion.div>
              );
            })
          )}
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
          <div className="flex items-start gap-1 sm:gap-2 bg-[var(--card)] rounded-lg p-1.5 sm:p-2">
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
              className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none min-h-[40px] max-h-[200px] py-2 focus:ring-0 whitespace-pre-wrap break-words"
              rows={1}
              style={{ wordBreak: 'break-word' }}
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onBlur={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
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

      {/* Context Menu */}
      <ContextMenu />

      {/* Report Modal */}
      <ReportModal />
    </DirectLayout>
  );
}
