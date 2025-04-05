'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, MessageSquare, UserPlus, AtSign, Globe, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  enabled: boolean;
  sound: boolean;
}

const initialSettings: NotificationSetting[] = [
  {
    id: 'direct-messages',
    title: 'Direkt Mesajlar',
    description: 'Özel mesajlar için bildirim alın',
    icon: <MessageSquare className="w-5 h-5" />,
    enabled: true,
    sound: true
  },
  {
    id: 'friend-requests',
    title: 'Arkadaşlık İstekleri',
    description: 'Yeni arkadaşlık istekleri için bildirim alın',
    icon: <UserPlus className="w-5 h-5" />,
    enabled: true,
    sound: true
  },
  {
    id: 'mentions',
    title: 'Bahsedilmeler',
    description: 'Birisi sizi etiketlediğinde bildirim alın',
    icon: <AtSign className="w-5 h-5" />,
    enabled: true,
    sound: true
  },
  {
    id: 'community',
    title: 'Topluluk Bildirimleri',
    description: 'Topluluk etkinlikleri için bildirim alın',
    icon: <Globe className="w-5 h-5" />,
    enabled: false,
    sound: false
  },
  {
    id: 'game-invites',
    title: 'Oyun Davetleri',
    description: 'Oyun davetleri için bildirim alın',
    icon: <Gamepad2 className="w-5 h-5" />,
    enabled: true,
    sound: false
  }
];

export default function PushNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings);

  const handleToggle = (id: string, type: 'enabled' | 'sound') => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, [type]: !setting[type] }
          : setting
      )
    );
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
              <Bell className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Push Bildirimleri</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Global Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-blue-400 font-medium">Tüm Push Bildirimleri</h3>
                <p className="mt-1 text-sm text-blue-400/80">
                  Tüm bildirimleri tek bir yerden yönetin
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.some(s => s.enabled)}
                  onChange={() => {
                    const someEnabled = settings.some(s => s.enabled);
                    setSettings(prev =>
                      prev.map(setting => ({ ...setting, enabled: !someEnabled }))
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
          </motion.div>

          {/* Notification Settings */}
          <div className="space-y-4">
            {settings.map((setting) => (
              <motion.div
                key={setting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/5">
                    {setting.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-white font-medium">{setting.title}</h3>
                        <p className="mt-1 text-sm text-white/60">{setting.description}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Sound Toggle */}
                        <button
                          onClick={() => handleToggle(setting.id, 'sound')}
                          className={`
                            p-2 rounded-lg transition-colors
                            ${setting.sound
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-white/5 text-white/40 hover:text-white/60'
                            }
                          `}
                        >
                          <Bell className="w-4 h-4" />
                        </button>

                        {/* Enable/Disable Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.enabled}
                            onChange={() => handleToggle(setting.id, 'enabled')}
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
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-white/60 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Push Bildirimleri Hakkında:
                </p>
                <ul className="text-sm text-white/60 list-disc list-inside space-y-1">
                  <li>Bildirimleri istediğiniz zaman açıp kapatabilirsiniz</li>
                  <li>Her bildirim türü için ses ayarını özelleştirebilirsiniz</li>
                  <li>Rahatsız etme modunu kullanarak bildirimleri geçici olarak susturabilirsiniz</li>
                  <li>Bildirimler tarayıcınız kapalıyken de çalışır</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
