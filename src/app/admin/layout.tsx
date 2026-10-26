'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Lock, KeyRound, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading: authLoading, login } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    const res = await login(passcode);
    if (!res.success) {
      setLoginError(res.error || 'Invalid passcode');
    }
    setLoggingIn(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#7A8B99] font-medium tracking-wide">Authenticating Studio Session...</p>
        </div>
      </div>
    );
  }

  // GATED PASSCODE LOGIN IF NOT ADMIN
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E5DFD4] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#14191F]">
              where<span className="text-[#5C7489]">is</span>it
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#7A8B99] font-bold">Studio Management Portal</p>
            <p className="text-xs text-[#556473]">Restricted access for studio operators only.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Studio Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. whereisit2026)"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn || !passcode}
              className="w-full py-3.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors shadow-md disabled:opacity-50"
            >
              {loggingIn ? 'Authenticating...' : 'Enter Studio Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#ECE6DC] flex flex-col items-center gap-2 text-center">
            <span className="text-[11px] text-[#7A8B99]">
              Default passcode: <code className="bg-[#F2EDE4] px-1.5 py-0.5 rounded text-[#14191F] font-mono">whereisit2026</code>
            </span>
            <Link
              href="/"
              className="text-xs font-semibold text-[#5C7489] hover:underline flex items-center gap-1 mt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED VIEW
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex text-[#14191F]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
