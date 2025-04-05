'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Download, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface PrivacyOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const privacyOptions: PrivacyOption[] = [
  {
    id: 'activity-tracking',
    title: 'Aktivite Takibi',
    description: 'Oyun ve uygulama aktivitelerinizin toplanmasına izin verin',
    enabled: true
  },
  {
    id: 'personalization',
    title: 'Kişiselleştirme',
    description: 'Deneyiminizi iyileştirmek için verilerinizin kullanılmasına izin verin',
    enabled: true
  },
  {
    id: 'analytics',
    title: 'Analitik',
    description: 'Anonim kullanım verilerinin toplanmasına izin verin',
    enabled: false
  },
  {
    id: 'marketing',
    title: 'Pazarlama',
    description: 'Kişiselleştirilmiş reklamlar ve teklifler alın',
    enabled: false
  }
];

export default function DataPrivacySettings() {
  const [options, setOptions] = useState<PrivacyOption[]>(privacyOptions);

  const handleToggle = (id: string) => {
    setOptions(prev =>
      prev.map(option =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
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
              <Shield className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Veri Gizliliği</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Privacy Options */}
          <div className="space-y-4">
            {options.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium">{option.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{option.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.enabled}
                      onChange={() => handleToggle(option.id)}
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

          {/* Data Management */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white">Veri Yönetimi</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <button className="
                p-4 rounded-xl
                bg-white/5 border border-white/10
                hover:bg-white/10 transition-colors
                flex items-center gap-3
              ">
                <Download className="w-5 h-5 text-white" />
                <div className="text-left">
                  <h3 className="text-white font-medium">Verilerimi İndir</h3>
                  <p className="text-sm text-white/60">Tüm verilerinizin bir kopyasını alın</p>
                </div>
              </button>

              <button className="
                p-4 rounded-xl
                bg-red-500/10 border border-red-500/20
                hover:bg-red-500/20 transition-colors
                flex items-center gap-3
              ">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <h3 className="text-red-400 font-medium">Hesabı Sil</h3>
                  <p className="text-sm text-red-400/80">Tüm verilerinizi kalıcı olarak silin</p>
                </div>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-yellow-400">
                  Veri Gizliliği Hakkında Önemli Bilgiler:
                </p>
                <ul className="text-sm text-yellow-400/80 list-disc list-inside space-y-1">
                  <li>Verileriniz güvenli sunucularda saklanır</li>
                  <li>Üçüncü taraflarla asla paylaşılmaz</li>
                  <li>İstediğiniz zaman verilerinizi indirebilir veya silebilirsiniz</li>
                  <li>Gizlilik ayarlarınızı dilediğiniz zaman güncelleyebilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
