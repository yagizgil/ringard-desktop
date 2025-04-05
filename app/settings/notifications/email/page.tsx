'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Shield, Gift, MessageSquare, UserPlus, Bell, Settings } from 'lucide-react';
import Link from 'next/link';

interface EmailSetting {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  enabled: boolean;
  category: 'security' | 'social' | 'updates';
}

const initialSettings: EmailSetting[] = [
  {
    id: 'security-alerts',
    title: 'Güvenlik Uyarıları',
    description: 'Hesabınızla ilgili önemli güvenlik bildirimleri',
    icon: <Shield className="w-5 h-5" />,
    enabled: true,
    category: 'security'
  },
  {
    id: 'login-alerts',
    title: 'Giriş Bildirimleri',
    description: 'Yeni bir cihazdan giriş yapıldığında bildirim alın',
    icon: <Settings className="w-5 h-5" />,
    enabled: true,
    category: 'security'
  },
  {
    id: 'direct-messages',
    title: 'Direkt Mesajlar',
    description: 'Yeni mesajlar için e-posta bildirimi alın',
    icon: <MessageSquare className="w-5 h-5" />,
    enabled: false,
    category: 'social'
  },
  {
    id: 'friend-requests',
    title: 'Arkadaşlık İstekleri',
    description: 'Yeni arkadaşlık istekleri için bildirim alın',
    icon: <UserPlus className="w-5 h-5" />,
    enabled: true,
    category: 'social'
  },
  {
    id: 'special-offers',
    title: 'Özel Teklifler',
    description: 'Size özel kampanya ve indirimlerden haberdar olun',
    icon: <Gift className="w-5 h-5" />,
    enabled: false,
    category: 'updates'
  },
  {
    id: 'newsletter',
    title: 'Bülten',
    description: 'Haftalık güncellemeler ve yenilikler',
    icon: <Mail className="w-5 h-5" />,
    enabled: false,
    category: 'updates'
  }
];

export default function EmailNotificationSettings() {
  const [settings, setSettings] = useState<EmailSetting[]>(initialSettings);
  const [emailFrequency, setEmailFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');

  const handleToggle = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const categories = {
    security: {
      title: 'Güvenlik',
      description: 'Hesap güvenliği ile ilgili e-postalar'
    },
    social: {
      title: 'Sosyal',
      description: 'Arkadaşlar ve mesajlarla ilgili bildirimler'
    },
    updates: {
      title: 'Güncellemeler',
      description: 'Platform güncellemeleri ve özel teklifler'
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
              <Mail className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">E-posta Bildirimleri</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Email Frequency */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="text-blue-400 font-medium mb-4">E-posta Sıklığı</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['instant', 'daily', 'weekly'] as const).map((frequency) => (
                <button
                  key={frequency}
                  onClick={() => setEmailFrequency(frequency)}
                  className={`
                    p-3 rounded-lg text-sm font-medium
                    ${emailFrequency === frequency
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }
                    transition-colors
                  `}
                >
                  {frequency === 'instant' && 'Anında'}
                  {frequency === 'daily' && 'Günlük Özet'}
                  {frequency === 'weekly' && 'Haftalık Özet'}
                </button>
              ))}
            </div>
          </div>

          {/* Settings by Category */}
          {(Object.entries(categories) as [keyof typeof categories, typeof categories[keyof typeof categories]][]).map(([category, info]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">{info.title}</h2>
                  <p className="text-sm text-white/60">{info.description}</p>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.filter(s => s.category === category).some(s => s.enabled)}
                    onChange={() => {
                      const categorySettings = settings.filter(s => s.category === category);
                      const someEnabled = categorySettings.some(s => s.enabled);
                      setSettings(prev =>
                        prev.map(setting =>
                          setting.category === category
                            ? { ...setting, enabled: !someEnabled }
                            : setting
                        )
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="
                    w-11 h-6 rounded-full
                    bg-white/10 peer-checked:bg-blue-500
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5
                    after:transition-all peer-checked:after:translate-x-full
                  "></div>
                </label>
              </div>

              <div className="space-y-3">
                {settings
                  .filter(setting => setting.category === category)
                  .map((setting) => (
                    <motion.div
                      key={setting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white/5">
                            {setting.icon}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{setting.title}</h3>
                            <p className="mt-1 text-sm text-white/60">{setting.description}</p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.enabled}
                            onChange={() => handleToggle(setting.id)}
                            className="sr-only peer"
                          />
                          <div className="
                            w-11 h-6 rounded-full
                            bg-white/10 peer-checked:bg-blue-500
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                            after:bg-white after:rounded-full after:h-5 after:w-5
                            after:transition-all peer-checked:after:translate-x-full
                          "></div>
                        </label>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-white/60 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  E-posta Bildirimleri Hakkında:
                </p>
                <ul className="text-sm text-white/60 list-disc list-inside space-y-1">
                  <li>Güvenlik bildirimleri her zaman anında gönderilir</li>
                  <li>Özet e-postaları seçtiğiniz sıklıkta gönderilir</li>
                  <li>E-posta tercihlerinizi istediğiniz zaman güncelleyebilirsiniz</li>
                  <li>Abonelikten çıkmak için bildirimleri tamamen kapatabilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
