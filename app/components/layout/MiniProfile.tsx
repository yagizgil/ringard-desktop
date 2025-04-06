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
    <div className="mt-auto p-3 bg-[var(--card)] border-t border-white/5">
      {/* Ses Kontrolleri */}
      <div className="flex items-center gap-2">
        <Volume2 size={20} className="self-center" />
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          Sohbet Odası 1
        </p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] transition-colors">
          <p className="text-sm font-medium text-green-500 truncate">
            Bağlı <span className="text-gray-400 text-xs">(14 ms)</span>
          </p>
        </button>
        <button
          className={`p-2 rounded-lg transition-colors bg-red-500/10 text-red-500 ml-auto`}
          title="Mikrofonu Aç"
        >
          <MicOff size={20} />
        </button>
        <button
          className={`p-2 rounded-lg transition-colors hover:bg-white/5 text-[var(--text-secondary)] `}
          title="Sesi Kapat"
        >
          <Headphones size={20} />
        </button>
      </div>

      {/* Kullanıcı Bilgileri */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={profile.avatar_id ? profile.avatar_id : fallbackAvatar}
              alt={profile.username}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--card)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {profile.username}
          </p>
          <p className="text-xs text-[var(--text-secondary)] truncate">Çevrimiçi</p>
        </div>
        <button
          className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
          title="Ayarlar"
          onClick={() => router.push('/settings')}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
