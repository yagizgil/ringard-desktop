import { EmojiCategory } from '../api/emojis';

// Mesaj içindeki emoji kodlarını HTML'e dönüştür
export const processMessageEmojis = (content: string, emojis: EmojiCategory[]): string => {
  // Emoji kodlarını bul (<:emoji_name:emoji_id> formatında)
  const emojiRegex = /<:([^:]+):([^>]+)>/g;
  
  // Her emoji kodunu HTML'e dönüştür
  return content.replace(emojiRegex, (match, name, id) => {
    // Tüm emojileri düzleştir
    const allEmojis = emojis.flatMap(category => category.emojis);
    
    // Emojiyi bul
    const emoji = allEmojis.find(e => e.id === id && e.name === name);
    
    if (emoji) {
      return `<img src="${emoji.url}" alt="${emoji.name}" class="inline-block w-5 h-5 align-middle" title="${emoji.name}" />`;
    }
    
    return match; // Emoji bulunamazsa orijinal kodu döndür
  });
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

// Emoji kodunu oluştur
export const createEmojiCode = (name: string, id: string): string => {
  return `<:${name}:${id}>`;
};

// Mesaj içindeki emoji kodlarını say
export const countEmojis = (content: string): number => {
  const emojiRegex = /<:([^:]+):([^>]+)>/g;
  const matches = content.match(emojiRegex);
  return matches ? matches.length : 0;
};

// Mesaj içindeki emoji kodlarını çıkar
export const extractEmojiCodes = (content: string): string[] => {
  const emojiRegex = /<:([^:]+):([^>]+)>/g;
  const matches = content.match(emojiRegex);
  return matches || [];
}; 