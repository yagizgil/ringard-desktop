'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, CheckCircle2, Search } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const products = [
  {
    id: '1',
    name: 'Prestijli Üyelik',
    description: 'Daha yüksek dosya paylaşabilir ve görüntülü sohbetlerde ekran paylaşımında daha kaliteli yayın yapabilirsiniz.',
    price: '₺49.99',
    image: '/images/premium.jpg',
    category: 'üyelik',
    popular: true
  },
  {
    id: '2',
    name: 'Sunucu Yükseltmesi',
    description: 'Sunucunuzu keşfet kısmında daha üst yerlere çıkartabilirsiniz.',
    price: '₺119.99',
    image: '/images/server-boost.jpg',
    category: 'sunucu'
  },
  {
    id: '3',
    name: 'Özel Tema Paketi',
    description: "Profiliniz için Ringard'da benzersiz bir tema sahibi olabilirsiniz.",
    price: '₺29.99',
    image: '/images/theme-pack.jpg',
    category: 'tasarım'
  },
  {
    id: '4',
    name: 'Reklam Paketi 1',
    description: '200x500 reklamınız izin verilen sunucularda yayınlanır. 2000 gösterim',
    price: '₺29.99',
    image: '/images/streamer.jpg',
    category: 'reklam'
  }
];

const categories = ['hepsi', 'üyelik', 'sunucu', 'tasarım', 'reklam'];

export default function MarketTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('hepsi');

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'hepsi' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-8 space-y-10"
    >
      {/* Hero */}
      <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/10">
        <Image
          src="/background/market.jpg"
          alt="Market Hero"
          fill
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Ringard Market
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-md">
            Deneyimini geliştirecek premium içerikler, reklam alanları, yükseltmeler ve çok daha fazlası burada seni bekliyor.
          </p>
        </div>
      </div>

      {/* Arama ve Kategori */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 text-sm text-white placeholder:text-muted-foreground border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'text-muted-foreground border-white/10 hover:bg-white/5'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Ürünler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/10 shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-transform overflow-hidden"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                />
                {product.popular && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Popüler
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white truncate">
                    {product.name}
                  </h3>
                  <span className="text-sm font-medium text-green-400">
                    {product.price}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                  className="mt-3 w-full text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Satın Al
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Güvenlik notu */}
      <div className="text-center pt-8 border-t border-white/10">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Tüm ödemeler 256-bit şifreleme ile güvence altındadır.
        </p>
      </div>
    </motion.div>
  );
}
