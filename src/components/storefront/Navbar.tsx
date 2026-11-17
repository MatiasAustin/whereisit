'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { Menu, X, ArrowUpRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { StoreSettings } from '@/types';

interface NavbarProps {
  storeSettings?: StoreSettings;
}

export default function Navbar({ storeSettings }: NavbarProps) {
  const { isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F1]/90 backdrop-blur-md border-b border-[#ECE6DC]/80 transition-all duration-300">
      {/* Top Announcement Bar */}
      {storeSettings?.announcementActive && storeSettings?.announcementText && (
        <div className="bg-[#14191F] text-[#D5E1E9] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-[#24303C]">
          <span>{storeSettings.announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Official Brand Logo */}
        <Logo customLogoUrl={storeSettings?.logoUrl} variant="full" size="md" showStudioTag />

        {/* Desktop Navigation Links */}
        <nav aria-label="Navigasi Utama" className="hidden lg:flex items-center space-x-6 text-xs xl:text-sm font-medium text-[#4A5560]">
          <Link
            href="/preorder/keychain-strava"
            className="flex items-center gap-1.5 font-bold text-[#14191F] hover:text-[#5C7489] transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#5C7489] text-white font-bold uppercase tracking-wider">
              PO
            </span>
            <span>Pre-Order Keychain</span>
          </Link>

          <Link
            href="/strava-route-lamp"
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Strava Lamp (Coming Soon)
          </Link>

          <Link
            href="/smart-cube"
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Smart Cube (Coming Soon)
          </Link>

          <Link
            href="/track"
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Lacak Pesanan
          </Link>

          <Link
            href="/#about"
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Studio &amp; Philosophy
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#EDF3F7] border border-[#C5D5E2] rounded-full p-1 pl-2.5">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#5C7489] hover:text-[#14191F] transition-colors"
                title="Buka Admin Dashboard"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Admin</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1 rounded-full text-[#7A8B99] hover:text-red-600 hover:bg-white transition-colors"
                aria-label="Logout Admin"
                title="Keluar dari Admin"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          <Link
            href="/preorder/keychain-strava"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-full bg-[#14191F] hover:bg-[#5C7489] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Pre-Order Sekarang
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Menu Navigasi"
            className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-lg text-[#14191F] hover:bg-[#ECE6DC] transition-colors flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <nav aria-label="Menu Mobile" className="lg:hidden bg-[#F8F6F1] border-b border-[#ECE6DC] px-6 py-6 space-y-3">
          <div className="flex flex-col space-y-1 font-medium text-base text-[#14191F]">
            <Link
              href="/preorder/keychain-strava"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 font-bold text-[#5C7489] flex items-center justify-between"
            >
              <span>Pre-Order Keychain Strava</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#5C7489] text-white">Pre-Order</span>
            </Link>
            <Link
              href="/strava-route-lamp"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 hover:text-[#5C7489] flex items-center justify-between"
            >
              <span>Strava Lamp (Coming Soon)</span>
            </Link>
            <Link
              href="/smart-cube"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 hover:text-[#5C7489] flex items-center justify-between"
            >
              <span>Smart Cube (Coming Soon)</span>
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 hover:text-[#5C7489] flex items-center"
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] py-2 hover:text-[#5C7489] flex items-center"
            >
              Studio &amp; Philosophy
            </Link>

            {isAdmin && (
              <div className="pt-3 border-t border-[#ECE6DC] flex items-center justify-between">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 text-sm text-[#5C7489] font-bold min-h-[44px]"
                >
                  <span>Admin Dashboard</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-semibold flex items-center gap-1 min-h-[44px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
