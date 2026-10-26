'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ExternalLink, Bell, LogOut, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

interface AdminHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminHeader({ onRefresh, isRefreshing }: AdminHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-[#ECE6DC] h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="h-4 w-4 text-[#8E9FAA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, orders, customer briefs, SKUs..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4 ml-6">
        
        {/* Studio Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF3F7] border border-[#D5E1E9] text-[11px] font-medium text-[#5C7489]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>3D Studio Print Queue: Active</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-[#F4EFEA] transition-colors"
            title="Refresh Studio Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* View Storefront */}
        <Link
          href="/"
          target="_blank"
          className="text-xs font-semibold text-[#5C7489] hover:text-[#14191F] flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FAF8F5] transition-colors border border-transparent hover:border-[#E5DFD4]"
        >
          <span>View Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-[#FAF8F5] relative transition-colors"
          title="Studio Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
        </button>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
          title="Sign out of Studio Admin"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
