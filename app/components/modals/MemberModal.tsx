'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  MessageSquare, 
  UserPlus, 
  Ban, 
  Crown, 
  Shield,
  Volume2,
  VolumeX,
  Gamepad,
  Briefcase,
  Music,
  Code,
  X,
  Users,
  Server,
  Hash
} from 'lucide-react';
import { useMemberModal } from '@/app/context/MemberModalContext';
import { useState } from 'react';

const activityIcons = {
  'Gaming': Gamepad,
  'Working': Briefcase,
  'Listening': Music,
  'Coding': Code
};

export default function MemberModal() {
  const { selectedMember, isModalOpen, setIsModalOpen, setSelectedMember } = useMemberModal();
  const [activeTab, setActiveTab] = useState<'friends' | 'servers'>('friends');

  if (!selectedMember) return null;

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMember(null), 200);
  };

  const getActivityIcon = (activity: string) => {
    const Icon = activityIcons[activity as keyof typeof activityIcons];
    return Icon ? <Icon size={14} /> : null;
  };

  const TabButton = ({ tab, label, icon: Icon }: { tab: 'friends' | 'servers'; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl
        ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/80'}
        transition-all duration-200
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="
              relative w-full max-w-2xl
              mx-4 rounded-2xl
              bg-gradient-to-b from-[var(--surface)] to-[var(--card)]
              border border-white/10 shadow-xl
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
          
            {/* Banner */}
            <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
              {selectedMember.banner && (
                <Image
                  src={selectedMember.banner || '/default-banner.jpg'}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 p-2 rounded-xl bg-black/20 hover:bg-black/40 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Content */}
            <div className="relative px-6 pb-6">
              {/* Profile Info */}
              <div className="-mt-12 mb-6">
                <div className="flex items-end gap-4">
                <div className="relative">
                  <div className="relative w-28 h-28 rounded-2xl border-4 border-[var(--surface)] overflow-hidden">
                    <Image
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className={`
                    absolute bottom-1 right-1 w-4 h-4
                    rounded-full border-4 border-[var(--surface)]
                    ${selectedMember.status === 'online' ? 'bg-green-400' :
                      selectedMember.status === 'idle' ? 'bg-yellow-400' :
                      selectedMember.status === 'dnd' ? 'bg-red-400' :
                      'bg-gray-400'
                    }
                  `} />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {selectedMember.name}
                  </h2>
                  {selectedMember.customStatus && (
                    <p className="text-sm text-white/60">
                      {selectedMember.customStatus}
                    </p>
                  )}
                  {selectedMember.activity && (
                    <div className="
                      flex items-center gap-1.5 mt-2
                      text-xs text-white/60
                      bg-white/5 backdrop-blur-sm
                      px-2 py-1 rounded-full w-fit
                    ">
                      {getActivityIcon(selectedMember.activity)}
                      <span>{selectedMember.activity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">{selectedMember.friendCount}</div>
                    <div className="text-sm text-white/60">Arkadaş</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">{selectedMember.postCount}</div>
                    <div className="text-sm text-white/60">Gönderi</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="
                    flex items-center justify-center gap-2
                    px-4 py-2 rounded-xl
                    bg-white/5 hover:bg-white/10
                    text-white/80 hover:text-white
                    transition-all duration-200
                  ">
                    <MessageSquare size={18} />
                    <span>Mesaj</span>
                  </button>

                  <button className="
                    flex items-center justify-center gap-2
                    px-4 py-2 rounded-xl
                    bg-white/5 hover:bg-white/10
                    text-white/80 hover:text-white
                    transition-all duration-200
                  ">
                    <UserPlus size={18} />
                    <span>Arkadaş Ekle</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="flex gap-4 mb-6">
                  <TabButton tab="friends" label="Arkadaşlar" icon={Users} />
                  <TabButton tab="servers" label="Sunucular" icon={Server} />
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {activeTab === 'friends' ? (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMember.mutualFriends?.map((friend) => (
                        <div key={friend.id} className="
                          flex items-center gap-3 p-3
                          bg-white/5 hover:bg-white/10
                          rounded-xl transition-colors
                          cursor-pointer
                        ">
                          <div className="relative w-10 h-10">
                            <Image
                              src={friend.avatar}
                              alt={friend.name}
                              fill
                              className="rounded-xl object-cover"
                            />
                            <div className={`
                              absolute bottom-0 right-0 w-3 h-3
                              rounded-full border-2 border-[var(--surface)]
                              ${friend.status === 'online' ? 'bg-green-400' :
                                friend.status === 'idle' ? 'bg-yellow-400' :
                                friend.status === 'dnd' ? 'bg-red-400' :
                                'bg-gray-400'
                              }
                            `} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{friend.name}</div>
                            {friend.activity && (
                              <div className="text-xs text-white/60">{friend.activity}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMember.mutualServers?.map((server) => (
                        <div key={server.id} className="
                          flex items-center gap-3 p-3
                          bg-white/5 hover:bg-white/10
                          rounded-xl transition-colors
                          cursor-pointer
                        ">
                          <div className="relative w-10 h-10">
                            <Image
                              src={server.icon}
                              alt={server.name}
                              fill
                              className="rounded-xl object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{server.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Roles */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="text-sm font-medium text-white/60 mb-3">Roller</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="
                    flex items-center gap-1.5 px-2 py-1
                    rounded-full text-xs
                    bg-yellow-500/10 text-yellow-400
                  ">
                    <Crown size={12} />
                    <span>Admin</span>
                  </div>
                  <div className="
                    flex items-center gap-1.5 px-2 py-1
                    rounded-full text-xs
                    bg-blue-500/10 text-blue-400
                  ">
                    <Shield size={12} />
                    <span>Moderatör</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}