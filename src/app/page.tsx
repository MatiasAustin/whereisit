'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/storefront/Navbar';
import Hero from '@/components/storefront/Hero';
import StravaFeaturedBanner from '@/components/storefront/StravaFeaturedBanner';
import ComingSoonLineupSection from '@/components/storefront/ComingSoonLineupSection';
import Footer from '@/components/storefront/Footer';
import { StoreSettings } from '@/types';
import { INITIAL_SETTINGS, DEFAULT_HOMEPAGE_CONTENT } from '@/lib/studioDefaults';

export default function HomePage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    // 1. Instant hydration from client storage to prevent image flicker on refresh
    try {
      if (typeof window !== 'undefined') {
        const cachedSettings = localStorage.getItem('whereisit_store_settings_override');
        const cachedMedia = localStorage.getItem('whereisit_strava_media_override');
        
        let initialMerged: StoreSettings = { ...INITIAL_SETTINGS };
        if (cachedSettings) {
          const parsed = JSON.parse(cachedSettings);
          if (parsed && typeof parsed === 'object') {
            initialMerged = { ...initialMerged, ...parsed };
          }
        }
        if (cachedMedia) {
          const parsedMedia = JSON.parse(cachedMedia);
          if (parsedMedia?.heroImage) {
            initialMerged.homepageContent = {
              ...(initialMerged.homepageContent || DEFAULT_HOMEPAGE_CONTENT),
              heroMainImage: parsedMedia.heroImage,
            };
          }
        }
        setSettings(initialMerged);
      }
    } catch (e) {
      console.warn('Could not read cached settings override:', e);
    }

    // 2. Fetch fresh settings and media with cache-busting
    Promise.all([
      fetch(`/api/settings?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      }).then((res) => res.json()).catch(() => null),
      fetch(`/api/strava-media?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      }).then((res) => res.json()).catch(() => null),
    ]).then(([settingsRes, mediaRes]) => {
      if (settingsRes?.success && settingsRes.data) {
        const freshSettings: StoreSettings = {
          ...settingsRes.data,
          homepageContent: {
            ...DEFAULT_HOMEPAGE_CONTENT,
            ...(settingsRes.data.homepageContent || {}),
          },
        };
        if (mediaRes?.success && mediaRes.data?.heroImage && freshSettings.homepageContent) {
          freshSettings.homepageContent.heroMainImage = mediaRes.data.heroImage;
        }
        setSettings(freshSettings);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('whereisit_store_settings_override', JSON.stringify(freshSettings));
          }
        } catch {}
      }
    });
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
      </main>

      <Footer storeSettings={settings} />
    </div>
  );
}
