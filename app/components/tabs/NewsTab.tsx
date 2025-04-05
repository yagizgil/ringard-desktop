'use client';

import { motion } from 'framer-motion';
import { NewsItem } from '@/app/types/tabs';

const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Ringard Beta Sürümü Yayında!',
    content: 'Yeni nesil sohbet platformu Ringard\'ın beta sürümü artık kullanıma hazır. Hemen katılın ve deneyimlemeye başlayın!',
    date: '27 Mart 2025',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41'
  },
  {
    id: '2',
    title: 'Sesli Sohbet Özellikleri Geliştirildi',
    content: 'Yeni güncelleme ile birlikte sesli sohbet odalarına ekran paylaşımı ve yüksek kaliteli ses desteği eklendi.',
    date: '25 Mart 2025'
  }
];

export default function NewsTab() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      <div className="space-y-6">
        {newsItems.map((item) => (
          <motion.article 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-800"
          >
            {item.image && (
              <div className="relative h-48 md:h-64">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500">
                {item.title}
              </h3>
              <p className="text-gray-300 mb-4">{item.content}</p>
              <time className="text-sm text-gray-400">{item.date}</time>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
