'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Key, Smartphone, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface SecuritySection {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'enabled' | 'disabled' | 'warning';
  action: string;
}

const securitySections: SecuritySection[] = [
  {
    id: '2fa',
    title: 'İki Faktörlü Doğrulama',
    description: 'Hesabınızı daha güvenli hale getirmek için iki faktörlü doğrulamayı etkinleştirin',
    icon: Key,
    status: 'disabled',
    action: 'Etkinleştir'
  },
  {
    id: 'devices',
    title: 'Güvenilir Cihazlar',
    description: 'Hesabınıza bağlı olan cihazları yönetin',
    icon: Smartphone,
    status: 'enabled',
    action: 'Yönet'
  },
  {
    id: 'sessions',
    title: 'Aktif Oturumlar',
    description: 'Tüm aktif oturumlarınızı görüntüleyin ve yönetin',
    icon: Clock,
    status: 'warning',
    action: 'İncele'
  }
];

export default function SecuritySettings() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'text-green-400';
      case 'disabled':
        return 'text-white/60';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-white/60';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'Etkin';
      case 'disabled':
        return 'Devre Dışı';
      case 'warning':
        return 'Dikkat';
      default:
        return status;
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
              <Shield className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Güvenlik Ayarları</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Password Change Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white">Şifre Değiştir</h3>
                <p className="mt-1 text-sm text-white/60">
                  Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirin
                </p>

                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Şifre Değiştir
                  </button>
                ) : (
                  <div className="mt-4 space-y-4">
                    <input
                      type="password"
                      placeholder="Mevcut Şifre"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className="
                        w-full px-4 py-2 rounded-xl
                        bg-white/5 border border-white/10
                        text-white placeholder-white/40
                        focus:outline-none focus:border-blue-500
                      "
                    />
                    <input
                      type="password"
                      placeholder="Yeni Şifre"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className="
                        w-full px-4 py-2 rounded-xl
                        bg-white/5 border border-white/10
                        text-white placeholder-white/40
                        focus:outline-none focus:border-blue-500
                      "
                    />
                    <input
                      type="password"
                      placeholder="Yeni Şifre (Tekrar)"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="
                        w-full px-4 py-2 rounded-xl
                        bg-white/5 border border-white/10
                        text-white placeholder-white/40
                        focus:outline-none focus:border-blue-500
                      "
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Security Sections */}
          {securitySections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-white">{section.title}</h3>
                    <span className={`text-sm ${getStatusColor(section.status)}`}>
                      {getStatusText(section.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/60">{section.description}</p>
                  
                  <button
                    className="
                      mt-4 px-4 py-2 rounded-lg text-sm
                      bg-white/5 text-white
                      hover:bg-white/10 transition-colors
                    "
                  >
                    {section.action}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Security Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
          >
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-400">
                Hesap güvenliğinizi artırmak için iki faktörlü doğrulamayı etkinleştirmenizi öneririz.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
