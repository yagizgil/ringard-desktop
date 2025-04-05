'use client';

import { useState } from 'react';
import { useMemberModal } from '@/app/context/MemberModalContext';
import { Member } from '@/app/types/member';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Crown, Shield, CircleUserRound } from 'lucide-react';
import Image from 'next/image';

// Tip tanımlamaları
interface Role {
  id: string;
  name: string;
  color: string;
  icon: 'admin' | 'mod' | 'member';
  members: Member[];
}

// Örnek veriler
const ROLES: Role[] = [
  {
    id: '1',
    name: 'Yöneticiler',
    color: '#ff6b6b',
    icon: 'admin',
    members: [
      {
        id: '1',
        name: 'Ayşe Kaya',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
        banner: '/background/market.jpg',
        status: 'online',
        customStatus: '🎮 Valorant oynuyor',
        activity: 'Gaming',
        friendCount: 245,
        postCount: 123,
        mutualFriends: [
          {
            id: '2',
            name: 'Mehmet Yılmaz',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
            status: 'online',
            activity: 'Working'
          },
          {
            id: '3',
            name: 'Zeynep Demir',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
            status: 'idle',
            activity: 'Listening'
          }
        ],
        mutualServers: [
          {
            id: 's1',
            name: 'Gaming TR',
            icon: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&q=80'
          },
          {
            id: 's2',
            name: 'Kod Kulübü',
            icon: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&q=80'
          }
        ]
      },
      {
        id: '2',
        name: 'Mehmet Demir',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
        banner: '/background/market.jpg',
        status: 'idle',
        activity: 'Coding',
        friendCount: 189,
        postCount: 87,
        mutualFriends: [
          {
            id: '3',
            name: 'Zeynep Demir',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
            status: 'idle',
            activity: 'Listening'
          }
        ],
        mutualServers: [
          {
            id: 's2',
            name: 'Kod Kulübü',
            icon: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&q=80'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Moderatörler',
    color: '#4dabf7',
    icon: 'mod',
    members: [
      {
        id: '3',
        name: 'Zeynep Demir',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
        banner: '/background/market.jpg',
        status: 'online',
        customStatus: '🎵 Müzik dinliyor',
        activity: 'Listening',
        friendCount: 156,
        postCount: 45,
        mutualFriends: [
          {
            id: '1',
            name: 'Ayşe Kaya',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
            status: 'online',
            activity: 'Gaming'
          }
        ],
        mutualServers: [
          {
            id: 's1',
            name: 'Gaming TR',
            icon: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&q=80'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Üyeler',
    color: '#82c91e',
    icon: 'member',
    members: [
      {
        id: '4',
        name: 'Can Özkan',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&q=100',
        status: 'online',
        friendCount: 78,
        postCount: 12,
        mutualFriends: [],
        mutualServers: []
      }
    ]
  }
];

export default function MembersSidebar() {
  const { setSelectedMember, setIsModalOpen } = useMemberModal();

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full bg-gradient-to-b from-[var(--surface)] to-[var(--card)] backdrop-blur-xl overflow-y-auto">
      <div className="p-4 space-y-6">
        {ROLES.map((role) => (
          <div key={role.id} className="space-y-3">
            {/* Rol Başlığı */}
            <div 
              className="
                flex items-center gap-2 px-3 py-2
                bg-white/5 backdrop-blur-sm rounded-lg
                border-l-4 transition-all duration-300
              "
              style={{ borderLeftColor: role.color }}
            >
              {role.icon === 'admin' && <Crown size={16} className="text-yellow-400" />}
              {role.icon === 'mod' && <Shield size={16} className="text-blue-400" />}
              {role.icon === 'member' && <CircleUserRound size={16} className="text-green-400" />}
              
              <span className="text-sm font-medium text-white">
                {role.name}
              </span>
              <span className="
                text-xs text-white/60 
                bg-white/10 px-2 py-0.5 rounded-full ml-auto
              ">
                {role.members.length}
              </span>
            </div>

            {/* Üye Kartları */}
            <div className="pl-2 space-y-3">
              {role.members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="group cursor-pointer"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="
                    relative overflow-hidden
                    bg-gradient-to-br from-white/10 to-white/5
                    backdrop-blur-lg rounded-xl p-3
                    transition-all duration-300
                    hover:bg-white/15 hover:scale-102 hover:translate-x-1
                    border border-white/10
                  ">
                    {/* Durum Göstergesi */}
                    <div className={`
                      absolute top-2 right-2 w-2 h-2 rounded-full
                      ${member.status === 'online' ? 'bg-green-400' :
                        member.status === 'idle' ? 'bg-yellow-400' :
                        member.status === 'dnd' ? 'bg-red-400' :
                        'bg-gray-400'
                      }
                    `} />

                    {/* Kullanıcı Bilgileri */}
                    <div className="flex items-start gap-3">
                      <div className="relative max-h-10 max-w-10">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={300}
                          height={300}
                          className="rounded-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-sm font-medium truncate">
                          {member.name}
                        </h3>
                        
                        {(member.customStatus || member.activity) && (
                          <div className="
                            text-xs text-white/60
                            truncate
                          ">
                            {member.customStatus || member.activity}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
