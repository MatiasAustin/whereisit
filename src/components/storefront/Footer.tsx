'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { CheckCircle } from 'lucide-react';
import { StoreSettings } from '@/types';
import { getWhatsAppAdminLink } from '@/data/stravaKeychainConfig';

interface FooterProps {
  storeSettings?: StoreSettings;
}

export default function Footer({ storeSettings }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'Storefront Footer' }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const waNumber = process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER || '6285128066354';
  const contactEmail = 'whereisit26@gmail.com';
  const studioAddress = storeSettings?.studioAddress || 'Kab. Karawang & Jakarta, Indonesia';

  return (
    <footer className="bg-[#14191F] text-white pt-16 pb-12 border-t border-[#232D37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand Statement & Email Drops */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#24303C]">
          <div className="lg:col-span-6 space-y-4">
            <Logo customLogoUrl={storeSettings?.footerLogoUrl} variant="full" theme="dark" size="lg" showStudioTag />
            <p className="text-sm text-[#8E9FAA] max-w-md leading-relaxed">
              Transforms personal data, achievements, and everyday routines into meaningful physical products. Personal data. Physical products. Meaningful experiences.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-2 text-xs text-[#8E9FAA]">
              <span>Lokasi Seller: {studioAddress}</span>
              <span className="hidden sm:inline">•</span>
              <span>Rating Studio 5.0 ★</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8BA1B4] font-bold">Studio Updates</span>
              <h4 className="text-lg font-bold text-white mt-1">Kabar Rilis Produk Baru WhereIsIt</h4>
              <p className="text-xs text-[#8E9FAA] mt-1">
                Daftarkan email kamu untuk mendapatkan info rilis batch terbaru.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="mt-4 flex max-w-md">
              <label htmlFor="footer-email" className="sr-only">Alamat Email</label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan alamat email kamu"
                required
                className="flex-1 min-h-[44px] px-4 py-3 rounded-l-full bg-[#1A222A] border border-[#2B3846] text-xs text-white placeholder-[#8E9FAA] focus:outline-none focus:border-[#8BA1B4]"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="min-h-[44px] px-6 py-3 rounded-r-full bg-[#5C7489] hover:bg-[#6D879E] text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Menyimpan...' : 'Gabung'}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Terima kasih. Email kamu tercatat untuk pembaruan studio.</span>
              </p>
            )}
          </div>
        </div>

        {/* Sitemap (3 Real Functional Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12 text-xs text-[#8E9FAA] border-b border-[#24303C]">
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Produk &amp; Rilis</h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/preorder/keychain-strava" className="text-[#8BA1B4] hover:text-white transition-colors font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8BA1B4]"></span>
                  <span>Keychain Strava (Pre-Order)</span>
                </Link>
              </li>
              <li>
                <Link href="/strava-route-lamp" className="hover:text-white transition-colors">
                  Strava Route Lamp (Coming Soon)
                </Link>
              </li>
              <li>
                <Link href="/smart-cube" className="hover:text-white transition-colors">
                  Smart Cube (Coming Soon)
                </Link>
              </li>
              <li>
                <Link href="/#lineup" className="hover:text-white transition-colors">
                  Lineup Segera Hadir
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Layanan &amp; Transparansi</h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/track" className="text-[#8BA1B4] hover:text-white transition-colors font-bold">
                  Lacak Pesanan (Track PO)
                </Link>
              </li>
              <li>
                <Link href="/preorder/keychain-strava/data" className="hover:text-white transition-colors">
                  Form Data Strava (Pasca Bayar)
                </Link>
              </li>
              <li>
                <Link href="/preorder/keychain-strava#queue" className="hover:text-white transition-colors">
                  Antrian Produksi Live
                </Link>
              </li>
              <li>
                <Link href="/preorder/keychain-strava#faq" className="hover:text-white transition-colors">
                  FAQ Pre-Order
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">
                  Studio &amp; Philosophy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Kontak Resmi Studio</h5>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={getWhatsAppAdminLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8BA1B4] hover:text-white transition-colors font-semibold"
                >
                  WhatsApp Admin: +{waNumber}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-white transition-colors"
                >
                  Email: {contactEmail}
                </a>
              </li>
              <li>
                <a
                  href="https://www.threads.com/@whereisit.ofc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Threads &amp; Instagram: @whereisit.ofc
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E9FAA]">
          <p>© {new Date().getFullYear()} WhereIsIt Studio. Kab. Karawang &amp; Jakarta.</p>
          <p className="text-center sm:text-right">Personal data. Physical products. Meaningful experiences.</p>
        </div>
      </div>
    </footer>
  );
}
