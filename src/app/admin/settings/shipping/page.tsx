'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Truck, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { useToast } from '@/lib/toastContext';

export default function ShippingSettingsPage() {
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

  const handleToggleActive = (index: number) => {
    if (!settings) return;
    const carriers = [...settings.shippingCarriers];
    carriers[index].active = !carriers[index].active;
    setSettings({ ...settings, shippingCarriers: carriers });
  };

  const handleFeeChange = (index: number, fee: number) => {
    if (!settings) return;
    const carriers = [...settings.shippingCarriers];
    carriers[index].fee = fee;
    setSettings({ ...settings, shippingCarriers: carriers });
  };

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
        showSuccess('Tarif dan opsi pengiriman berhasil disimpan!');
        setTimeout(() => setSaved(false), 2500);
      } else {
        showError('Gagal menyimpan pengaturan pengiriman.');
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
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Logistics & Crating</span>
        <h1 className="text-2xl font-black text-[#14191F]">Shipping & Courier Settings</h1>
        <p className="text-xs text-[#6C7E8E] mt-0.5">
          Configure active couriers, domestic delivery rates, and wooden crating options for furniture.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-5">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 text-center">
            Shipping rates saved successfully!
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">Active Couriers & Flat Rates</h4>
          
          <div className="divide-y divide-[#F0EBE3]">
            {settings.shippingCarriers.map((sc, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sc.active}
                    onChange={() => handleToggleActive(idx)}
                    className="w-4 h-4 rounded text-[#5C7489] focus:ring-0"
                  />
                  <span className="font-bold text-[#14191F]">{sc.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#7A8B99]">Rate:</span>
                  <input
                    type="number"
                    value={sc.fee}
                    onChange={(e) => handleFeeChange(idx, Number(e.target.value))}
                    className="w-24 px-2.5 py-1 rounded-lg border border-[#DDD5C7] text-xs font-bold text-right"
                  />
                  <span className="text-[#7A8B99]">IDR</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[#ECE6DC] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Shipping Config</span>
          </button>
        </div>
      </form>

    </div>
  );
}
