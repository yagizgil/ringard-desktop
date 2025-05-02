'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, Check, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.');
      }

      setIsSuccess(true);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
      
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top Left Pattern */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Bottom Right Pattern */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Center Pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.05)_0%,transparent_50%)] animate-[spin_60s_linear_infinite]" />

        {/* Decorative Dots */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 122, 0, 0.05) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(251, 146, 60, 0.05) 2px, transparent 2px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 animate-float">
          <Sparkles className="w-6 h-6 text-orange-500/20" />
        </div>
        <div className="absolute bottom-20 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-6 h-6 text-amber-500/20" />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <Sparkles className="w-4 h-4 text-orange-500/20" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '3s' }}>
          <Sparkles className="w-4 h-4 text-amber-500/20" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div className="absolute top-10 left-1/2 -translate-x-1/2">
        <div className="relative">
          <Image
            src="/logo/logo.png"
            alt="Logo"
            width={120}
            height={120}
          />
          <div className="absolute -inset-2 bg-orange-500/10 rounded-full blur-xl animate-pulse" />
        </div>
      </div>

      <div className="w-full max-w-md relative">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors mb-8 group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -m-2" />
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform relative z-10" />
          <span className="relative z-10">Giriş sayfasına dön</span>
        </Link>

        <div className="relative bg-[var(--card)] p-8 rounded-2xl shadow-2xl border border-white/5 backdrop-blur-xl">
          {/* Card Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full opacity-10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full opacity-10 blur-2xl" />
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute h-0.5 bg-white/5 w-32 top-5" />
            <div className={`absolute h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 top-5`} 
                 style={{ width: step === 2 ? '128px' : '0px' }} />
            <div className="relative flex items-center justify-center gap-24">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                step >= 1 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-white/5 text-[var(--text-secondary)]'
              }`}>
                <Mail size={20} />
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                step >= 2 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-white/5 text-[var(--text-secondary)]'
              }`}>
                <KeyRound size={20} />
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Şifreni mi unuttun?
                </h1>
                <p className="text-[var(--text-secondary)] mt-3">
                  Endişelenme! E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
                    E-posta Adresi
                  </label>
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/10 transition-all"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Gönderiliyor</span>
                      </>
                    ) : (
                      'Sıfırlama Bağlantısı Gönder'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                  <Check size={40} className="text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl" />
              </div>

              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-3">
                  E-posta Gönderildi!
                </h2>
                <p className="text-[var(--text-secondary)]">
                  <span className="text-white font-medium">{email}</span> adresine şifre sıfırlama bağlantısı gönderdik. 
                  Lütfen gelen kutunu kontrol et.
                </p>
              </div>

              <div className="pt-6 space-y-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-white/5 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all border border-white/5"
                >
                  Farklı bir e-posta dene
                </button>
                
                <Link 
                  href="/login"
                  className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-center"
                >
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
