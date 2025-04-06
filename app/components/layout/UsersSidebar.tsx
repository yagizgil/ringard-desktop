'use client';

import Image from 'next/image';
import { ChevronDown, ChevronRight, Timer, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'online' | 'idle' | 'dnd' | 'offline';

interface OnlineUser {
  id: number;
  name: string;
  avatar: string;
  status: Status;
  activity?: string;
  time?: string;
  theme: {
    from: string;
    to: string;
    image: string;
  };
}

interface FRIEND_REQUESTS {
  id: number;
  name: string;
  avatar: string;
}

const FRIEND_REQUESTS: FRIEND_REQUESTS[] = [
  {
    id: 101,
    name: "Selin Koç",
    avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&q=80",
  },
  {
    id: 102,
    name: "Baran Yiğit",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&q=80",
  }
];

const STATUS_COLORS: Record<Status, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500'
};

const ONLINE_USERS: OnlineUser[] = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&q=80",
    status: "online",
    activity: "Valorant oynuyor",
    time: "2 saat",
    theme: {
      from: "from-violet-500",
      to: "to-fuchsia-500",
      image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=400&q=80"
    }
  },
  {
    id: 2,
    name: "Merve Demir",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80",
    status: "idle",
    activity: "League of Legends oynuyor",
    time: "45 dakika",
    theme: {
      from: "from-blue-500",
      to: "to-cyan-500",
      image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=400&q=80"
    }
  },
  {
    id: 3,
    name: "Can Kaya",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80",
    status: "dnd",
    activity: "CS:GO 2 oynuyor",
    time: "3 saat",
    theme: {
      from: "from-orange-500",
      to: "to-red-500",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=400&q=80"
    }
  },
  {
    id: 4,
    name: "Zeynep Ak",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=80",
    status: "online",
    activity: "Minecraft oynuyor",
    time: "1 saat",
    theme: {
      from: "from-green-500",
      to: "to-emerald-500",
      image: "https://images.unsplash.com/photo-1628277613967-6abca504d0ac?w=800&h=400&q=80"
    }
  }
];

export default function UsersSidebar() {
  const router = useRouter();
  const [openRequests, setOpenRequests] = useState(false);
  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--card)]">
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Çevrimiçi — {ONLINE_USERS.length}
        </h2>
      </div>

      {/* 🔽 Arkadaşlık İstekleri */}
      <div className="px-4 py-2 border-b border-[var(--card)] cursor-pointer select-none flex items-center justify-between hover:bg-white/5 transition" onClick={() => setOpenRequests(!openRequests)}>
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Arkadaşlık İstekleri — {FRIEND_REQUESTS.length}
        </h2>
        {openRequests ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>

      {openRequests && (
        <div className="px-4 py-3 space-y-3 border-b border-[var(--card)]">
        {FRIEND_REQUESTS.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-xl p-3 shadow-sm border border-white/10"
          >
            {/* Sol taraf - avatar + isim */}
            <div className="flex items-center gap-3">
              <Image
                src={req.avatar}
                alt={req.name}
                width={40}
                height={40}
                className="rounded-full object-cover ring-2 ring-white/10 max-w-10 max-h-10 w-full h-full"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {req.name}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">3 ortak</span>
              </div>
            </div>
      
            {/* Sağ taraf - butonlar */}
            <div className="flex gap-2">
              <button
                onClick={() => console.log('Accepted', req.id)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-300 transition"
                title="Kabul Et"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => console.log('Rejected', req.id)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
                title="Reddet"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Users List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2">
        {ONLINE_USERS.map((user) => (
          <div 
            key={user.id}
            className="group px-2 mx-2"
          >
            <div className="relative overflow-hidden rounded-xl">
              {/* Background Image & Gradient */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <Image
                  src={user.theme.image}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${user.theme.from} ${user.theme.to} opacity-10 group-hover:opacity-20 transition-opacity`} />

              {/* Content */}
              <button onClick={() => router.push(`/profile/${user.id}`)} className="relative p-3">
                <div className="flex items-center gap-3">
                  {/* Avatar & Status */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] ${STATUS_COLORS[user.status]}`}
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {user.name}
                      </h3>
                      {user.time && (
                        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                          <Timer size={10} className="flex-shrink-0" />
                          <span>{user.time}</span>
                        </div>
                      )}
                    </div>
                    {user.activity && (
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                        {user.activity}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
