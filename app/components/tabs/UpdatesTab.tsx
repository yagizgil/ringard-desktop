'use client';

import { motion } from 'framer-motion';
import { UpdateItem } from '@/app/types/tabs';
import { Sparkles } from 'lucide-react';

const updates: UpdateItem[] = [
  {
    id: '1',
    version: '1.0.0-beta',
    changes: [
      'Yeni arayüz tasarımı',
      'Sesli sohbet sistemi',
      'Özel sunucu temaları',
      'Gelişmiş güvenlik özellikleri'
    ],
    date: '27 Mart 2025',
    type: 'major'
  },
  {
    id: '2',
    version: '0.9.5',
    changes: [
      'Performans iyileştirmeleri',
      'Emoji sistemi güncellemesi',
      'Hata düzeltmeleri'
    ],
    date: '20 Mart 2025',
    type: 'minor'
  }
];

export default function UpdatesTab() {
  const getTypeColor = (type: UpdateItem['type']) => {
    switch (type) {
      case 'major':
        return 'from-orange-500 to-red-500';
      case 'minor':
        return 'from-blue-500 to-indigo-500';
      case 'patch':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-8 space-y-8"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2 flex justify-center items-center gap-2">
          <Sparkles className="text-yellow-400 w-6 h-6 animate-pulse" />
          Son Güncellemeler
        </h1>
        <p className="text-sm text-gray-400">
          Ringard dünyasında neler yeni, burada öğrenebilirsin.
        </p>
      </div>

      <div className="space-y-6">
        {updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md overflow-hidden"
          >
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r text-white ${getTypeColor(update.type)}`}>
                  v{update.version}
                </div>
                <time className="text-xs text-gray-400">{update.date}</time>
              </div>
              <ul className="space-y-3">
                {update.changes.map((change, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.1) + (i * 0.05), duration: 0.3 }}
                    className="text-sm text-gray-300 flex gap-2 items-start"
                  >
                    <span className="mt-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    <span>{change}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}