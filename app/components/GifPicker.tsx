'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Smile, Heart, ThumbsUp, PartyPopper, Zap, Star, Flame } from 'lucide-react';
import debounce from 'lodash/debounce';

interface Gif {
  id: string;
  title: string;
  url: string;
  preview: string;
}

interface GifCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  searchTerm: string;
}

interface GifPickerProps {
  onSelect: (gif: Gif) => void;
  onClose: () => void;
}

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const API_KEY = 'nfBCAxRZZ39OvrVczwDNcKvoDBY7qxfT';

  // GIF kategorileri
  const categories: GifCategory[] = [
    { id: 'trending', name: 'Trending', icon: <TrendingUp size={16} />, searchTerm: 'trending' },
    { id: 'reactions', name: 'Reactions', icon: <Smile size={16} />, searchTerm: 'reaction' },
    { id: 'love', name: 'Love', icon: <Heart size={16} />, searchTerm: 'love' },
    { id: 'thumbsup', name: 'Thumbs Up', icon: <ThumbsUp size={16} />, searchTerm: 'thumbs up' },
    { id: 'celebration', name: 'Celebration', icon: <PartyPopper size={16} />, searchTerm: 'celebration' },
    { id: 'energy', name: 'Energy', icon: <Zap size={16} />, searchTerm: 'energy' },
    { id: 'awesome', name: 'Awesome', icon: <Star size={16} />, searchTerm: 'awesome' },
    { id: 'fire', name: 'Fire', icon: <Flame size={16} />, searchTerm: 'fire' },
  ];

  // Dışarı tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // GIF arama fonksiyonu
  const searchGifs = debounce(async (term: string) => {
    if (!term) {
      setGifs([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${term}&limit=20&rating=g`
      );
      const data = await response.json();
      
      setGifs(data.data.map((gif: any) => ({
        id: gif.id,
        title: gif.title,
        url: gif.images.original.url,
        preview: gif.images.fixed_height_small.url
      })));
    } catch (error) {
      console.error('GIF arama hatası:', error);
    } finally {
      setLoading(false);
    }
  }, 500);

  // Trending GIF'leri getir
  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=20&rating=g`
      );
      const data = await response.json();
      
      setGifs(data.data.map((gif: any) => ({
        id: gif.id,
        title: gif.title,
        url: gif.images.original.url,
        preview: gif.images.fixed_height_small.url
      })));
    } catch (error) {
      console.error('Trending GIF getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kategori seçildiğinde
  const handleCategorySelect = (category: GifCategory) => {
    setActiveCategory(category.id);
    setSearchTerm('');
    searchGifs(category.searchTerm);
  };

  // Arama terimi değiştiğinde GIF'leri ara
  useEffect(() => {
    if (searchTerm) {
      setActiveCategory(null);
      searchGifs(searchTerm);
    } else if (!activeCategory) {
      fetchTrendingGifs();
    }
  }, [searchTerm]);

  // İlk yüklemede trending GIF'leri göster
  useEffect(() => {
    fetchTrendingGifs();
  }, []);

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full mb-2 right-0 w-80 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] z-50"
    >
      <div className="p-2 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-primary)]">GIF Seç</span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/5 rounded"
        >
          <X size={14} className="text-[var(--text-secondary)]" />
        </button>
      </div>
      
      <div className="p-2">
        <div className="relative">
          <input
            type="text"
            placeholder="GIF ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] rounded-md pl-8 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        </div>
      </div>
      
      {/* Kategoriler */}
      <div className="px-2 py-1 border-b border-[var(--border)]">
        <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--text-secondary)] hover:bg-white/5'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-2 grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-4 text-sm text-[var(--text-secondary)]">
            Yükleniyor...
          </div>
        ) : gifs.length > 0 ? (
          gifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif)}
              className="relative aspect-video bg-[var(--card)] rounded overflow-hidden hover:ring-2 hover:ring-[var(--primary)] transition-all"
            >
              <img 
                src={gif.preview} 
                alt={gif.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))
        ) : searchTerm ? (
          <div className="col-span-2 flex items-center justify-center py-4 text-sm text-[var(--text-secondary)]">
            Sonuç bulunamadı
          </div>
        ) : (
          <div className="col-span-2 flex items-center justify-center py-4 text-sm text-[var(--text-secondary)]">
            GIF aramak için yazmaya başlayın
          </div>
        )}
      </div>
    </div>
  );
} 