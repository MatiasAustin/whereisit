'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Truck, Save, Plus, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { useToast } from '@/lib/toastContext';
import { DEFAULT_SHIPPING_CARRIERS } from '@/lib/studioDefaults';

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [newCarrierName, setNewCarrierName] = useState('');
  const [newCarrierFee, setNewCarrierFee] = useState<number>(10000);
  const [showAddForm, setShowAddForm] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    let mounted = true;
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d && d.success && d.data) {
          const loaded = d.data as StoreSettings;
          setSettings({
            ...loaded,
            shippingCarriers: Array.isArray(loaded.shippingCarriers) && loaded.shippingCarriers.length > 0
              ? loaded.shippingCarriers
              : DEFAULT_SHIPPING_CARRIERS,
          });
        } else {
          // Fallback to defaults
          setSettings({
            shippingCarriers: DEFAULT_SHIPPING_CARRIERS,
          } as StoreSettings);
        }
      })
      .catch((err) => {
        console.error('Failed to load shipping settings:', err);
        if (mounted) {
          setSettings({
            shippingCarriers: DEFAULT_SHIPPING_CARRIERS,
          } as StoreSettings);
          showError('Gagal memuat pengaturan pengiriman.');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const carriers = settings?.shippingCarriers || [];

  const handleToggleActive = (index: number) => {
    if (!settings) return;
    const updated = carriers.map((c, i) => (i === index ? { ...c, active: !c.active } : c));
    setSettings({ ...settings, shippingCarriers: updated });
  };

  const handleFeeChange = (index: number, fee: number) => {
    if (!settings) return;
    const updated = carriers.map((c, i) => (i === index ? { ...c, fee: Math.max(0, fee) } : c));
    setSettings({ ...settings, shippingCarriers: updated });
  };

  const handleNameChange = (index: number, name: string) => {
    if (!settings) return;
    const updated = carriers.map((c, i) => (i === index ? { ...c, name } : c));
    setSettings({ ...settings, shippingCarriers: updated });
  };

  const handleDeleteCarrier = (index: number) => {
    if (!settings) return;
    const updated = carriers.filter((_, i) => i !== index);
    setSettings({ ...settings, shippingCarriers: updated });
  };

  const handleAddCarrier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newCarrierName.trim()) return;
    const updated = [
      ...carriers,
      {
        name: newCarrierName.trim(),
        fee: Math.max(0, newCarrierFee || 0),
        active: true,
      },
    ];
    setSettings({ ...settings, shippingCarriers: updated });
    setNewCarrierName('');
    setNewCarrierFee(10000);
    setShowAddForm(false);
  };

  const handleResetDefaults = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      shippingCarriers: DEFAULT_SHIPPING_CARRIERS,
    });
    showSuccess('Opsi kurir berhasil dikembalikan ke standar studio!');
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

  if (!settings) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#7A8B99] font-medium tracking-wide">Memuat pengaturan pengiriman...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Logistics & Crating</span>
          <h1 className="text-2xl font-black text-[#14191F]">Shipping & Courier Settings</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Atur kurir aktif, tarif pengiriman studio, dan opsi ekspedisi untuk pengiriman pesanan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-full border border-[#DDD5C7] text-xs font-semibold text-[#5C7489] hover:bg-white transition-colors flex items-center gap-1.5"
            title="Kembalikan ke Kurir Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-full bg-[#5C7489] text-white text-xs font-bold hover:bg-[#485C6E] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kurir</span>
          </button>
        </div>
      </div>

      {/* Add Carrier Inline Modal/Card */}
      {showAddForm && (
        <form onSubmit={handleAddCarrier} className="bg-white rounded-3xl border border-[#5C7489] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14191F] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#5C7489]" />
              <span>Tambah Opsi Ekspedisi / Kurir Baru</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#7A8B99] hover:text-[#14191F]"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#44505C] mb-1">Nama Layanan / Kurir</label>
              <input
                type="text"
                required
                placeholder="Contoh: JNE Trucking (JTR) / Paxel"
                value={newCarrierName}
                onChange={(e) => setNewCarrierName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] mb-1">Tarif (IDR)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={newCarrierFee}
                onChange={(e) => setNewCarrierFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-bold text-right focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-full border border-[#DDD5C7] text-xs font-semibold text-[#6C7E8E]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors"
            >
              Simpan Kurir
            </button>
          </div>
        </form>
      )}

      {/* Main Carrier Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan kurir dan tarif pengiriman berhasil disimpan!</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">Daftar Ekspedisi &amp; Tarif</h4>
            <span className="text-[11px] text-[#7A8B99] font-medium">{carriers.length} opsi terdaftar</span>
          </div>

          {carriers.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD5C7]">
              <Truck className="w-8 h-8 text-[#A8B5C2] mx-auto" />
              <p className="text-xs text-[#7A8B99]">Belum ada ekspedisi atau kurir yang didaftarkan.</p>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-full bg-[#5C7489] text-white text-xs font-bold hover:bg-[#485C6E] transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Muat Opsi Kurir Standar</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EBE3]">
              {carriers.filter(Boolean).map((sc, idx) => (
                <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      id={`carrier-${idx}`}
                      checked={Boolean(sc?.active)}
                      onChange={() => handleToggleActive(idx)}
                      className="w-4 h-4 rounded text-[#5C7489] focus:ring-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={sc?.name || ''}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-[#DDD5C7] focus:border-[#5C7489] focus:bg-[#FAF8F5] px-1 py-0.5 rounded font-bold text-[#14191F] text-xs focus:outline-none"
                      />
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        sc?.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sc?.active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center pl-7 sm:pl-0">
                    <span className="text-[#7A8B99] font-medium text-[11px]">Tarif:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7A8B99]">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={typeof sc?.fee === 'number' ? sc.fee : 0}
                        onChange={(e) => handleFeeChange(idx, Number(e.target.value))}
                        className="w-28 pl-7 pr-2.5 py-1.5 rounded-lg border border-[#DDD5C7] text-xs font-bold text-right bg-[#FAF8F5] focus:outline-none focus:border-[#5C7489]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCarrier(idx)}
                      className="p-1.5 text-[#A8B5C2] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      title="Hapus Ekspedisi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-between">
          <span className="text-[11px] text-[#7A8B99]">
            Perubahan tarif kurir akan tersimpan ke database studio.
          </span>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Pengiriman</span>
          </button>
        </div>
      </form>
    </div>
  );
}
