// app/admin/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DB } from '@/lib/supabase';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Clear any existing stale demo user on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // sessionStorage.removeItem('demo_user');
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await DB.signIn(email, password);
      if (error) throw error;
      
      if (data?.user && (data.user.id === 'demo-user' || data.user.user_metadata?.source === 'local_admin_profile')) {
        sessionStorage.setItem('demo_user', JSON.stringify(data.user));
      }
      
      router.replace('/admin');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@example.com');
    setPassword('password123');
    handleLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF9] p-6">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#A8D5BA] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF8B5A] blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative z-10"
      >
        <div className="bg-[#FAFAF9] px-8 pt-12 pb-8 text-center border-b border-gray-50">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-6">
            ⛺
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">SONGDO ADMIN</h1>
          <p className="text-gray-500 text-sm font-medium">버스킹 플리마켓 관리 시스템 로그인</p>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-xl border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@example.com"
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : '로그인'}
              </button>
              
              <button 
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
              >
                데모 체험
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
