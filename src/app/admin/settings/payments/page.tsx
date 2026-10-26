'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { CreditCard, Save, CheckCircle2, Shield } from 'lucide-react';

export default function PaymentsSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      });
  }, []);

  const handleToggleActive = (index: number) => {
    if (!settings) return;
    const pm = [...settings.paymentMethods];
    pm[index].active = !pm[index].active;
    setSettings({ ...settings, paymentMethods: pm });
  };

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
      alert('Failed to save payment settings');
    }
  };

  if (!settings) return <div className="py-20 text-center text-xs text-[#7A8B99]">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Settlement & Gateway</span>
        <h1 className="text-2xl font-black text-[#14191F]">Payment Methods & Gateways</h1>
        <p className="text-xs text-[#6C7E8E] mt-0.5">
          Enable or disable payment channels (QRIS, Virtual Accounts, Credit Cards) for checkout settlement.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-5">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 text-center">
            Payment gateways configuration saved!
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">Supported Channels</h4>

          <div className="divide-y divide-[#F0EBE3]">
            {settings.paymentMethods.map((pm, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={pm.active}
                    onChange={() => handleToggleActive(idx)}
                    className="w-4 h-4 rounded text-[#5C7489] focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-[#14191F] block">{pm.name}</span>
                    <span className="text-[10px] text-[#7A8B99] font-mono uppercase">{pm.type}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pm.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {pm.active ? 'Active on Checkout' : 'Disabled'}
                </span>
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
            <span>Save Payment Gateways</span>
          </button>
        </div>
      </form>

    </div>
  );
}
