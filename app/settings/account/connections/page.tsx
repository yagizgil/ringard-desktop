'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Connection {
  id: string;
  name: string;
  icon: string;
  color: string;
  isConnected: boolean;
  username?: string;
  description: string;
}

const connections: Connection[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '/connections/spotify.svg',
    color: '#1DB954',
    isConnected: false,
    description: 'Dinlediğiniz müzikleri profilinizde gösterin'
  },
  {
    id: 'google',
    name: 'Google',
    icon: '/connections/google.svg',
    color: '#4285F4',
    isConnected: true,
    username: 'ayse.kaya@gmail.com',
    description: 'Google hesabınızla giriş yapın'
  },
  {
    id: 'kick',
    name: 'Kick',
    icon: '/connections/kick.svg',
    color: '#53FC18',
    isConnected: false,
    description: 'Yayınlarınızı profilinizde paylaşın'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '/connections/youtube.svg',
    color: '#FF0000',
    isConnected: true,
    username: 'Ayşe Kaya',
    description: 'YouTube içeriklerinizi profilinizde gösterin'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '/connections/instagram.svg',
    color: '#E4405F',
    isConnected: false,
    description: 'Instagram gönderilerinizi paylaşın'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '/connections/github.svg',
    color: '#181717',
    isConnected: true,
    username: 'aysekaya',
    description: 'GitHub profilinizi bağlayın'
  },
  {
    id: 'steam',
    name: 'Steam',
    icon: '/connections/steam.svg',
    color: '#000000',
    isConnected: false,
    description: 'Oyun aktivitelerinizi paylaşın'
  }
];

export default function ConnectionsSettings() {
  const [connectedAccounts, setConnectedAccounts] = useState<Connection[]>(connections);

  const handleConnection = (id: string) => {
    setConnectedAccounts(prev => 
      prev.map(account => 
        account.id === id 
          ? { ...account, isConnected: !account.isConnected, username: account.isConnected ? undefined : 'Bağlanıyor...' }
          : account
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
              <LinkIcon className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Bağlı Hesaplar</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-white/60">
            Sosyal medya ve oyun hesaplarınızı bağlayarak profilinizi zenginleştirin ve daha fazla özelliğe erişin.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {connectedAccounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  p-4 rounded-2xl border
                  ${account.isConnected 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/5 border-white/10'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                    <Image
                      src={account.icon}
                      alt={account.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-white">{account.name}</h3>
                      {account.isConnected && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                          Bağlı
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-white/60">{account.description}</p>
                    
                    {account.isConnected && account.username && (
                      <p className="mt-2 text-sm text-white/80">
                        {account.username}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleConnection(account.id)}
                    style={{ 
                      backgroundColor: account.isConnected ? 'transparent' : account.color,
                      borderColor: account.color
                    }}
                    className={`
                      px-4 py-1.5 rounded-lg text-sm font-medium
                      transition-colors duration-200
                      ${account.isConnected
                        ? 'border text-white/80 hover:bg-white/10'
                        : 'text-white hover:opacity-90'
                      }
                    `}
                  >
                    {account.isConnected ? 'Bağlantıyı Kes' : 'Bağlan'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-3">
              <LinkIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-400">
                Bağladığınız hesaplar profilinizde görünür olacak ve diğer kullanıcılar tarafından görüntülenebilecektir.
                Dilediğiniz zaman bağlantıyı kesebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
