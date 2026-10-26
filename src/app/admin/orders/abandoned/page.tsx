'use client';

import React, { useState, useEffect } from 'react';
import { AbandonedCheckout } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { ShoppingCart, Mail, Phone, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export default function AbandonedPage() {
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/abandoned')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAbandoned(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Conversion Recovery</span>
        <h1 className="text-2xl font-black text-[#14191F]">Abandoned Checkouts</h1>
        <p className="text-xs text-[#6C7E8E] mt-0.5">
          Customers who reached the checkout step without completing payment.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Checkout ID</th>
                <th className="px-6 py-3.5">Customer Contact</th>
                <th className="px-6 py-3.5">Abandoned Items</th>
                <th className="px-6 py-3.5">Cart Subtotal</th>
                <th className="px-6 py-3.5">Recovery Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {abandoned.map((ab) => (
                <tr key={ab.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4 font-black text-[#14191F]">
                    #{ab.checkoutNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#14191F]">{ab.customerEmail}</p>
                    <p className="text-[11px] text-[#7A8B99]">{ab.customerPhone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {ab.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-black text-[#14191F]">
                    {formatRupiah(ab.subtotal)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      {ab.recoveryStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => alert(`Recovery email triggered for ${ab.customerEmail}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#5C7489] text-white text-xs font-semibold hover:bg-[#4E6377] transition-colors inline-flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Recovery Offer</span>
                    </button>
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
