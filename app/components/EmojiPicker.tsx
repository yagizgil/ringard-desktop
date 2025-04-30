import React, { useState, useEffect, useRef } from 'react';
import { Smile, X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emojiCode: string) => void;
  onClose: () => void;
}

interface EmojiCategory {
  name: string;
  emojis: Emoji[];
}

interface Emoji {
  id: string;
  name: string;
  url: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const [categories, setCategories] = useState<EmojiCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Emoji verilerini yükle
  useEffect(() => {
    const loadEmojis = async () => {
      try {
        // Burada API'den emoji verilerini çekebilirsiniz
        // Şimdilik örnek veri kullanıyoruz
        const emojiData = [
          {
            name: 'Yüz İfadeleri',
            emojis: [
              { id: 'smile', name: 'smile', url: '/emojis/smile.png' },
              { id: 'laugh', name: 'laugh', url: '/emojis/laugh.png' },
              { id: 'wink', name: 'wink', url: '/emojis/wink.png' },
              { id: 'heart', name: 'heart', url: '/emojis/heart.png' },
            ]
          },
          {
            name: 'El Hareketleri',
            emojis: [
              { id: 'thumbsup', name: 'thumbsup', url: '/emojis/thumbsup.png' },
              { id: 'thumbsdown', name: 'thumbsdown', url: '/emojis/thumbsdown.png' },
              { id: 'ok', name: 'ok', url: '/emojis/ok.png' },
              { id: 'pray', name: 'pray', url: '/emojis/pray.png' },
            ]
          },
          {
            name: 'Hayvanlar',
            emojis: [
              { id: 'dog', name: 'dog', url: '/emojis/dog.png' },
              { id: 'cat', name: 'cat', url: '/emojis/cat.png' },
              { id: 'rabbit', name: 'rabbit', url: '/emojis/rabbit.png' },
              { id: 'fox', name: 'fox', url: '/emojis/fox.png' },
            ]
          },
        ];
        
        setCategories(emojiData);
        if (emojiData.length > 0) {
          setActiveCategory(emojiData[0].name);
        }
      } catch (error) {
        console.error('Emoji verileri yüklenirken hata oluştu:', error);
      }
    };
    
    loadEmojis();
  }, []);

  // Arama terimine göre emojileri filtrele
  useEffect(() => {
    if (searchTerm.trim() === '') {
      const activeCategoryData = categories.find(cat => cat.name === activeCategory);
      setFilteredEmojis(activeCategoryData?.emojis || []);
    } else {
      const allEmojis = categories.flatMap(cat => cat.emojis);
      const filtered = allEmojis.filter(emoji => 
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmojis(filtered);
    }
  }, [searchTerm, activeCategory, categories]);

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

  const handleEmojiClick = (emoji: Emoji) => {
    onEmojiSelect(`<:${emoji.name}:${emoji.id}>`);
  };

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full mb-2 right-0 w-80 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] z-50"
    >
      <div className="p-2 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile size={18} className="text-[var(--text-secondary)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Emoji Seç</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/5 rounded"
        >
          <X size={16} className="text-[var(--text-secondary)]" />
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
      
      {searchTerm.trim() === '' && (
        <div className="flex border-b border-[var(--border)]">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`flex-1 py-2 text-xs font-medium ${
                activeCategory === category.name
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
      
      <div className="p-2 grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
        {filteredEmojis.map((emoji) => (
          <button
            key={emoji.id}
            onClick={() => handleEmojiClick(emoji)}
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

export default EmojiPicker; 