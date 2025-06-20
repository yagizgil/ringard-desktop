'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/app/lib/api';
import { User, Lock, ArrowRight } from 'lucide-react';
import { setCookie } from 'cookies-next';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(identifier, password);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('refresh_token', res.refresh_token);
      localStorage.setItem('user_id', res.user_id);
      setCookie('access_token', res.access_token);
      setCookie('refresh_token', res.refresh_token);
      setCookie('user_id', res.user_id);
  
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/30 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-[90px] animate-glow-pulse delay-300" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/20 rounded-full blur-[100px] animate-glow-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl">
            <div className="absolute w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-sm animate-border-rotate" 
              style={{
                animation: 'border-rotate 3s linear infinite',
                background: 'linear-gradient(90deg, #f97316, #f59e0b)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }} />
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 space-y-8 relative border border-gray-800">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent animate-gradient-x [background-size:200%]">
                Hoş Geldiniz
              </h1>
              <p className="text-gray-400">
                Hesabınıza giriş yapın
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="E-posta veya kullanıcı adı"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-gray-100 placeholder-gray-500 transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifre"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-gray-100 placeholder-gray-500 transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div className="text-right">
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  Şifrenizi mi unuttunuz?
                </a>
              </div>

              <button type="submit" className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200" />
                <div className="relative px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl leading-none flex items-center justify-center">
                  <span className="text-white font-medium">Giriş Yap</span>
                </div>
              </button>

              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors group"
                >
                  Hesabınız yok mu? Kayıt olun
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
