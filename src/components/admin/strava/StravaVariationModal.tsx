'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { StravaVariation } from '@/types';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';

interface StravaVariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  variation: StravaVariation | null;
  onSave: (variation: StravaVariation) => void;
}

export function StravaVariationModal({
  isOpen,
  onClose,
  variation,
  onSave,
}: StravaVariationModalProps) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [badge, setBadge] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [price, setPrice] = useState(119000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [image, setImage] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Gantungan kunci 3D print timbul rute lari custom',
    'Rute 3D relief dengan garis oranye Strava',
    'Termasuk ring stainless steel',
  ]);
  const [includesEmoney, setIncludesEmoney] = useState(false);
  const [emoneyNote, setEmoneyNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (variation) {
      setName(variation.name);
      setId(variation.id);
      setBadge(variation.badge || '');
      setIsPopular(Boolean(variation.isPopular));
      setPrice(variation.price);
      setOriginalPrice(variation.originalPrice);
      setImage(variation.image || '');
      setShortDesc(variation.shortDesc || '');
      setFeatures(
        variation.features && variation.features.length > 0
          ? variation.features
          : ['Gantungan kunci 3D print timbul rute lari custom']
      );
      setIncludesEmoney(Boolean(variation.includesEmoney));
      setEmoneyNote(variation.emoneyNote || '');
    } else {
      setName('');
      setId(`var-${Date.now().toString(36).toLowerCase()}`);
      setBadge('New Variant');
      setIsPopular(false);
      setPrice(119000);
      setOriginalPrice(undefined);
      setImage('/images/strava-keychain/keychain-04.jpg');
      setShortDesc('Gantungan kunci 3D print custom rute Strava personal.');
      setFeatures([
        '1x gantungan kunci 3D print rute lari custom',
        'Rute 3D timbul dengan garis oranye khas Strava',
        'Termasuk ring gantungan kunci stainless steel',
      ]);
      setIncludesEmoney(false);
      setEmoneyNote('');
    }
    setErrorMsg('');
  }, [variation, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleUpdateFeature = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama varian wajib diisi');
      return;
    }

    const varId = id.trim() || `var-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const cleanedFeatures = features.map((f) => f.trim()).filter((f) => f.length > 0);

    const result: StravaVariation = {
      id: varId,
      name: name.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      badge: badge.trim() || undefined,
      isPopular,
      image: image || '/images/strava-keychain/keychain-04.jpg',
      shortDesc: shortDesc.trim(),
      features: cleanedFeatures.length > 0 ? cleanedFeatures : ['Gantungan kunci 3D print custom rute'],
      includesEmoney,
      emoneyNote: includesEmoney ? (emoneyNote.trim() || 'Chip kartu tap terpasang') : undefined,
    };

    onSave(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-[#ECE6DC] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE6DC] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#14191F]">
                {variation ? 'Edit Varian Keychain Strava' : 'Tambah Varian Baru Pre-Order Strava'}
              </h2>
              <p className="text-xs text-[#6C7E8E]">
                Varian ini akan langsung tampil di website live (/preorder/keychain-strava) dan tersimpan di Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Nama Varian *
              </label>
              <input
                type="text"
                required
                placeholder="cth: 5.7x9.4 cm + Mandiri e-money"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!variation) {
                    setId(`var-${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-semibold focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                ID Varian (Slug Unik)
              </label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Harga Varian (IDR) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-bold text-[#14191F] focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Harga Coret (Opsional)
              </label>
              <input
                type="number"
                placeholder="cth: 220000"
                value={originalPrice ?? ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                Badge Pill
              </label>
              <input
                type="text"
                placeholder="cth: Paling Populer, New"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          {/* Popular toggle */}
          <div className="flex items-center gap-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE6DC]">
            <input
              type="checkbox"
              id="isPopular"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 rounded text-[#5C7489] focus:ring-[#5C7489]"
            />
            <label htmlFor="isPopular" className="text-xs font-semibold text-[#14191F] cursor-pointer">
              Tandai sebagai Varian Populer (Card berbingkai khusus di halaman pembeli)
            </label>
          </div>

          {/* E-Money Toggle & Note */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE6DC] space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includesEmoney"
                checked={includesEmoney}
                onChange={(e) => setIncludesEmoney(e.target.checked)}
                className="w-4 h-4 rounded text-[#5C7489] focus:ring-[#5C7489]"
              />
              <label htmlFor="includesEmoney" className="text-xs font-bold text-[#14191F] cursor-pointer">
                Termasuk Kartu / Chip E-Money Tap
              </label>
            </div>

            {includesEmoney && (
              <div>
                <label className="block text-[10px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
                  Catatan E-Money
                </label>
                <input
                  type="text"
                  placeholder="cth: Chip Mandiri e-money asli, saldo Rp0. Bisa isi via NFC HP."
                  value={emoneyNote}
                  onChange={(e) => setEmoneyNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
              Foto Produk Varian
            </label>
            <ImageUploadWithCompress
              label={`Foto Varian: ${name || 'Baru'}`}
              value={image}
              onChange={(newUrl) => setImage(newUrl)}
              aspectRatio="square"
              compressionOptions={{ maxWidth: 1000, maxHeight: 1000, quality: 0.82, preserveAlpha: false }}
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-[11px] font-bold text-[#44505C] uppercase tracking-wider mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              required
              placeholder="Deskripsi singkat varian..."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          {/* Features bullet list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#44505C] uppercase tracking-wider">
                Fitur &amp; Spesifikasi Varian (Poin-Poin)
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="text-xs font-semibold text-[#5C7489] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Poin</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                    placeholder={`Fitur #${idx + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 text-[#7A8B99] hover:text-red-600 rounded-lg transition-colors"
                      title="Hapus poin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#556473] hover:bg-[#FAF8F5] transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Varian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
