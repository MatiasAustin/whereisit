'use client';

import React, { useState, useEffect } from 'react';
import { DraftOrder, Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { FileText, Plus, CheckCircle, Clock, X, Send } from 'lucide-react';

export default function DraftOrdersPage() {
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    productId: '',
    quantity: 1,
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [draftRes, prodRes] = await Promise.all([
        fetch('/api/draft-orders').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
      ]);
      if (draftRes.success) setDrafts(draftRes.data);
      if (prodRes.success) setProducts(prodRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === formData.productId) || products[0];
    if (!prod) return;

    const subtotal = prod.price * formData.quantity;
    const shippingFee = 50000;
    const total = subtotal + shippingFee;

    try {
      const res = await fetch('/api/draft-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          items: [
            {
              productId: prod.id,
              productName: prod.name,
              price: prod.price,
              quantity: formData.quantity,
              image: prod.images[0],
            }
          ],
          subtotal,
          shippingFee,
          total,
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
        setFormData({ customerName: '', email: '', phone: '', productId: '', quantity: 1, notes: '' });
      }
    } catch (e) {
      alert('Failed to create draft order');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Manual Billing & Corporate</span>
          <h1 className="text-2xl font-black text-[#14191F]">Draft Orders</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Create custom studio quotes, B2B invoices, and pre-orders with bespoke specifications.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create Draft Order</span>
        </button>
      </div>

      {/* Drafts List */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Draft #</th>
                <th className="px-6 py-3.5">Customer / Organization</th>
                <th className="px-6 py-3.5">Items Snapshot</th>
                <th className="px-6 py-3.5">Date Created</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Quoted Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {drafts.map((d) => (
                <tr key={d.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4 font-black text-[#14191F]">
                    #{d.draftNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#14191F]">{d.customerName}</p>
                    <p className="text-[11px] text-[#7A8B99]">{d.email} • {d.phone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {d.items[0]?.quantity}x {d.items[0]?.productName}
                  </td>
                  <td className="px-6 py-4 text-[#7A8B99]">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-[#14191F]">
                    {formatRupiah(d.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Draft Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ECE6DC]">
            <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#14191F]">Generate New Draft Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#7A8B99] hover:text-[#14191F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Customer / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Ruang Reka Studio"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Select 3D Product *</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.price)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44505C] mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Internal Notes & Custom Finish</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Special satin slate blue coating requested for client office reception..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs"
                />
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
                  Create & Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
