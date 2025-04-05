'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Type, Volume2, Eye, FileText, Film, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface ContentSetting {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  options: string[];
  value: string;
  category: 'text' | 'media';
}

const initialSettings: ContentSetting[] = [
  {
    id: 'font-size',
    title: 'Yazı Boyutu',
    description: 'Metin içeriği için yazı boyutunu ayarlayın',
    icon: <Type className="w-5 h-5" />,
    options: ['Küçük', 'Orta', 'Büyük'],
    value: 'Orta',
    category: 'text'
  },
  {
    id: 'message-display',
    title: 'Mesaj Görünümü',
    description: 'Mesajların nasıl görüntüleneceğini seçin',
    icon: <MessageSquare className="w-5 h-5" />,
    options: ['Kompakt', 'Normal', 'Rahat'],
    value: 'Normal',
    category: 'text'
  },
  {
    id: 'link-preview',
    title: 'Bağlantı Önizlemesi',
    description: 'Paylaşılan bağlantıların önizlemesini göster',
    icon: <FileText className="w-5 h-5" />,
    options: ['Kapalı', 'Sadece Başlık', 'Tam Önizleme'],
    value: 'Tam Önizleme',
    category: 'text'
  },
  {
    id: 'image-quality',
    title: 'Görüntü Kalitesi',
    description: 'Görüntülerin yüklenme kalitesini ayarlayın',
    icon: <ImageIcon className="w-5 h-5" />,
    options: ['Düşük', 'Orta', 'Yüksek'],
    value: 'Yüksek',
    category: 'media'
  },
  {
    id: 'video-quality',
    title: 'Video Kalitesi',
    description: 'Video oynatma kalitesini ayarlayın',
    icon: <Film className="w-5 h-5" />,
    options: ['Otomatik', '720p', '1080p'],
    value: 'Otomatik',
    category: 'media'
  },
  {
    id: 'autoplay',
    title: 'Otomatik Oynatma',
    description: 'Medya içeriğinin otomatik oynatılmasını yönetin',
    icon: <Volume2 className="w-5 h-5" />,
    options: ['Kapalı', 'Sadece Wi-Fi', 'Her Zaman'],
    value: 'Sadece Wi-Fi',
    category: 'media'
  }
];

export default function ContentSettings() {
  const [settings, setSettings] = useState<ContentSetting[]>(initialSettings);

  const handleSettingChange = (id: string, value: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, value }
          : setting
      )
    );
  };

  const categories = {
    text: {
      title: 'Metin Ayarları',
      description: 'Metin görünümü ve formatı ile ilgili tercihler',
      icon: <Type className="w-6 h-6 text-white" />
    },
    media: {
      title: 'Medya Ayarları',
      description: 'Görüntü ve video tercihleri',
      icon: <ImageIcon className="w-6 h-6 text-white" />
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--surface)] to-[var(--card)]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--surface)]/80 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Metin ve Medya</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Settings by Category */}
          {(Object.entries(categories) as [keyof typeof categories, typeof categories[keyof typeof categories]][]).map(([category, info]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  {info.icon}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">{info.title}</h2>
                  <p className="text-sm text-white/60">{info.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {settings
                  .filter(setting => setting.category === category)
                  .map((setting) => (
                    <motion.div
                      key={setting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white/5">
                            {setting.icon}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{setting.title}</h3>
                            <p className="mt-1 text-sm text-white/60">{setting.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {setting.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleSettingChange(setting.id, option)}
                              className={`
                                p-2 rounded-lg text-sm font-medium
                                ${setting.value === option
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }
                                transition-colors
                              `}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex gap-3">
              <Eye className="w-5 h-5 text-white/60 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Metin ve Medya Ayarları Hakkında:
                </p>
                <ul className="text-sm text-white/60 list-disc list-inside space-y-1">
                  <li>Ayarlar anında uygulanır ve otomatik olarak kaydedilir</li>
                  <li>Medya kalitesi ayarları internet kullanımınızı etkileyebilir</li>
                  <li>Yazı boyutu değişiklikleri tüm metin içeriğine uygulanır</li>
                  <li>Otomatik oynatma ayarları veri kullanımınızı etkileyebilir</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
