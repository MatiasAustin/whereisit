'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Settings, Save, Check, Sparkles } from 'lucide-react';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';
import Logo from '@/components/brand/Logo';

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  if (!settings) return <div className="py-20 text-center text-xs text-[#7A8B99]">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Preferences</span>
        <h1 className="text-2xl font-black text-[#14191F]">Store Profile & Studio Details</h1>
        <p className="text-xs text-[#6C7E8E] mt-0.5">
          General studio information, custom logo upload with auto-compression, and operational contacts.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Store profile & custom logo updated successfully!</span>
          </div>
        )}

        {/* Custom Brand Logo Upload Section */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD4] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#14191F]">Official Brand Logo (PNG / WebP)</h3>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#5C7489] font-semibold bg-[#EDF3F7] px-2 py-0.5 rounded-full border border-[#D5E1E9]">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Compress</span>
                </span>
              </div>
              <p className="text-[11px] text-[#7A8B99] mt-0.5">
                Upload your custom logo PNG with transparent background. It will be auto-compressed without losing sharpness.
              </p>
            </div>
            {settings.logoUrl && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Custom Logo Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <ImageUploadWithCompress
              value={settings.logoUrl || ''}
              onChange={(url) => setSettings({ ...settings, logoUrl: url })}
              label="Upload Custom Logo"
              helperText="Upload transparent PNG, WebP or SVG (Auto-compressed)"
              compressionOptions={{ maxWidth: 800, maxHeight: 400, quality: 0.9, preserveAlpha: true }}
            />

            <div className="p-4 rounded-xl border border-[#ECE6DC] bg-white flex flex-col items-center justify-center space-y-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8E9FAA]">Live Preview on Navbar</span>
              <div className="p-4 bg-[#F8F6F1] rounded-xl border border-[#ECE6DC] w-full flex items-center justify-center min-h-[80px]">
                <Logo customLogoUrl={settings.logoUrl} variant="full" size="md" showStudioTag />
              </div>
              <p className="text-[11px] text-[#8E9FAA] text-center">
                {settings.logoUrl ? 'Custom logo active across Navbar, Footer & Admin' : 'Using default studio 3D isometric vector logo'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1">Store / Studio Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1">Studio Motto / Tagline</label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#44505C] mb-1">Official Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#44505C] mb-1">WhatsApp / Phone</label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1">Studio Showroom Physical Address</label>
          <textarea
            rows={2}
            value={settings.studioAddress}
            onChange={(e) => setSettings({ ...settings, studioAddress: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div className="pt-3 border-t border-[#ECE6DC] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Profile</span>
          </button>
        </div>
      </form>

    </div>
  );
}
