'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Message as ChannelMessage, Reaction } from '@/app/types/channel';
import { Message, MessageReply } from '@/app/types/message';
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
// Stil bileşenlerini import et
import { DiscordStyle, WhatsAppStyle, BubblesStyle, ModernStyle } from '@/app/messages/styles/MessageStyles';

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
  const fontSizeSliderRef = useRef<HTMLDivElement>(null);
  const fontSizeButtonRef = useRef<HTMLButtonElement>(null);
  
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
                  content: decryptedContent
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
            // replyTo verisini işle
            let replyToMessage: MessageReply | undefined = undefined;
            if (replyData) {
              // Mevcut mesajlar arasında replyTo'ya ait mesaj aranır
              const foundMessage = messages.find(m => m.id === replyData.id);
              if (foundMessage) {
                replyToMessage = {
                  id: foundMessage.id,
                  content: foundMessage.content,
                  author: {
                    id: foundMessage.author.id,
                    name: foundMessage.author.name
                  }
                };
              } else {
                // Mesaj bulunamadıysa replyData'dan bir replyTo oluştur
                replyToMessage = {
                  id: replyData.id,
                  content: replyData.content,
                  author: {
                    id: replyData.author.id,
                    name: replyData.author.name
                  }
                };
              }
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

  // Kullanıcı tercihlerini localStorage'dan al veya varsayılan değerleri kullan
  useEffect(() => {
    const savedMessageViewMode = localStorage.getItem('messageViewMode');
    const savedMessageFontSize = localStorage.getItem('messageFontSize');
    
    if (savedMessageViewMode) {
      setMessageViewMode(savedMessageViewMode as 'discord' | 'whatsapp' | 'bubbles' | 'modern');
    }
    
    if (savedMessageFontSize) {
      setMessageFontSize(parseInt(savedMessageFontSize));
    }
  }, []);
  
  // Font size slideri dışında bir yere tıklandığında slider'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Eğer slider açıksa ve tıklanan yer slider veya slider butonu değilse kapat
      if (
        showFontSizeSlider && 
        fontSizeSliderRef.current && 
        fontSizeButtonRef.current && 
        !fontSizeSliderRef.current.contains(event.target as Node) &&
        !fontSizeButtonRef.current.contains(event.target as Node)
      ) {
        setShowFontSizeSlider(false);
      }
    };
    
    // Event listener'ı ekle
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontSizeSlider]);

  // Mesaj görünüm modunu güncelle ve localStorage'a kaydet
  const updateMessageViewMode = (mode: 'discord' | 'whatsapp' | 'bubbles' | 'modern') => {
    setMessageViewMode(mode);
    localStorage.setItem('messageViewMode', mode);
  };
  
  // Mesaj font boyutunu güncelle ve localStorage'a kaydet
  const updateMessageFontSize = (size: number) => {
    setMessageFontSize(size);
    localStorage.setItem('messageFontSize', size.toString());
  };

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
    
    // Eğer başka bir menü açıksa, onu kapat
    if (showMoreMenu && showMoreMenu !== messageId) {
      setShowMoreMenu(null);
    }
    
    // Şimdiki menüyü aç/kapat
    setShowMoreMenu(showMoreMenu === messageId ? null : messageId);
    
    // Context menüsünü kapat
    setContextMenu(null);
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
          const parsedContent = JSON.parse(gifData.content);
          return (
            <div className="my-1 max-w-full">
              <img 
                src={parsedContent.content} 
                alt={parsedContent.alt || parsedContent} 
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

  // Çift tıklama ve sürükleme ile yanıtlama işleyicisi
  const handleMessageDoubleClick = (message: Message) => {
    handleReply(message);
  };

  const handleDragStart = (e: React.DragEvent, message: Message) => {
    e.dataTransfer.setData('messageId', message.id);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Sürükleme başladığında mesajın görünümünü değiştir
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '0.7';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Sürükleme bittiğinde stilini normale döndür
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '1';
    }
  };

  const handleMessageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const messageId = e.dataTransfer.getData('messageId');
    if (messageId) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        handleReply(message);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Sürükleme için izin ver
    e.dataTransfer.dropEffect = 'copy';
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
        className="fixed z-50 bg-black/60 rounded-lg shadow-lg py-1 min-w-[200px] backdrop-blur-lg bg-opacity-95"
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
            className="group flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            <Reply size={16} className="group-hover:text-orange-500 duration-300"/>
            Yanıtla
          </button>
          <button 
            onClick={() => setShowReactionPicker(contextMenu.message.id)}
            className="group flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            <Smile size={16} className="group-hover:text-orange-500 duration-300"/>
            Tepki Ekle
          </button>
          <button 
            onClick={() => handleViewProfile(contextMenu.message.author.name)}
            className="group flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            <User size={16} className="group-hover:text-orange-500 duration-300"/>
            Profili Gör
          </button>
          <button 
            onClick={handleAddFriend}
            className="group flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 hover:text-blue-400 text-[var(--text-primary)] transition-colors duration-300"
          >
            <UserPlus size={16} className="group-hover:text-blue-400 duration-300" />
            Arkadaş Ekle
          </button>
          <button 
            onClick={() => handleReport(contextMenu.message)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-red-500 transition-colors duration-300"
          >
            <Flag size={16} />
            Raporla
          </button>
          <button 
            onClick={() => handleHideMessage(contextMenu.message.id)}
            className="group flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            {hiddenMessages.includes(contextMenu.message.id) ? <Eye size={16} className="group-hover:text-orange-500"/> : <EyeOff size={16} className="group-hover:text-orange-500 duration-300"/>}
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="absolute right-0 top-6 z-50 rounded-xl py-2"
        onClick={(e) => e.stopPropagation()}
      >

        <div 
        className="z-50 bg-black/60 rounded-lg shadow-lg py-1 min-w-[200px] backdrop-blur-lg bg-opacity-95"
        style={{ 
          transform: 'translateY(-100%)',
          marginTop: '-8px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => handleReply(messages.find(m => m.id === messageId)!)}
            className="group/btn flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            <Reply size={16} className="group-hover/btn:text-orange-500 duration-300"/>
            Yanıtla
          </button>
          <button 
            onClick={() => setShowReactionPicker(messageId)}
            className="group/btn flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            <Smile size={16} className="group-hover/btn:text-orange-500 duration-300"/>
            Tepki Ekle
          </button>
          <button 
            onClick={() => handleViewProfile(messages.find(m => m.id === messageId)!.author.name)}
            className="group/btn flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            <User size={16} className="group-hover/btn:text-orange-500 duration-300"/>
            Profili Gör
          </button>
          <button 
            onClick={handleAddFriend}
            className="group/btn flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 hover:text-blue-400 text-[var(--text-primary)] transition-colors duration-300"
          >
            <UserPlus size={16} className="group-hover/btn:text-blue-400 duration-300" />
            Arkadaş Ekle
          </button>
          <button 
            onClick={() => handleReport(messages.find(m => m.id === messageId)!)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-red-500 transition-colors duration-300"
          >
            <Flag size={16} />
            Raporla
          </button>
          <button 
            onClick={() => handleHideMessage(messageId)}
            className="group/btn flex items-center gap-2 w-full px-4 py-2 hover:bg-white/5 text-[var(--text-primary)] transition-colors duration-300"
          >
            {hiddenMessages.includes(messageId) ? <Eye size={16} className="group-hover/btn:text-orange-500"/> : <EyeOff size={16} className="group-hover/btn:text-orange-500 duration-300"/>}
            {hiddenMessages.includes(messageId) ? 'Göster' : 'Gizle'}
          </button>
        </div>
      </div>
      </motion.div>
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
            let replyToData = null;
            
            if (messageContent.startsWith('dm:')) {
              try {
                const dmData = JSON.parse(messageContent.substring(3));
                
                // Yanıt verisi varsa al
                if (dmData.replyTo) {
                  replyToData = dmData.replyTo;
                }
                
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
                  
                  // Özel GIF mesajı kontrolü
                  if (dmData.type === 'gif') {
                    messageContent = `dm:${JSON.stringify({
                      type: 'gif',
                      content: decryptedContent
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
                }
              } catch (error) {
                console.error('Mesaj çözme hatası:', error);
                messageContent = 'Mesaj çözülemedi';
              }
            }

            // Mesajı oluştur
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
              embeds: msg.embeds || [],
              replyTo: replyToData
            };
          });
          
          // Mesajları tarih sırasına göre sırala
          const sortByTimestamp = (a: Message, b: Message) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          };
          
          formattedMessages.sort(sortByTimestamp);
          
          // İkinci geçiş: replyTo referanslarını düzgün mesaj objelerine dönüştür
          const processedMessages = formattedMessages.map((message: Message) => {
            if (!message.replyTo) return message;
            
            // replyTo bir string ID ise, gerçek mesaj objesini bul
            const replyId = message.replyTo?.id;
            if (!replyId) return message;
            
            const replyToMessage = formattedMessages.find((m: Message) => m.id === replyId);
            
            if (replyToMessage) {
              // Tam mesaj referansı ile replyTo'yu güncelle
              return {
                ...message,
                replyTo: {
                  id: replyToMessage.id,
                  content: replyToMessage.content,
                  author: {
                    id: replyToMessage.author.id,
                    name: replyToMessage.author.name
                  }
                }
              };
            }
            
            return message;
          });
          
          setMessages(processedMessages);
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
      <div 
        className="flex flex-col h-full" 
        onClick={() => {
          setContextMenu(null);
          setShowMoreMenu(null);
        }}
        onDrop={handleMessageDrop}
        onDragOver={handleDragOver}
      >
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
                onChange={(e) => updateMessageViewMode(e.target.value as 'discord' | 'whatsapp' | 'bubbles' | 'modern')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="discord">Classic</option>
                <option value="bubbles">Baloncuk</option>
                <option value="modern">Modern</option>
              </select>
            </div>
            
            <div className="relative">
              <button 
                ref={fontSizeButtonRef}
                onClick={() => setShowFontSizeSlider(!showFontSizeSlider)}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]"
                title="Metin Boyutu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7"></polyline>
                  <line x1="9" y1="20" x2="15" y2="20"></line>
                  <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
              </button>
              
              {showFontSizeSlider && (
                <div 
                  ref={fontSizeSliderRef}
                  className="absolute right-0 top-full mt-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-20 w-48"
                >
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
                      onChange={(e) => updateMessageFontSize(parseInt(e.target.value))}
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
            
            <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
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
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
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
              
              // Mesajı sürüklenebilir ve çift tıklanabilir yap
              const messageProps = {
                message,
                isCurrentUser,
                isSameUser,
                currentUserId,
                messageFontSize,
                renderMessageContent,
                handleReply,
                handleContextMenu,
                handleMoreClick,
                setShowReactionPicker,
                showReactionPicker,
                emojiCodeToHtml,
                emojiCategories,
                handleAddReaction,
                ReactionPicker,
                MoreMenu
              };
              
              // İlgili stil bileşenini kapsayarak sürükleme/çift tıklama ekleyelim
              return (
                <div
                  key={message.id}
                  onDoubleClick={() => handleMessageDoubleClick(message)}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, message)}
                  onDragEnd={handleDragEnd}
                  className="cursor-pointer"
                >
                  {/* WhatsApp stili */}
                  {messageViewMode === 'whatsapp' && (
                    <WhatsAppStyle {...messageProps} />
                  )}
                  
                  {/* Modern stili */}
                  {messageViewMode === 'modern' && (
                    <ModernStyle {...messageProps} />
                  )}

                  {/* Baloncuklar stili */}
                  {messageViewMode === 'bubbles' && (
                    <BubblesStyle {...messageProps} />
                  )}

                  {/* Discord stili (varsayılan) */}
                  {messageViewMode === 'discord' && (
                    <DiscordStyle {...messageProps} />
                  )}
                </div>
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
              className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none min-h-[40px] max-h-[400px] py-2 focus:ring-0 whitespace-pre-wrap break-words"
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
