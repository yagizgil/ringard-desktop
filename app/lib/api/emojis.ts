// fs ve path modüllerini kaldırıyoruz
// import fs from 'fs';
// import path from 'path';

export interface Emoji {
  id: string;
  name: string;
  url: string;
}

export interface EmojiCategory {
  name: string;
  emojis: Emoji[];
}

// Varsayılan emoji verileri
const defaultEmojiData: EmojiCategory[] = [
  {
    name: 'Yüz İfadeleri',
    emojis: [
      { id: 'smile', name: 'smile', url: '/emojis/smile.png' },
      { id: 'laugh', name: 'laugh', url: '/emojis/laugh.png' },
      { id: 'wink', name: 'wink', url: '/emojis/wink.png' },
      { id: 'heart', name: 'heart', url: '/emojis/heart.png' },
      { id: 'sad', name: 'sad', url: '/emojis/sad.png' },
      { id: 'angry', name: 'angry', url: '/emojis/angry.png' },
      { id: 'surprised', name: 'surprised', url: '/emojis/surprised.png' },
      { id: 'sleeping', name: 'sleeping', url: '/emojis/sleeping.png' }
    ]
  },
  {
    name: 'El Hareketleri',
    emojis: [
      { id: 'thumbsup', name: 'thumbsup', url: '/emojis/thumbsup.png' },
      { id: 'thumbsdown', name: 'thumbsdown', url: '/emojis/thumbsdown.png' },
      { id: 'ok', name: 'ok', url: '/emojis/ok.png' },
      { id: 'pray', name: 'pray', url: '/emojis/pray.png' },
      { id: 'wave', name: 'wave', url: '/emojis/wave.png' },
      { id: 'clap', name: 'clap', url: '/emojis/clap.png' },
      { id: 'point', name: 'point', url: '/emojis/point.png' },
      { id: 'fist', name: 'fist', url: '/emojis/fist.png' }
    ]
  },
  {
    name: 'Hayvanlar',
    emojis: [
      { id: 'dog', name: 'dog', url: '/emojis/dog.png' },
      { id: 'cat', name: 'cat', url: '/emojis/cat.png' },
      { id: 'rabbit', name: 'rabbit', url: '/emojis/rabbit.png' },
      { id: 'fox', name: 'fox', url: '/emojis/fox.png' },
      { id: 'bear', name: 'bear', url: '/emojis/bear.png' },
      { id: 'panda', name: 'panda', url: '/emojis/panda.png' },
      { id: 'tiger', name: 'tiger', url: '/emojis/tiger.png' },
      { id: 'lion', name: 'lion', url: '/emojis/lion.png' }
    ]
  },
  {
    name: 'Nesneler',
    emojis: [
      { id: 'heart', name: 'heart', url: '/emojis/heart.png' },
      { id: 'star', name: 'star', url: '/emojis/star.png' },
      { id: 'crown', name: 'crown', url: '/emojis/crown.png' },
      { id: 'gift', name: 'gift', url: '/emojis/gift.png' },
      { id: 'fire', name: 'fire', url: '/emojis/fire.png' },
      { id: 'sparkles', name: 'sparkles', url: '/emojis/sparkles.png' },
      { id: 'rainbow', name: 'rainbow', url: '/emojis/rainbow.png' },
      { id: 'sun', name: 'sun', url: '/emojis/sun.png' }
    ]
  }
];

// Emoji verilerini yükle
export const loadEmojis = async (): Promise<EmojiCategory[]> => {
  try {
    // Burada API'den emoji verilerini çekebilirsiniz
    // Şimdilik varsayılan verileri kullanıyoruz
    return defaultEmojiData;
  } catch (error) {
    console.error('Emoji verileri yüklenirken hata oluştu:', error);
    return defaultEmojiData;
  }
};

// Emoji formatını dönüştür (Discord formatı)
export const formatEmoji = (emojiName: string, emojiId: string): string => {
  return `<:${emojiName}:${emojiId}>`;
};

// Emoji kodunu ayrıştır
export const parseEmojiCode = (emojiCode: string): { name: string, id: string } | null => {
  const match = emojiCode.match(/<:([^:]+):([^>]+)>/);
  if (match) {
    return {
      name: match[1],
      id: match[2]
    };
  }
  return null;
};

// Emoji kodunu HTML'e dönüştür
export const emojiCodeToHtml = (emojiCode: string, emojis: EmojiCategory[]): string => {
  const parsed = parseEmojiCode(emojiCode);
  if (!parsed) return emojiCode;
  
  // Tüm emojileri düzleştir
  const allEmojis = emojis.flatMap(category => category.emojis);
  
  // Emojiyi bul
  const emoji = allEmojis.find(e => e.id === parsed.id && e.name === parsed.name);
  
  if (emoji) {
    return `<img src="${emoji.url}" alt="${emoji.name}" class="inline-block w-5 h-5 align-middle" title="${emoji.name}" />`;
  }
  
  return emojiCode;
}; 