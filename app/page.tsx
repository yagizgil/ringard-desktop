'use client';

import Image from 'next/image';
import MainLayout from './components/layout/MainLayout';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { TabType } from './types/tabs';
import TabContent from './components/tabs/TabContent';
import { useEffect, useState } from 'react';

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
    role?: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
  tags?: string[];
}

interface Story {
  id: number;
  image: string;
  username: string;
  hasUnread?: boolean;
}

const SAMPLE_STORIES: Story[] = [
  { 
    id: 1, 
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&q=80",
    username: "Ahmet",
    hasUnread: true
  },
  { 
    id: 2, 
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&q=80",
    username: "Ayşe",
    hasUnread: true
  },
  { 
    id: 3, 
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&h=300&q=80",
    username: "Mehmet"
  },
  { 
    id: 4, 
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&q=80",
    username: "Zeynep",
    hasUnread: true
  },
  { 
    id: 5, 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&q=80",
    username: "Ali"
  },
  { 
    id: 6, 
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&q=80",
    username: "Can",
    hasUnread: true
  },
  { 
    id: 7, 
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&q=80",
    username: "Elif"
  },
  { 
    id: 8, 
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=300&q=80",
    username: "Emre",
    hasUnread: true
  }
];

const POSTS: Post[] = [
  {
    id: 1,
    user: {
      name: "Ayşe Yılmaz",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&q=80",
      role: "Tasarımcı"
    },
    content: "Yeni UI tasarımım üzerinde çalışıyorum. Modern ve minimal bir yaklaşım deniyorum. Düşüncelerinizi merak ediyorum!",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1000&h=600&q=80",
    likes: 128,
    comments: 32,
    time: "2 saat önce",
    tags: ["design", "ui", "minimal"]
  },
  {
    id: 2,
    user: {
      name: "Mehmet Demir",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&q=80",
      role: "Geliştirici"
    },
    content: "Next.js 14 ile geliştirdiğim yeni projemin performans sonuçları inanılmaz! Server components ve Suspense gerçekten oyun değiştirici.",
    likes: 256,
    comments: 48,
    time: "5 saat önce",
    tags: ["nextjs", "performance", "react"]
  },
  {
    id: 3,
    user: {
      name: "Deniz Yılmaz",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80",
    },
    content: "Yeni bir proje üzerinde çalışıyorum. Detayları paylaşacağım.",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&h=800&q=80",
    likes: 234,
    comments: 45,
    time: "2 saat önce",
  },
  {
    id: 4,
    user: {
      name: "Can Demir",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&q=80",
    },
    content: "Yeni bir kitap okumaya başladım. Kitap hakkında düşüncelerimi paylaşacağım.",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=1200&h=800&q=80",
    likes: 567,
    comments: 89,
    time: "4 saat önce",
  },
  {
    id: 5,
    user: {
      name: "Zeynep Kaya",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=80",
    },
    content: "Yeni bir yemek tarifi denedim. Sonuçları paylaşacağım.",
    image: "https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=1200&h=800&q=80",
    likes: 789,
    comments: 123,
    time: "6 saat önce",
  }
];

const tabs = [
  { id: 'social', label: 'Sosyal', icon: '👥' },
  { id: 'news', label: 'Haberler', icon: '📰' },
  { id: 'updates', label: 'Güncellemeler', icon: '🔄' },
  { id: 'market', label: 'Market', icon: '🛍️' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('social');

  useEffect(() => {
    const handleTabChange = (e: CustomEvent<TabType>) => {
      setActiveTab(e.detail);
    };

    window.addEventListener('tabChange', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('tabChange', handleTabChange as EventListener);
    };
  }, []);

  return (
    <MainLayout>
      <div className="max-w-[1000px] w-full mx-auto py-4">
        {activeTab === 'social' ? (
          <>
            {/* Stories Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Hikayeler
                </h2>
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Tümünü Gör
                </button>
              </div>

              {/* Stories Horizontal Scroll */}
              <div className="relative">
                <div 
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-none cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={(e) => {
                    // Prevent default to avoid text selection
                    e.preventDefault();
                    
                    const slider = e.currentTarget;
                    const startX = e.pageX - slider.offsetLeft;
                    const scrollLeft = slider.scrollLeft;
                    
                    // Add a dragging class to the slider
                    slider.classList.add('dragging');
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      e.preventDefault();
                      const x = e.pageX - slider.offsetLeft;
                      const walk = (x - startX) * 2; // Scroll speed multiplier
                      slider.scrollLeft = scrollLeft - walk;
                    };
                    
                    const handleMouseUp = () => {
                      // Remove the dragging class when done
                      slider.classList.remove('dragging');
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onClick={(e) => {
                    // Prevent click events from firing when dragging
                    if (e.detail > 1) {
                      e.preventDefault();
                    }
                  }}
                >
                  {SAMPLE_STORIES.map((story) => (
                    <div
                      key={story.id}
                      className="group flex-shrink-0 w-[200px] [.dragging_&]:cursor-grabbing cursor-pointer"
                    >
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                        {/* Rest of the story component remains unchanged */}
                        {/* Story Background */}
                        <div className="absolute inset-0">
                          <Image
                            src={story.image}
                            alt={story.username}
                            fill
                            className="object-cover filter brightness-[0.7] group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Story Content Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 group-hover:to-black/70 transition-colors duration-300">
                          {/* User Avatar */}
                          <div className="absolute top-3 left-3">
                            <div className={`w-10 h-10 rounded-xl overflow-hidden ${
                              story.hasUnread 
                                ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-black/50' 
                                : ''
                            }`}>
                              <Image
                                src={story.image}
                                alt={story.username}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                          </div>

                          {/* Story Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-sm font-medium text-white mb-1">
                              {story.username}
                            </h3>
                            <p className="text-xs text-white/70">
                              2 saat önce
                            </p>
                          </div>

                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-[var(--primary)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scroll Gradient */}
                <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Create Post Section */}
            <div className="mb-6 bg-[var(--surface)] rounded-xl shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300">
              <div className="flex gap-4 items-center p-4">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
                  <Image
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80"
                    alt="Your avatar"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Bir gönderi oluştur..."
                  className="flex-1 px-4 py-2 rounded-xl bg-[var(--card)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:ring-2 ring-[var(--primary)] transition-all text-sm hover:bg-[var(--card-hover)]"
                />
              </div>
            </div>

            {/* Posts Section */}
            <div className="space-y-6">
              {POSTS.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-[var(--surface)] rounded-xl overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-300"
                >
                  {/* Üst Kısım - Kullanıcı Bilgisi */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
                          <Image
                            src={post.user.avatar}
                            alt={post.user.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                          {post.user.name}
                        </h3>
                        {post.user.role && (
                          <p className="text-xs text-[var(--text-secondary)]">
                            {post.user.role} • {post.time}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <MoreHorizontal size={20} className="text-[var(--text-secondary)]" />
                    </button>
                  </div>

                  {/* İçerik */}
                  <div className="px-4 pb-3">
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs font-medium text-[var(--primary)] bg-[var(--primary-light)] px-2.5 py-1 rounded-full hover:bg-[var(--primary-light-hover)] transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Görsel */}
                  {post.image && (
                    <div className="relative aspect-[16/9] mt-2 bg-[var(--card)]">
                      <Image
                        src={post.image}
                        alt="Post image"
                        fill
                        className="object-cover transition-opacity duration-300"
                        sizes="(max-width: 1000px) 100vw, 1000px"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Alt Kısım - Etkileşimler */}
                  <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Like */}
                        <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-pink-500 transition-colors group">
                          <Heart size={20} className="group-hover:fill-pink-500 transform group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        
                        {/* Comment */}
                        <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-500 transition-colors group">
                          <MessageCircle size={20} className="transform group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                        
                        {/* Share */}
                        <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-green-500 transition-colors group">
                          <Share2 size={20} className="transform group-hover:scale-110 transition-transform" />
                        </button>
                      </div>

                      {/* Bookmark */}
                      <button className="text-[var(--text-secondary)] hover:text-yellow-500 transition-colors group">
                        <Bookmark size={20} className="transform group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <TabContent activeTab={activeTab} />
        )}
      </div>
    </MainLayout>
  );
}
