'use client';

import Image from 'next/image';
import { Volume2, MicOff, Headphones, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/app/lib/api';
import Cookies from 'js-cookie'; // token'ı çekmek için

export default function MiniProfile() {
  type VoiceStatus = 'connected' | 'muted' | 'deafened' | 'disconnected';

  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) return;

    getUserProfile(token).then(setProfile).catch((err) => {
      console.error('Profil çekilemedi:', err);
    });
  }, []);

  if (!profile) return null;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${profile.username?.charAt(0).toUpperCase()}&background=444&color=fff&bold=true&size=64`;

  return (
    <div className="mt-auto p-4 bg-gradient-to-b from-transparent to-black/20 border-t border-white/5 backdrop-blur-md">
      {/* Ses Kontrolleri */}
      <div className="group relative p-3.5 bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-2xl mb-4 hover:from-orange-500/15 hover:to-amber-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-orange-500 bg-opacity-15 flex items-center justify-center">
              <Volume2 size={20} className="text-orange-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 ring-2 ring-[var(--surface)] shadow-md flex items-center justify-center">
              <span className="block w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-white transition-colors">
                Sohbet Odası 1
              </p>
              <span className="text-[10px] font-medium text-[var(--text-secondary)] bg-black/20 px-2 py-0.5 rounded-full">
                14ms
              </span>
            </div>
            <p className="text-xs font-medium text-green-400">
              Sesli sohbete bağlı
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <button
              className={`group/btn relative p-2.5 rounded-xl transition-all hover:bg-white/10 text-[var(--text-secondary)] hover:text-white`}
              title="Sesi Kapat"
            >
              <Headphones size={18} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/90 text-white text-[10px] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                Sesi Kapat
              </span>
            </button>
            <button
              className={`group/btn relative p-2.5 rounded-xl transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20`}
              title="Mikrofonu Aç"
            >
              <MicOff size={18} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/90 text-white text-[10px] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                Mikrofonu Aç
              </span>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-orange-900 ring-2 ring-[var(--surface)] flex items-center justify-center">
                <span className="text-[10px] font-medium text-orange-500">D</span>
              </span>
              <span className="w-5 h-5 rounded-full bg-orange-900 ring-2 ring-[var(--surface)] flex items-center justify-center">
                <span className="text-[10px] font-medium text-orange-500">A</span>
              </span>
              <span className="w-5 h-5 rounded-full bg-orange-900 ring-2 ring-[var(--surface)] flex items-center justify-center">
                <span className="text-[10px] font-medium text-orange-500">M</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Kullanıcı Bilgileri */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/10 transition-transform group-hover:scale-105">
            <Image
              src={profile.avatar_id ? profile.avatar_id : fallbackAvatar}
              alt={profile.username}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-[2.5px] border-[var(--surface)] shadow-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-white transition-colors">
            {profile.username}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <p className="text-xs text-[var(--text-secondary)]">Çevrimiçi</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-2.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-all hover:text-white hover:scale-105 active:scale-95"
            title="Ayarlar"
            onClick={() => router.push('/settings')}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
