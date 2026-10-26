'use client';

import React, { useState, useEffect } from 'react';
import { Discount } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Tag, Plus, Trash2, CheckCircle, Clock, X } from 'lucide-react';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 10,
    minPurchase: 500000,
    usageLimit: 100,
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  });

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/discounts');
      const data = await res.json();
      if (data.success) {
        setDiscounts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchDiscounts();
        setFormData({ code: '', type: 'PERCENTAGE', value: 10, minPurchase: 500000, usageLimit: 100, status: 'ACTIVE' });
      }
    } catch (e) {
      alert('Failed to create discount');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon code?')) return;
    try {
      await fetch(`/api/discounts?id=${id}`, { method: 'DELETE' });
      fetchDiscounts();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const handleToggleStatus = async (d: Discount) => {
    const nextStatus = d.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await fetch('/api/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: d.id, status: nextStatus }),
      });
      fetchDiscounts();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Marketing & Growth</span>
          <h1 className="text-2xl font-black text-[#14191F]">Discounts & Promo Codes</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Configure percentage discounts, fixed vouchers, usage caps, and minimum cart amounts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount Code</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Promo Code</th>
                <th className="px-6 py-3.5">Discount Value</th>
                <th className="px-6 py-3.5">Min Cart Requirement</th>
                <th className="px-6 py-3.5">Redemption Count</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-sm bg-[#EDF3F7] text-[#5C7489] px-2.5 py-1 rounded-lg border border-[#D5E1E9]">
                      {d.code}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-black text-[#14191F]">
                    {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `${formatRupiah(d.value)} OFF`}
                  </td>

                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {d.minPurchase ? formatRupiah(d.minPurchase) : 'No minimum'}
                  </td>

                  <td className="px-6 py-4 font-semibold text-[#14191F]">
                    {d.usageCount} {d.usageLimit ? `/ ${d.usageLimit}` : 'uses'}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(d)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                        d.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {d.status}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ECE6DC]">
            <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#14191F]">Create Promo Discount Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#7A8B99] hover:text-[#14191F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. STUDIO20"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (IDR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder={formData.type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 50000'}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Min Spend (IDR)</label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#7A8B99] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489]"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
