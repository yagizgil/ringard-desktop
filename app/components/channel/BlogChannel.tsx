'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Search, Bell, ThumbsUp, ThumbsDown, Share2, MessageCircle, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
    status: string;
  };
  timestamp: string;
  likes: number;
  dislikes: number;
  comments: number;
  liked?: boolean;
  disliked?: boolean;
  tags: string[];
  coverImage?: string;
}

interface BlogChannelProps {
  channelId: string;
  channelName: string;
  topic?: string;
  isAdmin?: boolean;
}

// Örnek blog yazıları
const SAMPLE_BLOG_POSTS: BlogPost[] = Array(12).fill(null).map((_, index) => ({
  id: String(index + 1),
  title: `Blog Yazısı #${index + 1}`,
  content: `# Blog Yazısı ${index + 1}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Alt Başlık

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

![Örnek Görsel](https://plus.unsplash.com/premium_photo-1739027969843-036e37e77414?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

### Özellikler

- Özellik 1
- Özellik 2
- Özellik 3

[Detaylı bilgi için tıklayın](https://example.com)`,
  author: {
    id: String(Math.floor(Math.random() * 3) + 1),
    name: ['Teknoloji Editörü', 'Web Geliştirici', 'UX Tasarımcı'][Math.floor(Math.random() * 3)],
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
    role: ['Editor', 'Developer', 'Designer'][Math.floor(Math.random() * 3)],
    status: 'online'
  },
  timestamp: new Date(2025, 3, index + 1).toISOString(),
  likes: Math.floor(Math.random() * 200),
  dislikes: Math.floor(Math.random() * 20),
  comments: Math.floor(Math.random() * 50),
  tags: ['teknoloji', 'web', 'tasarım', 'yazılım'].sort(() => Math.random() - 0.5).slice(0, 3),
  coverImage: `https://images.unsplash.com/photo-1743467814391-efea6773de67?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
}));

// Reklam alanları
const AD_SLOTS = [
  {
    id: 'sidebar-top',
    title: 'Reklam #1',
    size: '300x250',
    position: 'sidebar'
  },
  {
    id: 'sidebar-bottom',
    title: 'Reklam #2',
    size: '300x250',
    position: 'sidebar'
  },
  {
    id: 'content-1',
    title: 'Reklam #3',
    size: '728x90',
    position: 'content'
  },
  {
    id: 'content-2',
    title: 'Reklam #4',
    size: '728x90',
    position: 'content'
  },
  {
    id: 'content-3',
    title: 'Reklam #5',
    size: '728x90',
    position: 'content'
  }
];

export default function BlogChannel({ channelId, channelName, topic, isAdmin = false }: BlogChannelProps) {
  const [posts, setPosts] = useState<BlogPost[]>(SAMPLE_BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Beğeni/Beğenmeme işlemleri
  const handleLike = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (post.liked) {
          return { ...post, liked: false, likes: post.likes - 1 };
        } else {
          return { 
            ...post, 
            liked: true, 
            disliked: false, 
            likes: post.likes + 1,
            dislikes: post.disliked ? post.dislikes - 1 : post.dislikes 
          };
        }
      }
      return post;
    }));
  };

  const handleDislike = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (post.disliked) {
          return { ...post, disliked: false, dislikes: post.dislikes - 1 };
        } else {
          return { 
            ...post, 
            disliked: true, 
            liked: false, 
            dislikes: post.dislikes + 1,
            likes: post.liked ? post.likes - 1 : post.likes 
          };
        }
      }
      return post;
    }));
  };

  return (
    <div className="flex h-full">
      {/* Ana İçerik */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {/* Kanal Başlığı */}
        <div className="h-14 flex items-center sticky top-0 justify-between px-4 bg-[var(--surface)] border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary)] bg-opacity-10">
              <BookOpen className="w-5 h-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <h1 className="text-[var(--text-primary)] font-semibold flex items-center gap-2">
                {channelName}
              </h1>
              {topic && (
                <p className="text-xs text-[var(--text-secondary)]">{topic}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--card)] text-[var(--text-secondary)]">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Blog yazılarında ara"
                  className="w-32 bg-transparent border-none outline-none text-sm"
                />
              </div>
            </div>
            <button className="hidden md:block p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-secondary)]">
              <Bell size={18} />
            </button>
            {isAdmin && (
              <button 
                onClick={() => setShowNewPostModal(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-colors rounded-lg text-white text-sm"
              >
                <PlusCircle size={16} />
                <span>Yeni Yazı</span>
              </button>
            )}
          </div>
        </div>

        {/* Blog İçeriği */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedPost ? (
            // Detaylı Blog Görünümü
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedPost(null)}
                className="mb-4 px-4 py-2 rounded-lg bg-[var(--card)] hover:bg-[var(--card-hover)] transition-colors text-[var(--text-secondary)]"
              >
                ← Geri Dön
              </button>
              
              <article className="bg-[var(--surface)] rounded-xl overflow-hidden">
                {selectedPost.coverImage && (
                  <div className="relative w-full h-64 md:h-96">
                    <Image
                      src={selectedPost.coverImage}
                      alt={selectedPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  {/* Yazar Bilgisi */}
                  <div className="flex items-center gap-3 mb-6">
                    <Image
                      src={selectedPost.author.avatar}
                      alt={selectedPost.author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {selectedPost.author.name}
                        </span>
                        {selectedPost.author.role && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)]">
                            {selectedPost.author.role}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {new Date(selectedPost.timestamp).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Başlık */}
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
                    {selectedPost.title}
                  </h1>

                  {/* İçerik */}
                  <div className="prose prose-invert max-w-none mb-8">
                    <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                  </div>

                  {/* Etiketler */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-[var(--card)] text-[var(--text-secondary)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Etkileşim Butonları */}
                  <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                    <button
                      onClick={(e) => handleLike(selectedPost.id, e)}
                      className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors ${
                        selectedPost.liked ? 'text-green-500' : ''
                      }`}
                    >
                      <ThumbsUp size={18} />
                      <span>{selectedPost.likes}</span>
                    </button>
                    <button
                      onClick={(e) => handleDislike(selectedPost.id, e)}
                      className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors ${
                        selectedPost.disliked ? 'text-red-500' : ''
                      }`}
                    >
                      <ThumbsDown size={18} />
                      <span>{selectedPost.dislikes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                      <MessageCircle size={18} />
                      <span>{selectedPost.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            // Blog Kartları Görünümü
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                
                {/* Blog Yazıları ve Reklamlar */}
                {posts.map((post, index) => {
                  // Önce blog yazısını göster
                  const blogPost = (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[var(--surface)] rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                      onClick={() => setSelectedPost(post)}
                    >
                      {post.coverImage && (
                        <div className="relative w-full h-48">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-4">
                        {/* Yazar Bilgisi */}
                        <div className="flex items-center gap-3 mb-4">
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[var(--text-primary)]">
                                {post.author.name}
                              </span>
                              {post.author.role && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary-font)]">
                                  {post.author.role}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              {new Date(post.timestamp).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Başlık */}
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                          {post.title}
                        </h2>

                        {/* Özet */}
                        <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-3">
                          {post.content.split('\n').filter(line => !line.startsWith('#'))[0]}
                        </p>

                        {/* Etiketler */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-[var(--card)] text-[var(--text-secondary)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Etkileşim Butonları */}
                        <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                          <button
                            onClick={(e) => handleLike(post.id, e)}
                            className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors ${
                              post.liked ? 'text-green-500' : ''
                            }`}
                          >
                            <ThumbsUp size={16} />
                            <span>{post.likes}</span>
                          </button>
                          <button
                            onClick={(e) => handleDislike(post.id, e)}
                            className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors ${
                              post.disliked ? 'text-red-500' : ''
                            }`}
                          >
                            <ThumbsDown size={16} />
                            <span>{post.dislikes}</span>
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                          >
                            <MessageCircle size={16} />
                            <span>{post.comments}</span>
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );

                  // Her 4 blog yazısından sonra reklam göster
                  if ((index + 1) % 4 === 0 && index !== posts.length - 1) {
                    const adIndex = Math.floor(index / 4) % AD_SLOTS.filter(ad => ad.position === 'content').length;
                    const ad = AD_SLOTS.filter(ad => ad.position === 'content')[adIndex];
                    
                    return [
                      blogPost,
                      <div
                        key={`ad-${ad.id}-${index}`}
                        className="col-span-full my-8 bg-[var(--card)] rounded-xl p-4"
                      >
                        <div className="text-sm text-[var(--text-secondary)] mb-2 text-center">
                          {ad.title}
                        </div>
                        <div className="w-full h-[90px] bg-[var(--surface)] rounded-lg flex items-center justify-center text-[var(--text-secondary)]">
                          {ad.size}
                        </div>
                      </div>
                    ];
                  }

                  return blogPost;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sağ Kenar Çubuğu - Reklamlar */}
      <aside className="hidden lg:block w-[300px] h-full border-l border-white/5 p-4 space-y-4">
        {AD_SLOTS.filter(ad => ad.position === 'sidebar').map((ad) => (
          <div
            key={ad.id}
            className="bg-[var(--card)] rounded-xl p-4 text-center"
          >
            <div className="text-sm text-[var(--text-secondary)] mb-2">{ad.title}</div>
            <div className="w-full h-[250px] bg-[var(--surface)] rounded-lg flex items-center justify-center text-[var(--text-secondary)]">
              {ad.size}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
