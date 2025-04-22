'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // SSR fix

  const baseStyle = 'p-2 rounded-xl transition-all';
  const activeStyle = 'bg-white/10 text-white';
  const inactiveStyle = 'text-white/60 hover:text-white';

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setTheme('system')}
        className={`${baseStyle} ${theme === 'system' ? activeStyle : inactiveStyle}`}
        aria-label="Sistem Teması"
      >
        <Monitor className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('light')}
        className={`${baseStyle} ${resolvedTheme === 'light' && theme !== 'system' ? activeStyle : inactiveStyle}`}
        aria-label="Aydınlık Tema"
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`${baseStyle} ${resolvedTheme === 'dark' && theme !== 'system' ? activeStyle : inactiveStyle}`}
        aria-label="Karanlık Tema"
      >
        <Moon className="w-5 h-5" />
      </button>
    </div>
  );
}
