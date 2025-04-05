'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Check, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfileSettings() {
  const [banner, setBanner] = useState('/background/market.jpg');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: 'ayşekaya',
    displayName: 'Ayşe Kaya',
    email: 'ayse@example.com',
    bio: 'Frontend Developer & UI Designer',
    customStatus: '🎮 Valorant oynuyor'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--surface)] to-[var(--card)]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--surface)]/80 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold text-white">Profil Ayarları</h1>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Kaydet</span>
              </button>
            </div>
          )}

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Düzenle
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Banner & Avatar */}
          <div className="relative">
            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
              <Image
                src={banner}
                alt="Banner"
                fill
                className="object-cover"
              />
              {isEditing && (
                <button className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="absolute -bottom-16 left-6 rounded-2xl overflow-hidden border-4 border-[var(--surface)]">
              <div className="relative w-32 h-32">
                <Image
                  src={avatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
                {isEditing && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="mt-20 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="
                    w-full px-4 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-white/40
                    focus:outline-none focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Görünen Ad
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="
                    w-full px-4 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-white/40
                    focus:outline-none focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="
                    w-full px-4 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-white/40
                    focus:outline-none focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Biyografi
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="
                    w-full px-4 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-white/40
                    focus:outline-none focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    resize-none
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Durum
                </label>
                <input
                  type="text"
                  name="customStatus"
                  value={formData.customStatus}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="
                    w-full px-4 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-white placeholder-white/40
                    focus:outline-none focus:border-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
