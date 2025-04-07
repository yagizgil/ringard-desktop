'use client';

import Image from 'next/image';
import { Plus, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SERVERS = [
  {
    id: 1,
    name: "Gaming Hub",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=100&h=100&q=80",
    notifications: 3,
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: 2,
    name: "Yazılımcılar",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&q=80",
    notifications: 0,
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: 3,
    name: "Film & Dizi",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=100&q=80",
    notifications: 5,
    color: "from-pink-500 to-rose-600"
  },
  {
    id: 4,
    name: "Müzik Severler",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&q=80",
    notifications: 0,
    color: "from-amber-500 to-orange-600"
  }
];

interface ServerSidebarProps {
  onOpenModal: () => void;
}

export default function ServerSidebar({ onOpenModal }: ServerSidebarProps) {
  const router = useRouter();


  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[var(--surface)] z-0">
        <div className="absolute inset-0 opacity-15 bg-gradient-to-b from-orange-500 via-purple-500 to-transparent animate-pulse" 
             style={{ animationDuration: '6s' }} />
        {/* Removed the border right that was causing issues */}
      </div>
      
      {/* Content container - all existing content goes here with z-10 */}
      <div className="flex flex-col h-full z-10 relative">
        {/* Top section */}
        <div className="flex flex-col items-center pt-4">
          {/* Home Button */}
          <button onClick={() => router.push('/')} className="relative group mb-4">
            <div className="w-12 h-12 rounded-[16px] bg-[var(--card)] hover:rounded-[12px] transition-all duration-300 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo/logo.png"
                alt="Your Profile"
                width={32}
                height={32}
                className="rounded-[8px] transition-transform group-hover:scale-110"
              />
            </div>
            <div className="absolute left-0 -ml-2 w-1 h-8 bg-white rounded-r-full top-1/2 -translate-y-1/2 transition-all scale-0 group-hover:scale-100" />
            <div className="pointer-events-none absolute left-16 px-3 py-2 bg-[var(--surface)] text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Direct Messages
            </div>
          </button>

          <div className="w-8 h-[2px] bg-[var(--card)] rounded-full mx-auto mb-2" />
        </div>

        {/* Scrollable server list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col items-center gap-3 py-2">
            {SERVERS.map((server) => (
              <button
                key={server.id}
                onClick={() => router.push(`/server/${server.id}/channel/123123`)}
                className="relative group"
              >
                <div className="w-12 h-12 rounded-[16px] hover:rounded-[12px] transition-all duration-300 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity group-hover:opacity-100"
                       style={{ backgroundImage: `linear-gradient(to bottom right, var(--${server.color}))` }} />
                  <Image
                    src={server.image}
                    alt={server.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 group-hover:rotate-3"
                  />
                </div>
                {server.notifications > 0 && (
                  <div className="absolute -right-1 -bottom-1 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-medium px-1.5">
                    {server.notifications}
                  </div>
                )}
                <div className="absolute left-0 -ml-2 w-1 h-8 bg-white rounded-r-full top-1/2 -translate-y-1/2 transition-all scale-0 group-hover:scale-100" />
                <div className="pointer-events-none absolute left-16 px-3 py-2 bg-[var(--surface)] text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                  {server.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fixed bottom section */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <div className="w-8 h-[2px] bg-[var(--card)] rounded-full mx-auto mb-4" />

          <div className="flex flex-col items-center gap-3">
            <button onClick={onOpenModal} className="relative group">
              <div className="w-12 h-12 rounded-[16px] bg-[var(--card)] hover:rounded-[12px] hover:bg-green-500 transition-all duration-300 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
              </div>
              <div className="absolute left-0 -ml-2 w-1 h-8 bg-white rounded-r-full top-1/2 -translate-y-1/2 transition-all scale-0 group-hover:scale-100" />
              <div className="pointer-events-none absolute left-16 px-3 py-2 bg-[var(--surface)] text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                Sunucu Ekle
              </div>
            </button>

            <button onClick={() => router.push('/explore')} className="relative group">
              <div className="w-12 h-12 rounded-[16px] bg-[var(--card)] hover:rounded-[12px] hover:bg-blue-500 transition-all duration-300 flex items-center justify-center">
                <Compass className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
              </div>
              <div className="absolute left-0 -ml-2 w-1 h-8 bg-white rounded-r-full top-1/2 -translate-y-1/2 transition-all scale-0 group-hover:scale-100" />
              <div className="pointer-events-none absolute left-16 px-3 py-2 bg-[var(--surface)] text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                Keşfet
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
