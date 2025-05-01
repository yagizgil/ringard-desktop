import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Reply, Smile, MoreVertical } from 'lucide-react';
import { Message } from '@/app/types/message';

interface MessageStyleProps {
  message: Message;
  isCurrentUser: boolean;
  isSameUser: boolean;
  currentUserId: string;
  messageFontSize: number;
  renderMessageContent: (content: string) => React.ReactNode;
  handleReply: (message: Message) => void;
  handleContextMenu: (e: React.MouseEvent, message: Message) => void;
  handleMoreClick: (e: React.MouseEvent, messageId: string) => void;
  setShowReactionPicker: (messageId: string | null) => void;
  showReactionPicker: string | null;
  emojiCodeToHtml: (emojiCode: string, emojiCategories: any) => string;
  emojiCategories: any;
  handleAddReaction: (messageId: string, emoji: string) => void;
  ReactionPicker: React.FC<{ messageId: string; onClose: () => void }>;
  MoreMenu: React.FC<{ messageId: string }>;
}

// Discord stil bileşeni
export const DiscordStyle: React.FC<MessageStyleProps> = ({
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
}) => {
  // Menü pozisyonu state'i
  const [menuPosition, setMenuPosition] = React.useState<{x: number, y: number} | null>(null);
  const moreButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Emoji picker pozisyonu
  const [emojiPickerPosition, setEmojiPickerPosition] = React.useState<{x: number, y: number} | null>(null);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);

  // Buton ve icon boyutlarını hesapla (yazı boyutuyla orantılı)
  const buttonSize = Math.max(Math.round(messageFontSize * 1.3), 24); // minimum 24px
  const iconSize = Math.max(Math.round(messageFontSize * 0.8), 14);   // minimum 14px

  // More butonu tıklandığında konumu belirleme
  const handleMoreButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setMenuPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // More menüsünü aç/kapat
    handleMoreClick(e, message.id);
  };
  
  // Emoji butonu tıklandığında konumu belirleme
  const handleEmojiButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPickerPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // Emoji picker'ı aç/kapat
    setShowReactionPicker(showReactionPicker === message.id ? null : message.id);
  };

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-start gap-3 px-6 py-0 hover:bg-[var(--card)]/30 rounded-md ${
        isSameUser ? 'mt-0.5 pt-0.5' : 'mt-2 pt-2'
      }`}
      onContextMenu={(e) => handleContextMenu(e, message)}
    >
      {/* Her zaman aynı hizada kalması için PP boşluğu */}
      <div className="flex-shrink-0 w-10 h-5">
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
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
        >
          <Reply size={iconSize} />
        </button>
        <button 
          ref={emojiButtonRef}
          onClick={handleEmojiButtonClick}
          className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
          title="Reaksiyon Ekle"
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
        >
          <Smile size={iconSize} />
        </button>
        <button 
          ref={moreButtonRef}
          onClick={handleMoreButtonClick}
          className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
          title="Daha Fazla"
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
        >
          <MoreVertical size={iconSize} />
        </button>
      </div>
      
      {/* Emoji picker - dinamik pozisyonlu */}
      {showReactionPicker === message.id && emojiPickerPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${emojiPickerPosition.y}px`,
            left: `${emojiPickerPosition.x}px`,
            zIndex: 50
          }}
        >
          <ReactionPicker 
            messageId={message.id} 
            onClose={() => setShowReactionPicker(null)} 
          />
        </div>
      )}
      
      {/* Dinamik pozisyonlu menü */}
      {menuPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            zIndex: 50
          }}
        >
          <MoreMenu messageId={message.id} />
        </div>
      )}
    </motion.div>
  );
};

// WhatsApp stil bileşeni
export const WhatsAppStyle: React.FC<MessageStyleProps> = ({
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
}) => {
  // Menü pozisyonu state'i
  const [menuPosition, setMenuPosition] = React.useState<{x: number, y: number} | null>(null);
  const moreButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Emoji picker pozisyonu
  const [emojiPickerPosition, setEmojiPickerPosition] = React.useState<{x: number, y: number} | null>(null);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Buton ve icon boyutlarını hesapla (yazı boyutuyla orantılı)
  const buttonSize = Math.max(Math.round(messageFontSize * 1.2), 22); // minimum 22px
  const iconSize = Math.max(Math.round(messageFontSize * 0.7), 12);   // minimum 12px

  // More butonu tıklandığında konumu belirleme
  const handleMoreButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setMenuPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // More menüsünü aç/kapat
    handleMoreClick(e, message.id);
  };
  
  // Emoji butonu tıklandığında konumu belirleme
  const handleEmojiButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPickerPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // Emoji picker'ı aç/kapat
    setShowReactionPicker(showReactionPicker === message.id ? null : message.id);
  };

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1 group relative`}
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
        
        <div 
          className={`p-2 rounded-lg ${
            isCurrentUser 
              ? 'bg-[#dcf8c6] text-[#303030] ml-auto' 
              : 'bg-white text-[#303030]'
          }`} 
          style={{ fontSize: `${messageFontSize}px` }}
        >
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
        
        {/* Buton grubu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1 justify-end">
          <button 
            onClick={() => handleReply(message)}
            className="p-1 rounded-full bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#667781]" 
            title="Yanıtla"
            style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          >
            <Reply size={iconSize} />
          </button>
          <button 
            ref={emojiButtonRef}
            onClick={handleEmojiButtonClick}
            className="p-1 rounded-full bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#667781]" 
            title="Reaksiyon Ekle"
            style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          >
            <Smile size={iconSize} />
          </button>
          <button 
            ref={moreButtonRef}
            onClick={handleMoreButtonClick}
            className="p-1 rounded-full bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#667781]" 
            title="Daha Fazla"
            style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          >
            <MoreVertical size={iconSize} />
          </button>
        </div>
      </div>
      
      {/* Emoji picker - dinamik pozisyonlu */}
      {showReactionPicker === message.id && emojiPickerPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${emojiPickerPosition.y}px`,
            left: `${emojiPickerPosition.x}px`,
            zIndex: 50
          }}
        >
          <ReactionPicker 
            messageId={message.id} 
            onClose={() => setShowReactionPicker(null)} 
          />
        </div>
      )}
      
      {/* Dinamik pozisyonlu menü */}
      {menuPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            zIndex: 50
          }}
        >
          <MoreMenu messageId={message.id} />
        </div>
      )}
    </motion.div>
  );
};

// Baloncuk stil bileşeni
export const BubblesStyle: React.FC<MessageStyleProps> = ({
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
}) => {
  // Menü pozisyonu state'i
  const [menuPosition, setMenuPosition] = React.useState<{x: number, y: number} | null>(null);
  const moreButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Emoji picker pozisyonu
  const [emojiPickerPosition, setEmojiPickerPosition] = React.useState<{x: number, y: number} | null>(null);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Buton ve icon boyutlarını hesapla (yazı boyutuyla orantılı)
  const buttonSize = Math.max(Math.round(messageFontSize * 1.1), 20); // minimum 20px
  const iconSize = Math.max(Math.round(messageFontSize * 0.6), 10);   // minimum 10px

  // More butonu tıklandığında konumu belirleme
  const handleMoreButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setMenuPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // More menüsünü aç/kapat
    handleMoreClick(e, message.id);
  };
  
  // Emoji butonu tıklandığında konumu belirleme
  const handleEmojiButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPickerPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // Emoji picker'ı aç/kapat
    setShowReactionPicker(showReactionPicker === message.id ? null : message.id);
  };

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3 relative`}
      onContextMenu={(e) => handleContextMenu(e, message)}
    >
      {!isCurrentUser && (
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
        
        <div 
          className={`rounded-2xl px-3 py-2 ${
            isCurrentUser 
              ? 'bg-[var(--primary)] text-white rounded-tr-none ml-auto' 
              : 'bg-[var(--card)] text-[var(--text-primary)] rounded-tl-none'
          } max-w-full shadow-sm relative`}
          style={{ fontSize: `${messageFontSize}px` }}
        >
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
      
      {isCurrentUser && (
        <Image
          src={message.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80'}
          alt={message.author.name}
          width={28}
          height={28}
          className="rounded-full ml-2 self-end mb-1 flex-shrink-0"
        />
      )}
      
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity right-0 bottom-0 flex items-center gap-0.5 bg-[var(--card)]/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm translate-y-1/2"
           style={{ padding: `${Math.max(messageFontSize * 0.1, 2)}px` }}
      >
        <button 
          onClick={() => handleReply(message)}
          className="p-1 rounded-full hover:bg-[var(--card)] text-[var(--text-secondary)]" 
          title="Yanıtla"
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
        >
          <Reply size={iconSize} />
        </button>
        <button 
          ref={emojiButtonRef}
          onClick={handleEmojiButtonClick}
          className="p-1 rounded-full hover:bg-[var(--card)] text-[var(--text-secondary)]" 
          title="Reaksiyon Ekle"
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
        >
          <Smile size={iconSize} />
        </button>
        <button 
          ref={moreButtonRef}
          onClick={handleMoreButtonClick}
          className="p-1 rounded-full hover:bg-[var(--card)] text-[var(--text-secondary)]" 
          title="Daha Fazla"
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
        >
          <MoreVertical size={iconSize} />
        </button>
      </div>
      
      {/* Emoji picker - dinamik pozisyonlu */}
      {showReactionPicker === message.id && emojiPickerPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${emojiPickerPosition.y}px`,
            left: `${emojiPickerPosition.x}px`,
            zIndex: 50
          }}
        >
          <ReactionPicker 
            messageId={message.id} 
            onClose={() => setShowReactionPicker(null)} 
          />
        </div>
      )}
      
      {/* Dinamik pozisyonlu menü */}
      {menuPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            zIndex: 50
          }}
        >
          <MoreMenu messageId={message.id} />
        </div>
      )}
    </motion.div>
  );
};

// Modern stil bileşeni
export const ModernStyle: React.FC<MessageStyleProps> = ({
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
}) => {
  // Menü pozisyonu state'i
  const [menuPosition, setMenuPosition] = React.useState<{x: number, y: number} | null>(null);
  const moreButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Emoji picker pozisyonu
  const [emojiPickerPosition, setEmojiPickerPosition] = React.useState<{x: number, y: number} | null>(null);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Buton ve icon boyutlarını hesapla (yazı boyutuyla orantılı)
  const buttonSize = Math.max(Math.round(messageFontSize * 1.2), 22); // minimum 22px
  const iconSize = Math.max(Math.round(messageFontSize * 0.7), 12);   // minimum 12px

  // More butonu tıklandığında konumu belirleme
  const handleMoreButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setMenuPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // More menüsünü aç/kapat
    handleMoreClick(e, message.id);
  };
  
  // Emoji butonu tıklandığında konumu belirleme
  const handleEmojiButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Eğer buton referansı varsa, konum hesapla
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPickerPosition({ 
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY
      });
    }
    // Emoji picker'ı aç/kapat
    setShowReactionPicker(showReactionPicker === message.id ? null : message.id);
  };

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-0 px-2 relative group"
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
          
          <div 
            className={`rounded-2xl px-4 py-3 shadow-sm ${
              isCurrentUser 
                ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white' 
                : 'bg-[var(--card)] text-[var(--text-primary)]'
            }`}
            style={{ fontSize: `${messageFontSize}px` }}
          >
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
            style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          >
            <Reply size={iconSize} />
          </button>
          <button 
            ref={emojiButtonRef}
            onClick={handleEmojiButtonClick}
            className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
            title="Reaksiyon Ekle"
            style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          >
            <Smile size={iconSize} />
          </button>
          <button 
            ref={moreButtonRef}
            onClick={handleMoreButtonClick}
            className="p-1 rounded hover:bg-[var(--card)] text-[var(--text-secondary)]" 
            title="Daha Fazla"
            style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          >
            <MoreVertical size={iconSize} />
          </button>
        </div>
      </div>
      
      {/* Emoji picker - dinamik pozisyonlu */}
      {showReactionPicker === message.id && emojiPickerPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${emojiPickerPosition.y}px`,
            left: `${emojiPickerPosition.x}px`,
            zIndex: 50
          }}
        >
          <ReactionPicker 
            messageId={message.id} 
            onClose={() => setShowReactionPicker(null)} 
          />
        </div>
      )}
      
      {/* Dinamik pozisyonlu menü */}
      {menuPosition && (
        <div 
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            zIndex: 50
          }}
        >
          <MoreMenu messageId={message.id} />
        </div>
      )}
    </motion.div>
  );
}; 