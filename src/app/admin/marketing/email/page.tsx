'use client';

import React, { useState, useEffect } from 'react';
import { Subscriber } from '@/types';
import { Mail, Download, Search, CheckCircle } from 'lucide-react';

export default function EmailPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subscribers')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSubscribers(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (subscribers.length === 0) return alert('No subscribers to export.');
    const headers = ['Email', 'Source', 'Date Subscribed'];
    const rows = subscribers.map((s) => [s.email, s.source, s.createdAt]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whereisit-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Audience Growth</span>
          <h1 className="text-2xl font-black text-[#14191F]">Email Capture & Subscribers</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Opt-in subscribers gathered from the storefront newsletter for limited drops and private releases.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Subscribers CSV</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#ECE6DC]">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subscriber email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Subscriber Email</th>
                <th className="px-6 py-3.5">Capture Channel</th>
                <th className="px-6 py-3.5">Subscribed Date</th>
                <th className="px-6 py-3.5 text-right">Marketing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#14191F]">
                    {s.email}
                  </td>
                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {s.source}
                  </td>
                  <td className="px-6 py-4 text-[#7A8B99]">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Subscribed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
