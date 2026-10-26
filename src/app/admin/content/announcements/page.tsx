'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Megaphone, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/lib/toastContext';

export default function AnnouncementsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const { showSuccess, showError } = useToast();

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
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        showSuccess('Pengumuman banner berhasil disimpan!');
        setTimeout(() => setSaved(false), 2500);
      } else {
        showError('Gagal menyimpan pengumuman.');
      }
    } catch (e) {
      showError('Terjadi kesalahan jaringan.');
    }
  };

  if (!settings) return <div className="py-20 text-center text-xs text-[#7A8B99]">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Studio Broadcast</span>
        <h1 className="text-2xl font-black text-[#14191F]">Announcement Banner</h1>
        <p className="text-xs text-[#6C7E8E] mt-0.5">
          Top banner displayed on the storefront for drop releases, free shipping thresholds, or studio notices.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 text-center">
            Announcement updated!
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="announcementActive"
            checked={settings.announcementActive}
            onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
            className="w-4 h-4 rounded border-[#DDD5C7] text-[#5C7489] focus:ring-0"
          />
          <label htmlFor="announcementActive" className="text-xs font-bold text-[#14191F] cursor-pointer">
            Display Announcement Bar on Storefront
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
            Banner Text
          </label>
          <textarea
            rows={3}
            value={settings.announcementText}
            onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
            placeholder="e.g. Complimentary insured shipping on all curated drops over Rp 1.500.000"
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Update Banner</span>
          </button>
        </div>
      </form>

    </div>
  );
}
