'use client';

import { motion } from 'framer-motion';

export default function SocialTab() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Aktif Kullanıcılar */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-orange-500">Aktif Kullanıcılar</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500" />
              <div>
                <p className="font-medium">Deniz Yılmaz</p>
                <p className="text-sm text-gray-400">Çevrimiçi</p>
              </div>
            </div>
            {/* Diğer kullanıcılar */}
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-orange-500">Son Aktiviteler</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
              <div>
                <p className="font-medium">Yeni Sunucu Oluşturuldu</p>
                <p className="text-sm text-gray-400">Gaming Hub - 2 saat önce</p>
              </div>
            </div>
            {/* Diğer aktiviteler */}
          </div>
        </div>

        {/* Popüler Sunucular */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-orange-500">Popüler Sunucular</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500" />
              <div>
                <p className="font-medium">Art Studio</p>
                <p className="text-sm text-gray-400">1.2k üye</p>
              </div>
            </div>
            {/* Diğer sunucular */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
