'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { FileText, Save, Eye, Layers } from 'lucide-react';

export default function HomepageEditorPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      alert('Failed to save homepage settings');
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-xs text-[#7A8B99]">Loading CMS settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Content & Brand Story</span>
        <h1 className="text-2xl font-black text-[#14191F]">Homepage & Hero Editor</h1>
        <p className="text-xs text-[#6C7E8E] mt-0.5">
          Customize brand headlines, editorial statements, and flagship studio positioning.
        </p>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 text-center">
            Homepage CMS settings updated successfully.
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
            Brand Headline & Sub-title
          </label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
            Studio Physical Address (Showroom & Lab)
          </label>
          <input
            type="text"
            value={settings.studioAddress}
            onChange={(e) => setSettings({ ...settings, studioAddress: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
            Studio Inquiries Email
          </label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
            Studio WhatsApp Hotline
          </label>
          <input
            type="text"
            value={settings.contactPhone}
            onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-between">
          <a
            href="/"
            target="_blank"
            className="text-xs font-semibold text-[#5C7489] hover:underline flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Live Storefront</span>
          </a>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Homepage CMS</span>
          </button>
        </div>
      </form>

    </div>
  );
}
