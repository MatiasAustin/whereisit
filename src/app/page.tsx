'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/storefront/Navbar';
import Hero from '@/components/storefront/Hero';
import StravaFeaturedBanner from '@/components/storefront/StravaFeaturedBanner';
import ComingSoonLineupSection from '@/components/storefront/ComingSoonLineupSection';
import AboutSection from '@/components/storefront/AboutSection';
import StudioCraft from '@/components/storefront/StudioCraft';
import Footer from '@/components/storefront/Footer';
import { StoreSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/lib/studioDefaults';

export default function HomePage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToLineup = () => {
    const el = document.getElementById('lineup');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <Navbar storeSettings={settings} />

      <main className="flex-grow">
        {/* Hero with Buyable Keychain Showcase */}
        <Hero onGoToLineup={scrollToLineup} storeSettings={settings} />

        {/* Featured Keychain Spotlight */}
        <StravaFeaturedBanner />

        {/* Coming Soon Highlights (Lamp & Smart Cube) + 6-Item Segera Hadir Lineup */}
        <ComingSoonLineupSection />

        {/* 01/ Brand Philosophy & Context */}
        <AboutSection content={settings.homepageContent} />

        {/* Studio Craft & Technical Excellence */}
        <StudioCraft content={settings.homepageContent} />
      </main>

      <Footer storeSettings={settings} />
    </div>
  );
}
