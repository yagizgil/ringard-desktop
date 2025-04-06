'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { deleteCookie } from 'cookies-next';
import {
  User,
  Bell,
  Shield,
  Palette,
  Volume2,
  MessageSquare,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Ayar kategorileri
const settingsCategories = [
  {
    id: 'account',
    name: 'Hesap',
    icon: User,
    items: [
      { id: 'profile', name: 'Profil', description: 'Profil bilgilerinizi düzenleyin', path: '/settings/account/profile' },
      { id: 'privacy', name: 'Gizlilik', description: 'Gizlilik ayarlarınızı yönetin', path: '/settings/account/privacy' },
      { id: 'security', name: 'Güvenlik', description: '2FA ve güvenlik seçenekleri', path: '/settings/account/security' },
      { id: 'connections', name: 'Bağlı Hesaplar', description: 'Sosyal medya ve oyun hesaplarınızı yönetin', path: '/settings/account/connections' }
    ]
  },
  {
    id: 'notifications',
    name: 'Bildirimler',
    icon: Bell,
    items: [
      { id: 'push', name: 'Push Bildirimleri', description: 'Anlık bildirim tercihleri', path: '/settings/notifications/push' },
      { id: 'email', name: 'E-posta Bildirimleri', description: 'E-posta bildirim ayarları', path: '/settings/notifications/email' }
    ]
  },
  {
    id: 'privacy',
    name: 'Gizlilik ve Güvenlik',
    icon: Shield,
    items: [
      { id: 'blocking', name: 'Engelleme', description: 'Engellenen kullanıcıları yönetin', path: '/settings/privacy/blocking' },
      { id: 'data', name: 'Veri Gizliliği', description: 'Veri kullanım tercihleriniz', path: '/settings/privacy/data' }
    ]
  },
  {
    id: 'appearance',
    name: 'Görünüm',
    icon: Palette,
    items: [
      { id: 'theme', name: 'Tema', description: 'Karanlık ve aydınlık mod', path: '/settings/appearance/theme' },
      { id: 'layout', name: 'Düzen', description: 'Arayüz düzeni tercihleri', path: '/settings/appearance/layout' }
    ]
  },
  {
    id: 'sound',
    name: 'Ses',
    icon: Volume2,
    items: [
      { id: 'notifications', name: 'Bildirim Sesleri', description: 'Bildirim ses ayarları', path: '/settings/sound/notifications' },
      { id: 'calls', name: 'Arama Sesleri', description: 'Arama ses tercihleri', path: '/settings/sound/calls' }
    ]
  },
  {
    id: 'content',
    name: 'İçerik',
    icon: MessageSquare,
    items: [
      { id: 'content', name: 'Metin ve Medya', description: 'İçerik görüntüleme tercihleri', path: '/settings/content' }
    ]
  }
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState(settingsCategories[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const activeSettings = settingsCategories.find(cat => cat.id === activeCategory);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('refresh_token');
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    deleteCookie('user_id');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--surface)] to-[var(--card)]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--surface)]/80 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
              <span>Ana Sayfa</span>
            </Link>
            <h1 className="text-xl font-semibold text-white">Ayarlar</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme('system')}
              className={`p-2 rounded-xl ${theme === 'system' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-xl ${theme === 'light' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Sun className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Moon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={`
            lg:w-80 flex-shrink-0
            ${isMobileMenuOpen ? 'fixed inset-0 z-20 p-4 bg-[var(--surface)]' : 'hidden lg:block'}
          `}>
            <nav className="space-y-2">
              {settingsCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl
                    ${activeCategory === category.id ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}
                    transition-colors duration-200
                  `}
                >
                  <category.icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              ))}
              <hr className="border-white/10 my-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
                <span>Çıkış Yap</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="grid gap-4 sm:grid-cols-2">
              {activeSettings?.items.map(item => (
                <Link
                  key={item.id}
                  href={item.path || `#`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="
                      group p-4 rounded-2xl
                      bg-white/5 hover:bg-white/10
                      border border-white/10
                      transition-colors duration-200
                      cursor-pointer
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <p className="text-sm text-white/60 mt-1">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`
          lg:hidden fixed right-4 bottom-4
          p-4 rounded-full
          bg-blue-500 text-white
          shadow-lg shadow-blue-500/20
          ${isMobileMenuOpen ? 'hidden' : 'flex'}
        `}
      >
        <Smartphone className="w-6 h-6" />
      </button>
    </div>
  );
}
