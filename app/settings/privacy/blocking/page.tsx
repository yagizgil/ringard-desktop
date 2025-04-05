'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Ban, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: string;
}

const initialBlockedUsers: BlockedUser[] = [
  {
    id: '1',
    name: 'Mehmet Yılmaz',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
    blockedAt: '2025-03-15'
  },
  {
    id: '2',
    name: 'Ayşe Demir',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
    blockedAt: '2025-04-01'
  }
];

export default function BlockingSettings() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(initialBlockedUsers);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUnblock = (userId: string) => {
    setBlockedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const filteredUsers = blockedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Ban className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Engellenen Kullanıcılar</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Engellenen kullanıcılarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 rounded-xl
                bg-white/5 border border-white/10
                text-white placeholder-white/40
                focus:outline-none focus:border-blue-500
              "
            />
          </div>

          {/* Blocked Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Ban className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">
                  {searchQuery ? 'Aradığınız kriterlere uygun kullanıcı bulunamadı.' : 'Henüz kimseyi engellememiş görünüyorsunuz.'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="
                    flex items-center justify-between p-4
                    bg-white/5 border border-white/10 rounded-xl
                    group hover:bg-white/10 transition-colors
                  "
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <p className="text-sm text-white/60">
                        Engellenme: {new Date(user.blockedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(user.id)}
                    className="
                      p-2 rounded-lg
                      text-white/60 hover:text-white
                      hover:bg-white/10
                      transition-colors
                    "
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex gap-3">
              <Ban className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-red-400">
                  Engellediğiniz kullanıcılar:
                </p>
                <ul className="text-sm text-red-400/80 list-disc list-inside space-y-1">
                  <li>Size mesaj gönderemezler</li>
                  <li>Arkadaşlık isteği gönderemezler</li>
                  <li>Profilinizi görüntüleyemezler</li>
                  <li>Sizi sunucularda göremezler</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
