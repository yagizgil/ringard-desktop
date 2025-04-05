'use client';

import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const helpTopics = [
  {
    slug: 'reklam-nasil-calisir',
    title: 'Ringard’da Reklamlar Nasıl Çalışır?',
    excerpt: 'Reklam algoritması, gelir paylaşımı ve kullanıcı deneyimi hakkında bilgilendirme.',
    date: '2 Nisan 2025'
  },
  {
    slug: 'basarimlar-nedir-nasil-alinir',
    title: 'Başarımlar nedir ve nasıl alınır?',
    excerpt: 'Profil bölümündeki başarımlar kısmı hakkında bilgilendirme.',
    date: '29 Mart 2025'
  },
  { slug: 'sunucu-nasil-acilir', title: 'Sunucu Nasıl Açılır?', excerpt: 'Kendi Ringard sunucunuzu oluşturmak için bilmeniz gereken her şey.', date: '1 Nisan 2025' },
  { slug: 'yayinci-rozeti-almak', title: 'Yayıncı rozeti nasıl alınır?', excerpt: 'Yayıncı rozeti alacakların karşılaması gereken koşullar.', date: '29 Mart 2025' }
];

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const filtered = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-orange-900">
      {/* Hero */}
      <div className="bg-gradient-to-tr from-orange-500 to-orange-600 py-20 px-6 text-center border-b border-orange-200 rounded-b-3xl">
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">Yardım ve Destek</h1>
        <p className="text-sm text-orange-200 max-w-xl mx-auto">
          Sıkça sorulan sorulara buradan ulaşabilir, destek taleplerini inceleyebilir veya ihtiyacına uygun konuları okuyabilirsin.
        </p>
        <div className="mt-6 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Ne hakkında yardıma ihtiyacın var?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-sm border border-orange-200 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* İçerik */}
      <div className="max-w-7xl mx-auto px-6 py-12 gap-8">
        {/* Ana İçerik */}
        <section className="grid sm:grid-cols-2 gap-6">
          <AnimatePresence>
            {filtered.map((topic, index) => (
              <motion.div
                key={topic.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <Link href={`/help/${topic.slug}`} className="text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {topic.title}
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {topic.excerpt}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors mt-1" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 mt-auto">
                  <span>{topic.date}</span>
                  <span className="text-orange-500 font-medium">Detay</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}