'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Download,
  ExternalLink,
  Save,
  Server,
  CloudUpload,
  Layers,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/lib/toastContext';

interface TableHealth {
  name: string;
  exists: boolean;
  count: number;
  error?: string;
}

interface SupabaseConfigState {
  url: string;
  anonKeyMasked: string;
  serviceRoleKeyMasked: string;
  hasStoredConfig: boolean;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  isConfigured: boolean;
  source: 'dashboard' | 'env' | 'none';
  updatedAt?: string | null;
}

export default function SupabaseDatabaseSettingsPage() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SupabaseConfigState | null>(null);
  const [tables, setTables] = useState<TableHealth[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Form states
  const [inputUrl, setInputUrl] = useState('');
  const [inputAnonKey, setInputAnonKey] = useState('');
  const [inputServiceKey, setInputServiceKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);

  // SQL schema state
  const [sqlContent, setSqlContent] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  // Fetch initial config and health
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/supabase');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setInputUrl(data.config.url || '');
        setIsConnected(Boolean(data.health?.connected));
        setTables(data.health?.tables || []);
        setHealthError(data.health?.error || null);
      } else {
        showError(data.error || 'Gagal memuat status Supabase');
      }
    } catch (err: any) {
      showError(err.message || 'Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch SQL schema content
  useEffect(() => {
    fetchData();
    fetch('/supabase-schema.sql')
      .then((r) => r.text())
      .then((txt) => {
        if (txt && !txt.includes('<!DOCTYPE html>')) {
          setSqlContent(txt);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) {
      showError('Supabase Project URL wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl.trim(),
          anonKey: inputAnonKey.trim(),
          serviceRoleKey: inputServiceKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message || 'Konfigurasi Supabase berhasil disimpan!');
        setInputAnonKey('');
        setInputServiceKey('');
        await fetchData();
      } else {
        showError(data.error || 'Gagal menyimpan konfigurasi');
      }
    } catch (err: any) {
      showError(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  // Handle Reset to .env
  const handleResetToEnv = async () => {
    if (!confirm('Reset pengaturan Supabase di dashboard dan gunakan kembali konfigurasi default dari file .env?')) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearStored: true }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Konfigurasi berhasil direset ke nilai environment variables!');
        setInputAnonKey('');
        setInputServiceKey('');
        await fetchData();
      } else {
        showError(data.error || 'Gagal mereset konfigurasi');
      }
    } catch (err: any) {
      showError(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/admin/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl.trim(),
          key: inputServiceKey.trim() || inputAnonKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIsConnected(data.data.connected);
        setTables(data.data.tables || []);
        setHealthError(data.data.error || null);
        if (data.data.connected) {
          showSuccess('Koneksi ke Supabase berhasil!');
        } else {
          showError(data.data.error || 'Gagal menghubungkan ke Supabase');
        }
      }
    } catch (err: any) {
      showError(err.message || 'Uji koneksi gagal');
    } finally {
      setTesting(false);
    }
  };

  // Handle Data Sync to Supabase
  const handleSyncToSupabase = async () => {
    if (!confirm('Mulai sinkronisasi seluruh data lokal (produk, antrian PO Strava, store settings, koleksi, dan kontak) ke Supabase?')) {
      return;
    }
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/supabase/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Sinkronisasi data ke Supabase berhasil!');
        setSyncResult(data.report);
        await fetchData();
      } else {
        showError(data.error || 'Sinkronisasi gagal');
      }
    } catch (err: any) {
      showError(err.message || 'Gagal sinkronisasi data');
    } finally {
      setSyncing(false);
    }
  };

  // Copy SQL script to clipboard
  const handleCopySql = () => {
    if (!sqlContent) return;
    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    showSuccess('SQL schema berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ECE6DC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#5C7489]/10 text-[#5C7489]">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-[#14191F] tracking-tight">
              Supabase Database &amp; Cloud Connection
            </h1>
          </div>
          <p className="text-xs text-[#556473] mt-1.5 leading-relaxed">
            Kelola koneksi basis data Supabase untuk seluruh website, sinkronkan antrian produksi &amp; katalog produk,
            dan perbarui kredensial kapan saja langsung dari dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Connection Status Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isConnected
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            {isConnected ? (
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </span>
            ) : (
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="w-5 h-5" />
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">
                  {isConnected ? 'Supabase Terhubung & Aktif' : 'Supabase Belum Terhubung / Perlu Setup'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isConnected ? 'bg-emerald-200/60 text-emerald-800' : 'bg-amber-200/60 text-amber-800'
                  }`}
                >
                  {config?.source === 'dashboard' ? 'Dashboard Config' : config?.source === 'env' ? 'ENV File' : 'Not Set'}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {isConnected
                  ? `Website aktif membaca dan menulis data ke ${config?.url}`
                  : healthError || 'Kredensial belum diisi atau tabel database belum dibuat di project Supabase baru.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-semibold border border-current/20 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Connection Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ECE6DC] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE6DC]">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#5C7489]" />
                <h2 className="text-sm font-bold text-[#14191F]">Pengaturan Kredensial Supabase</h2>
              </div>
              {config?.hasStoredConfig && (
                <button
                  type="button"
                  onClick={handleResetToEnv}
                  className="text-[11px] font-semibold text-[#5C7489] hover:text-[#14191F] flex items-center gap-1"
                  title="Kembalikan ke file .env"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ke .env</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5">
                Supabase Project URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] font-mono"
              />
              <p className="text-[11px] text-[#7A8B99] mt-1">
                Ditemukan di Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#44505C]">
                  Anon Public Key
                </label>
                {config?.hasAnonKey && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                    Tersimpan ({config.anonKeyMasked})
                  </span>
                )}
              </div>
              <input
                type="password"
                value={inputAnonKey}
                onChange={(e) => setInputAnonKey(e.target.value)}
                placeholder={config?.hasAnonKey ? 'Ketik kunci baru untuk mengganti (biarkan kosong jika tidak berubah)' : 'eyJhbGciOiJIUzI1NiIs...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] font-mono"
              />
              <p className="text-[11px] text-[#7A8B99] mt-1">
                Anon public key (aman untuk client-side browser).
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5C7489]" />
                  <label className="block text-xs font-bold text-[#44505C]">
                    Service Role Secret Key <span className="text-emerald-700 text-[10px]">(Sangat Direkomendasikan)</span>
                  </label>
                </div>
                {config?.hasServiceRoleKey && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                    Tersimpan ({config.serviceRoleKeyMasked})
                  </span>
                )}
              </div>
              <input
                type="password"
                value={inputServiceKey}
                onChange={(e) => setInputServiceKey(e.target.value)}
                placeholder={config?.hasServiceRoleKey ? 'Ketik kunci baru untuk mengganti (biarkan kosong jika tidak berubah)' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489] font-mono"
              />
              <p className="text-[11px] text-[#7A8B99] mt-1">
                Digunakan server-side pada Route Handlers Vercel untuk bypass RLS antrian produksi secara aman.
              </p>
            </div>

            <div className="pt-3 border-t border-[#ECE6DC] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors"
              >
                {testing ? 'Sedang Menguji...' : 'Uji Kredensial Ini'}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
              </button>
            </div>
          </form>

          {/* Sync Local Data to Supabase Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ECE6DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#ECE6DC]">
              <CloudUpload className="w-4 h-4 text-[#5C7489]" />
              <h2 className="text-sm font-bold text-[#14191F]">1-Click Data Migration ke Supabase</h2>
            </div>
            <p className="text-xs text-[#556473] leading-relaxed">
              Pindahkan seluruh katalog produk, antrian pre-order Strava, daftar peminat Segera Hadir,
              dan profil toko yang tersimpan di server ke basis data Supabase baru secara instan.
            </p>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={syncing || !isConnected}
              className="w-full py-3 rounded-2xl bg-[#5C7489] hover:bg-[#4B6072] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CloudUpload className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
              <span>{syncing ? 'Sedang Memigrasikan Data...' : 'Sinkronisasi Semua Data Lokal ke Supabase'}</span>
            </button>

            {syncResult && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs space-y-1.5 font-mono text-[11px]">
                <p className="font-bold text-[#14191F] font-sans">Laporan Hasil Sinkronisasi:</p>
                {Object.entries(syncResult).map(([table, res]: [string, any]) => (
                  <div key={table} className="flex items-center justify-between">
                    <span className="text-[#556473]">{table}:</span>
                    {res.error ? (
                      <span className="text-red-600 font-semibold">{res.error}</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">{res.count} record berhasil</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tables Health & SQL Schema (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tables Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-[#ECE6DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE6DC]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5C7489]" />
                <h2 className="text-sm font-bold text-[#14191F]">Status Tabel Supabase (15 Tabel)</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] text-[#556473]">
                {tables.filter((t) => t.exists).length}/{tables.length || 15} Siap
              </span>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar text-xs">
              {tables.length > 0 ? (
                tables.map((tbl) => (
                  <div
                    key={tbl.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7DD]"
                  >
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      {tbl.exists ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className={tbl.exists ? 'text-[#14191F] font-semibold' : 'text-[#7A8B99]'}>
                        {tbl.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-[#5C7489]">
                      {tbl.exists ? `${tbl.count} baris` : 'Belum Dibuat'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#7A8B99]">
                  {isConnected ? 'Sedang memeriksa tabel...' : 'Hubungkan Supabase untuk melihat tabel'}
                </div>
              )}
            </div>
          </div>

          {/* SQL Schema Script Box */}
          <div className="bg-[#14191F] text-white rounded-3xl p-6 border border-[#232D37] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232D37]">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>SQL Schema Supabase Baru</span>
                </h2>
                <p className="text-[11px] text-[#8E9FAA] mt-0.5">
                  Jalankan skrip ini sekali di Supabase SQL Editor.
                </p>
              </div>

              <a
                href="https://supabase.com/dashboard/project/_/sql"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-[#8E9FAA] hover:text-white hover:bg-[#1E2630] transition-colors"
                title="Buka Supabase SQL Editor"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="w-full py-2.5 rounded-xl bg-white text-[#14191F] text-xs font-bold hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seluruh SQL Script (15 Tabel + RLS)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <a
                  href="/supabase-schema.sql"
                  download="whereisit-supabase-schema.sql"
                  className="flex-1 py-2 rounded-xl bg-[#1E2630] hover:bg-[#283340] text-[11px] font-semibold text-[#B8C8D4] text-center border border-[#2E3C4B] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Download File .sql</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowSqlPreview(!showSqlPreview)}
                  className="px-3 py-2 rounded-xl bg-[#1E2630] hover:bg-[#283340] text-[11px] font-semibold text-[#8E9FAA] border border-[#2E3C4B] transition-colors"
                >
                  {showSqlPreview ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
            </div>

            {showSqlPreview && (
              <div className="mt-3 p-3 rounded-xl bg-[#0B0E12] border border-[#232D37] max-h-[220px] overflow-y-auto font-mono text-[10px] text-[#A2B4C2] leading-relaxed no-scrollbar select-all">
                <pre>{sqlContent || '-- Loading schema...'}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
