'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, SlidersHorizontal, ArrowUpRight, Mail, Phone, Globe, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function Footer() {
  const { isAdmin, logout } = useAuth();

  return (
    <footer className="bg-[#14191F] text-white pt-20 pb-12 border-t border-[#232D37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Big Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#24303C]">
          <div className="lg:col-span-6 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white lowercase">
                where<span className="text-[#8BA1B4]">is</span>it
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#8BA1B4] inline-block mb-1 ml-1"></span>
            </Link>
            <p className="text-sm text-[#8E9FAA] max-w-md leading-relaxed">
              A bespoke 3D design studio creating tactile, functional, and sculptural objects. We bridge human intent and algorithmic precision for spaces that value quiet luxury.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-[#8E9FAA]">
              <span>Jakarta Studio</span>
              <span>•</span>
              <span>Mon - Sat 09:00 - 18:00</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8BA1B4] font-bold">Studio Drops & Releases</span>
              <h4 className="text-lg font-bold text-white mt-1">Receive early access to limited edition objects</h4>
              <p className="text-xs text-[#8E9FAA] mt-1">No spam. Only curated drops, private studio openings, and material experiments.</p>
            </div>

            <div className="mt-4 flex max-w-md">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-l-full bg-[#1A222A] border border-[#2B3846] text-xs text-white placeholder-[#6C7E8E] focus:outline-none focus:border-[#8BA1B4]"
              />
              <button
                type="button"
                className="px-6 py-3 rounded-r-full bg-[#5C7489] hover:bg-[#6D879E] text-white text-xs font-semibold transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Middle Navigation Sitemap */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-12 text-xs text-[#8E9FAA] border-b border-[#24303C]">
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Collection</h5>
            <ul className="space-y-2">
              <li><Link href="#catalog" className="hover:text-white transition-colors">Small Furniture</Link></li>
              <li><Link href="#catalog" className="hover:text-white transition-colors">Desk Objects</Link></li>
              <li><Link href="#catalog" className="hover:text-white transition-colors">Home & Decor</Link></li>
              <li><Link href="#catalog" className="hover:text-white transition-colors">Figurines & Collectibles</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Custom Studio</h5>
            <ul className="space-y-2">
              <li><Link href="#custom-design" className="hover:text-white transition-colors">Custom Your Design</Link></li>
              <li><Link href="#custom-character" className="hover:text-white transition-colors">Personal Keepsake Figurines</Link></li>
              <li><Link href="#custom-design" className="hover:text-white transition-colors">Spatial Consultation</Link></li>
              <li><Link href="#custom-character" className="hover:text-white transition-colors">Photo-to-3D Process</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Transparency</h5>
            <ul className="space-y-2">
              <li><Link href="#delivery" className="hover:text-white transition-colors">Delivery & Insured Logistics</Link></li>
              <li><Link href="#delivery" className="hover:text-white transition-colors">Payment Methods</Link></li>
              <li><Link href="#about" className="hover:text-white transition-colors">Material Safety & Eco-PLA</Link></li>
              <li><Link href="#delivery" className="hover:text-white transition-colors">Transit Guarantee</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Studio Contact</h5>
            <ul className="space-y-2">
              <li><span className="text-[#8E9FAA]">WhatsApp: +62 812-3456-7890</span></li>
              <li><span className="text-[#8E9FAA]">Email: studio@whereisit.design</span></li>
              <li><span className="text-[#8E9FAA]">Instagram: @whereisit.studio</span></li>
              
              {/* ONLY RENDERED IF ADMIN IS LOGGED IN */}
              {isAdmin && (
                <li className="pt-2 border-t border-[#24303C] flex items-center justify-between">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-[#8BA1B4] hover:text-white transition-colors font-medium"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-[10px] text-red-400 hover:text-red-300"
                    title="Logout"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6E8091] gap-4">
          <p>© {new Date().getFullYear()} WhereIsIt Design Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Craft</span>
            <span>Bespoke Studio Agreement</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
