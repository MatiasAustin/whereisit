'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, ArrowUpRight, SlidersHorizontal, Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { StoreSettings } from '@/types';

interface NavbarProps {
  storeSettings?: StoreSettings;
}

export default function Navbar({ storeSettings }: NavbarProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F1]/90 backdrop-blur-md border-b border-[#ECE6DC]/80 transition-all duration-300">
      {/* Top Announcement Bar from Database */}
      {storeSettings?.announcementActive && storeSettings?.announcementText && (
        <div className="bg-[#14191F] text-[#D5E1E9] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-[#24303C]">
          <span>{storeSettings.announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - clean editorial typography matching reference */}
        <Link href="/" className="group flex items-baseline gap-1.5 focus:outline-none">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#14191F] group-hover:text-[#5C7489] transition-colors">
            where<span className="text-[#5C7489]">is</span>it
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5C7489] inline-block mb-1"></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#4A5560]">
          <Link 
            href="#catalog" 
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Catalog
          </Link>
          <Link 
            href="#custom-design" 
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Custom Design
          </Link>
          <Link 
            href="#custom-character" 
            className="flex items-center gap-1.5 hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5C7489]" />
            <span>Custom Character</span>
          </Link>
          <Link 
            href="#about" 
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Studio & Philosophy
          </Link>
          <Link 
            href="#delivery" 
            className="hover:text-[#14191F] transition-colors hover:underline underline-offset-8 decoration-[#5C7489]"
          >
            Delivery & Payment
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Admin Indicator Pill: ONLY SHOWN WHEN LOGGED IN AS ADMIN */}
          {isAdmin && (
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#EDF3F7] border border-[#C5D5E2] rounded-full p-1 pl-2.5">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#5C7489] hover:text-[#14191F] transition-colors"
                title="Go to Admin Dashboard"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Admin Dashboard</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-1 rounded-full text-[#7A8B99] hover:text-red-600 hover:bg-white transition-colors"
                title="Log out of Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Cart Icon Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-[#14191F] text-white hover:bg-[#5C7489] transition-colors duration-200 shadow-sm"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#5C7489] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F8F6F1]">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#14191F] hover:bg-[#ECE6DC] transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F6F1] border-b border-[#ECE6DC] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 font-medium text-base text-[#14191F]">
            <Link 
              href="#catalog" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#5C7489]"
            >
              Catalog
            </Link>
            <Link 
              href="#custom-design" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#5C7489]"
            >
              Custom Design Consultation
            </Link>
            <Link 
              href="#custom-character" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 flex items-center gap-2 hover:text-[#5C7489]"
            >
              <Sparkles className="w-4 h-4 text-[#5C7489]" />
              <span>Custom Character</span>
            </Link>
            <Link 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#5C7489]"
            >
              Studio & Philosophy
            </Link>
            <Link 
              href="#delivery" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#5C7489]"
            >
              Delivery & Payment
            </Link>

            {/* Admin link in mobile menu: ONLY SHOWN WHEN LOGGED IN AS ADMIN */}
            {isAdmin && (
              <div className="pt-3 border-t border-[#ECE6DC] flex items-center justify-between">
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 text-sm text-[#5C7489] font-bold"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Open Admin Dashboard</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
