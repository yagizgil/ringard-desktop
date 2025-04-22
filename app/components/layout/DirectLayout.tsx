'use client';

import { useState } from 'react';
import { Menu, Users, X, Link as LinkIcon, Upload, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UsersSidebar from './UsersSidebar';
import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUsersSidebarOpen, setIsUsersSidebarOpen] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [serverLink, setServerLink] = useState('');
  const [serverName, setServerName] = useState('');
  const [serverImage, setServerImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setServerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoinServer = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to join server
    console.log('Joining server with link:', serverLink);
    setShowJoinModal(false);
    setServerLink('');
  };

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create server
    console.log('Creating server:', { name: serverName, image: serverImage });
    setShowCreateModal(false);
    setServerName('');
    setServerImage(null);
    setPreviewImage('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <AnimatePresence>
        {/* Main Modal */}
        {showMainModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowMainModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowMainModal(false)}
                className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Sunucu Seçenekleri</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowMainModal(false);
                    setShowJoinModal(true);
                  }}
                  className="w-full p-4 rounded-xl bg-[var(--card)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-3"
                >
                  <LinkIcon className="w-5 h-5 text-white/60" />
                  <span>Sunucuya Katıl</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowMainModal(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full p-4 rounded-xl bg-[var(--card)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-3"
                >
                  <Plus className="w-5 h-5 text-white/60" />
                  <span>Sunucu Oluştur</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Join Server Modal */}
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Sunucuya Katıl</h2>
              
              <form onSubmit={handleJoinServer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Sunucu Daveti</label>
                  <input
                    type="text"
                    value={serverLink}
                    onChange={(e) => setServerLink(e.target.value)}
                    placeholder="Davet linkini yapıştır"
                    className="w-full p-3 rounded-xl bg-[var(--card)] border border-white/10 focus:border-purple-500 outline-none transition-colors"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full p-3 rounded-xl bg-purple-500 hover:bg-purple-600 transition-colors font-medium"
                >
                  Sunucuya Katıl
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Create Server Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6">Sunucu Oluştur</h2>
              
              <form onSubmit={handleCreateServer} className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="server-image"
                    />
                    <label htmlFor="server-image" className="block w-full h-full">
                      {previewImage ? (
                        <img src={previewImage} alt="Server" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[var(--card)] flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-white/60">Sunucu Resmi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Sunucu Adı</label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Örn: Gaming Hub"
                    className="w-full p-3 rounded-xl bg-[var(--card)] border border-white/10 focus:border-purple-500 outline-none transition-colors"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full p-3 rounded-xl bg-purple-500 hover:bg-purple-600 transition-colors font-medium"
                >
                  Sunucu Oluştur
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--surface)] text-[var(--text-primary)]"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Users Sidebar Button */}
      <button 
        onClick={() => setIsUsersSidebarOpen(!isUsersSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-[var(--surface)] text-[var(--text-primary)]"
      >
        <Users size={24} />
      </button>

      {/* Left Sidebar Container */}
      <div className={`
        fixed lg:sticky top-0 left-0 flex
        h-screen
        transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-40
      `}>
        {/* Server Sidebar - 72px */}
        <div className="w-[72px] h-full bg-[var(--surface)] shadow-[4px_0_var(--shadow-md)]">
          <ServerSidebar onOpenModal={() => setShowMainModal(true)} />
        </div>

        {/* Channel Sidebar - 240px */}
        <div className="w-[240px] h-full bg-[var(--surface)] shadow-[4px_0_var(--shadow-sm)]">
          <ChannelSidebar />
        </div>
      </div>

      {/* Main Content Area - Flexible */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="h-screen w-full flex flex-col">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {(isMobileMenuOpen || isUsersSidebarOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUsersSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}
