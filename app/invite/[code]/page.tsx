'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWindowSize } from 'react-use';
import type { Server } from '@/app/types/server';
import { type ISourceOptions } from '@tsparticles/engine';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });
const Snowfall = dynamic(() => import('react-snowfall'), { ssr: false });
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
const ParticlesComponent = dynamic(() => import('@tsparticles/react').then(mod => mod.Particles), { ssr: false });

// Örnek sunucu verileri
const servers: Record<string, Server> = {
  'ringard': {
    name: 'Ringard',
    description: 'Yeni nesil sohbet platformu! Topluluklar, özel kanallar, sesli sohbet ve çok daha fazlası için resmi Ringard sunucusuna katılın.',
    profileImage: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=256&h=256&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=400&fit=crop',
    backgroundType: 'gradient',
    backgroundColor: '#1a0f00',
    backgroundGradient: 'linear-gradient(135deg, #1a0f00 0%, #331400 50%, #4d1f00 100%)',
    music: 'https://example.com/ambient.mp3',
    theme: {
      primary: '#ff6b00',
      secondary: '#1a0f00',
      accent: '#ffb380',
      rounded: '2xl',
    },
    effects: {
      snow: false,
      confetti: false,
      particles: true,
    },
    customButton: {
      show: true,
      icon: '🌟',
      text: 'GitHub',
      link: 'https://github.com/ringard',
      color: '#2b3137',
    },
  },
  'gaming-hub': {
    name: 'Gaming Hub',
    description: 'Oyun severler için muhteşem bir topluluk! Haftalık turnuvalar, özel etkinlikler ve daha fazlası...',
    profileImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=256&h=256&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=400&fit=crop',
    backgroundType: 'video',
    backgroundUrl: 'https://example.com/gaming-video.mp4',
    backgroundColor: '#1a1a2e',
    backgroundGradient: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)',
    music: 'https://example.com/gaming-music.mp3',
    theme: {
      primary: '#ff4655',
      secondary: '#0f1923',
      accent: '#7b2cbf',
      rounded: 'xl',
    },
    effects: {
      snow: false,
      confetti: true,
      particles: true,
    },
    customButton: {
      show: true,
      icon: '🎮',
      text: 'Twitch',
      link: 'https://twitch.tv/gaming-hub',
      color: '#6441a5',
    },
  },
  'art-studio': {
    name: 'Art Studio',
    description: 'Sanatçılar, tasarımcılar ve yaratıcı ruhlar için özel bir topluluk. Portfolio paylaşımları, canlı çizim seansları ve ilham verici tartışmalar.',
    profileImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=256&h=256&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1920&h=400&fit=crop',
    backgroundType: 'gradient',
    backgroundColor: '#2d3436',
    backgroundGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
    music: 'https://example.com/ambient-music.mp3',
    theme: {
      primary: '#ff9a9e',
      secondary: '#2d3436',
      accent: '#fad0c4',
      rounded: '2xl',
    },
    effects: {
      snow: true,
      confetti: false,
      particles: true,
    },
    customButton: {
      show: true,
      icon: '🎨',
      text: 'Behance',
      link: 'https://behance.net/art-studio',
      color: '#053eff',
    },
  },
};

export default function InvitePage() {
  const params = useParams();
  const code = params?.code as string;

  const [server, setServer] = useState<Server | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const serverCode = params.code as keyof typeof servers;
    if (servers[serverCode]) {
      setServer(servers[serverCode]);
    }
  }, [params.code]);

  if (!server) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white">Sunucu bulunamadı...</p>
      </div>
    );
  }

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const particlesConfig: ISourceOptions = {
    fpsLimit: 60,
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    particles: {
      color: {
        value: server.theme.accent,
      },
      links: {
        color: server.theme.primary,
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
      },
      size: {
        value: { min: 1, max: 3 },
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
      },
      number: {
        value: 100,
        density: {
          enable: true,
        },
      },
      shape: {
        type: "circle",
      },
      twinkle: {
        lines: {
          enable: true,
          frequency: 0.05,
          opacity: 0.5,
          color: server.theme.primary,
        },
        particles: {
          enable: true,
          frequency: 0.05,
          opacity: 1,
          color: server.theme.accent,
        },
      },
    },
    detectRetina: true,
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden font-geist flex items-center justify-center p-4"
      style={{
        background: server.backgroundType === 'gradient' 
          ? server.backgroundGradient 
          : server.backgroundColor
      }}
    >
      {/* Background Video/Image */}
      {server.backgroundType === 'video' && server.backgroundUrl && (
        <div className="absolute inset-0">
          <ReactPlayer
            url={server.backgroundUrl}
            playing
            loop
            muted
            width="100%"
            height="100%"
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Effects */}
      {server.effects.snow && <Snowfall />}
      {server.effects.confetti && <Confetti width={width} height={height} />}
      {server.effects.particles && (
        <ParticlesComponent
          id="tsparticles"
          className="absolute inset-0"
          options={particlesConfig}
        />
      )}

      {/* Music Player */}
      {server.music && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={toggleMusic}
            className={`p-3 rounded-full transition-all ${
              isPlaying ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            {isPlaying ? '🔇' : '🔊'}
          </button>
          <ReactPlayer
            url={server.music}
            playing={isPlaying}
            loop
            width="0"
            height="0"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Server Card */}
        <div 
          className={`bg-gray-900/90 backdrop-blur-lg rounded-${server.theme.rounded} overflow-hidden shadow-2xl border border-gray-800`}
        >
          {/* Banner */}
          <div 
            className="relative h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${server.bannerImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
            
            {/* Profile Image */}
            <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
              <div className={`relative w-24 h-24 rounded-${server.theme.rounded} border-4 overflow-hidden shadow-lg`}
                style={{ borderColor: server.theme.primary }}
              >
                <img
                  src={server.profileImage}
                  alt={server.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Server Info */}
          <div className="pt-16 pb-8 px-8 text-center space-y-6">
            <h1 
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${server.theme.primary}, ${server.theme.accent})` 
              }}
            >
              {server.name}
            </h1>
            <p className="text-lg text-gray-300">
              {server.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                className={`px-8 py-3 rounded-${server.theme.rounded} text-white font-medium transition-all hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-${server.theme.primary}/20`}
                style={{ 
                  background: `linear-gradient(135deg, ${server.theme.primary}, ${server.theme.accent})` 
                }}
              >
                Sunucuya Katıl
              </button>

              {server.customButton.show && (
                <a
                  href={server.customButton.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-8 py-3 rounded-${server.theme.rounded} text-white font-medium transition-all hover:opacity-90 hover:scale-105 hover:shadow-lg flex items-center gap-2`}
                  style={{ backgroundColor: server.customButton.color }}
                >
                  <span>{server.customButton.icon}</span>
                  {server.customButton.text}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
