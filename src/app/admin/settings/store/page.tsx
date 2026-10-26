'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Settings, Save, Check } from 'lucide-react';

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
          General studio information, legal entity, and operational contacts.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-5">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 text-center">
            Store settings saved successfully!
          </div>
        )}

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
