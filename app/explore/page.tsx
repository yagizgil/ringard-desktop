'use client';

import { useState } from 'react';
import MainLayout from '@/app/components/layout/MainLayout';
import { Search, SlidersHorizontal, Globe2, Users, Calendar, TrendingUp, ArrowUpWideNarrow, ArrowDownWideNarrow, Star } from 'lucide-react';
import { motion } from 'framer-motion';

type SortOption = 'newest' | 'oldest' | 'popular' | 'most-users' | 'least-users';
type FilterCategory = 'gaming' | 'music' | 'education' | 'art' | 'technology' | 'social' | 'all';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [memberRange, setMemberRange] = useState({ min: 0, max: 100000 });
  const [dateRange, setDateRange] = useState({
    min: new Date('2020-01-01').toISOString(),
    max: new Date().toISOString()
  });

  const categories: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'Tümü' },
    { id: 'gaming', label: 'Oyun' },
    { id: 'music', label: 'Müzik' },
    { id: 'education', label: 'Eğitim' },
    { id: 'art', label: 'Sanat' },
    { id: 'technology', label: 'Teknoloji' },
    { id: 'social', label: 'Sosyal' },
  ];

  const sortOptions: { value: SortOption; label: string; icon: JSX.Element }[] = [
    { value: 'newest', label: 'En Yeni', icon: <Calendar className="w-4 h-4" /> },
    { value: 'oldest', label: 'En Eski', icon: <Calendar className="w-4 h-4" /> },
    { value: 'popular', label: 'Popüler', icon: <Star className="w-4 h-4" /> },
    { value: 'most-users', label: 'En Çok Üye', icon: <ArrowUpWideNarrow className="w-4 h-4" /> },
    { value: 'least-users', label: 'En Az Üye', icon: <ArrowDownWideNarrow className="w-4 h-4" /> },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
          
          <div className="container mx-auto px-4 py-16 sm:py-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Topluluğunu Keşfet
              </h1>
              <p className="text-lg sm:text-xl text-white/60">
                İlgi alanına göre binlerce topluluk arasından seç, katıl ve sosyalleş
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mt-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Topluluk ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters & Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 flex-shrink-0 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filtreler</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/60">Kategori</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id ? 'bg-purple-500 text-white' : 'hover:bg-white/5 text-white/80'}`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country Filter */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/60">Ülke</h3>
                  <div className="relative">
                    <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                    >
                      <option value="all">Tüm Ülkeler</option>
                      <option value="tr">Türkiye</option>
                      <option value="us">Amerika</option>
                      <option value="gb">İngiltere</option>
                      <option value="de">Almanya</option>
                    </select>
                  </div>
                </div>

                {/* Member Range */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/60">Üye Sayısı</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={memberRange.max}
                      onChange={(e) => setMemberRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-white/40">
                      <span>{memberRange.min.toLocaleString()}</span>
                      <span>{memberRange.max.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/60">Kuruluş Tarihi</h3>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateRange.min.split('T')[0]}
                      onChange={(e) => setDateRange(prev => ({ ...prev, min: new Date(e.target.value).toISOString() }))}
                      className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                    <input
                      type="date"
                      value={dateRange.max.split('T')[0]}
                      onChange={(e) => setDateRange(prev => ({ ...prev, max: new Date(e.target.value).toISOString() }))}
                      className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Sort Options */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sonuçlar</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Server Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Server cards will be mapped here */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <div className="aspect-video relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <img
                        src={`https://picsum.photos/seed/${i}/400/300`}
                        alt="Server Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-4 right-4 z-20">
                        <h3 className="text-lg font-semibold truncate">Örnek Sunucu {i + 1}</h3>
                        <p className="text-sm text-white/60 line-clamp-2">Bu bir örnek sunucu açıklamasıdır.</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <Users className="w-4 h-4" />
                        <span>{Math.floor(Math.random() * 10000).toLocaleString()}</span>
                      </div>
                      <button className="px-4 py-1.5 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors">
                        Katıl
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
