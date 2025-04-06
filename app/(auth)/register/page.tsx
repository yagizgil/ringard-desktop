'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { register } from '@/app/lib/api';
import { setCookie } from 'cookies-next';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.match(/[a-z]+/)) strength += 20;
    if (password.match(/[A-Z]+/)) strength += 20;
    if (password.match(/[0-9]+/)) strength += 20;
    if (password.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength += 20;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await register(formData.username, formData.password);
  
      if (response.access_token && response.refresh_token && response.user_id) {
        setCookie('access_token', response.access_token);
        setCookie('refresh_token', response.refresh_token);
        setCookie('user_id', response.user_id);
  
        window.location.href = '/';
      } else {
        alert('Kayıt başarısız oldu.');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/30 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-[90px] animate-glow-pulse delay-300" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/20 rounded-full blur-[100px] animate-glow-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card Container with Border Animation */}
        <div className="relative">
          {/* Border Animation Container */}
          <div className="absolute inset-0 rounded-2xl">
            {/* Animated Border Element */}
            <div className="absolute w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-sm animate-border-rotate" 
                 style={{
                   animation: 'border-rotate 3s linear infinite',
                   background: 'linear-gradient(90deg, #f97316, #f59e0b)',
                   clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                 }} />
          </div>

          {/* Register Card */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 space-y-8 relative border border-gray-800">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent animate-gradient-x [background-size:200%]">
                Kayıt Ol
              </h1>
              <p className="text-gray-400">
                Yeni bir hesap oluşturun
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Name Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınız"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-gray-100 placeholder-gray-500 transition-all"
                  />
                </div>

                {/* Email Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-posta"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-gray-100 placeholder-gray-500 transition-all"
                  />
                </div>

                {/* Username Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Kullanıcı adı"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-gray-100 placeholder-gray-500 transition-all"
                  />
                </div>

                {/* Password Input with Strength */}
                <div className="space-y-2">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Şifre"
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-gray-100 placeholder-gray-500 transition-all"
                    />
                  </div>
                  {/* Password Strength Indicator */}
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-500`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Şifreniz en az 8 karakter uzunluğunda olmalı ve büyük/küçük harf, rakam ve özel karakter içermelidir.
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Şifre (Tekrar)"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-gray-100 placeholder-gray-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="relative w-full group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200" />
                <div className="relative px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl leading-none flex items-center justify-center">
                  <span className="text-white font-medium">Kayıt Ol</span>
                </div>
              </button>

              {/* Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Zaten hesabınız var mı? Giriş yapın
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
