'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Users, Bell, Globe } from 'lucide-react';
import Link from 'next/link';

interface PrivacyOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  options: string[];
  defaultOption: string;
}

const privacyOptions: PrivacyOption[] = [
  {
    id: 'profile-visibility',
    title: 'Profil Görünürlüğü',
    description: 'Profilinizi kimlerin görebileceğini seçin',
    icon: Eye,
    options: ['Herkes', 'Sadece Arkadaşlar', 'Gizli'],
    defaultOption: 'Herkes'
  },
  {
    id: 'friend-requests',
    title: 'Arkadaşlık İstekleri',
    description: 'Kimler size arkadaşlık isteği gönderebilir',
    icon: Users,
    options: ['Herkes', 'Arkadaşların Arkadaşları', 'Kimse'],
    defaultOption: 'Herkes'
  },
  {
    id: 'activity-status',
    title: 'Aktivite Durumu',
    description: 'Çevrimiçi durumunuzu ve aktivitelerinizi kimler görebilir',
    icon: Bell,
    options: ['Herkes', 'Sadece Arkadaşlar', 'Kimse'],
    defaultOption: 'Sadece Arkadaşlar'
  },
  {
    id: 'message-requests',
    title: 'Mesaj İstekleri',
    description: 'Kimler size doğrudan mesaj gönderebilir',
    icon: Globe,
    options: ['Herkes', 'Sadece Arkadaşlar', 'Kimse'],
    defaultOption: 'Sadece Arkadaşlar'
  }
];

export default function PrivacySettings() {
  const [settings, setSettings] = useState(
    Object.fromEntries(
      privacyOptions.map(option => [option.id, option.defaultOption])
    )
  );

  const handleSettingChange = (id: string, value: string) => {
    setSettings(prev => ({ ...prev, [id]: value }));
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
              <Shield className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Gizlilik Ayarları</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {privacyOptions.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">{option.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{option.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {option.options.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleSettingChange(option.id, value)}
                        className={`
                          px-4 py-2 rounded-lg text-sm
                          transition-colors duration-200
                          ${settings[option.id] === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
