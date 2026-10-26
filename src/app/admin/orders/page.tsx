'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Order } from '@/types';
import { formatRupiah, formatUSD } from '@/lib/utils';
import { useToast } from '@/lib/toastContext';
import { 
  ShoppingBag, 
  Search, 
  Download, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  X,
  CreditCard
} from 'lucide-react';

export default function OrdersPage() {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROCESSING' | 'PRINTING' | 'SHIPPED' | 'DELIVERED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, orderStatus: Order['orderStatus']) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, orderStatus }),
      });
      showSuccess(`Status pesanan #${id} berhasil diubah menjadi ${orderStatus}!`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus } : null));
      }
    } catch (e) {
      showError('Gagal memperbarui status pesanan.');
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== 'ALL' && o.orderStatus !== activeTab) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, activeTab, search]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return alert('No orders to export.');
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'City', 'Carrier', 'Payment', 'Status', 'Total'];
    const rows = filtered.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString().split('T')[0],
      `"${o.customer.fullName}"`,
      o.customer.email,
      o.customer.phone,
      `"${o.customer.city}"`,
      `"${o.shippingCarrier}"`,
      o.paymentMethod,
      o.orderStatus,
      o.total,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whereisit-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Fulfillment & Commerce</span>
          <h1 className="text-2xl font-black text-[#14191F]">Customer Orders</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Track dispatches, print stages, customer delivery addresses, and payment settlements.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        
        {/* Toolbar & Tabs */}
        <div className="p-4 sm:p-6 border-b border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, recipient name, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {(['ALL', 'PROCESSING', 'PRINTING', 'SHIPPED', 'DELIVERED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[#14191F] text-white'
                    : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Destination</th>
                <th className="px-6 py-3.5">Courier & Payment</th>
                <th className="px-6 py-3.5">Fulfillment Stage</th>
                <th className="px-6 py-3.5 text-right">Total Amount</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4 font-black text-[#14191F]">
                    #{o.orderNumber}
                  </td>

                  <td className="px-6 py-4 text-[#7A8B99]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-[#14191F]">{o.customer.fullName}</p>
                    <p className="text-[11px] text-[#7A8B99]">{o.customer.email}</p>
                  </td>

                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {o.customer.city}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#14191F]">{o.shippingCarrier}</p>
                    <span className="text-[10px] text-[#5C7489] font-medium">{o.paymentMethod}</span>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value as any)}
                      className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] focus:outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="PRINTING">PRINTING (3D QUEUE)</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-right font-black text-[#14191F]">
                    {formatRupiah(o.total)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-1.5 rounded-lg text-[#5C7489] hover:bg-[#EDF3F7] transition-colors inline-flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[#7A8B99]">
              No orders found matching the filter.
            </div>
          )}
        </div>

      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ECE6DC] max-h-[90vh] overflow-y-auto no-scrollbar space-y-6">
            <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-[#5C7489]">Order Breakdown</span>
                <h2 className="text-2xl font-black text-[#14191F]">Invoice #{selectedOrder.orderNumber}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#7A8B99]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Card */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE6DC] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Customer:</span>
                <span className="font-bold">{selectedOrder.customer.fullName} ({selectedOrder.customer.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Shipping Address:</span>
                <span className="font-medium text-right max-w-xs">{selectedOrder.customer.address}, {selectedOrder.customer.city} {selectedOrder.customer.postalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Courier:</span>
                <span className="font-bold text-[#5C7489]">{selectedOrder.shippingCarrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Payment Channel:</span>
                <span className="font-bold text-emerald-700">{selectedOrder.paymentMethod} • {selectedOrder.paymentStatus}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14191F]">Ordered Pieces</h4>
              <div className="divide-y divide-[#F0EBE3]">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#ECE6DC] shrink-0">
                        <Image src={it.image} alt={it.productName} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[#14191F]">{it.productName}</p>
                        <p className="text-[10px] text-[#7A8B99]">{it.quantity}x • Finish: {it.selectedColor || 'Standard'}</p>
                      </div>
                    </div>
                    <span className="font-black text-[#14191F]">{formatRupiah(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal & Total */}
            <div className="pt-3 border-t border-[#ECE6DC] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#667584]">
                <span>Items Subtotal</span>
                <span>{formatRupiah(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#667584]">
                <span>Shipping Courier</span>
                <span>{formatRupiah(selectedOrder.shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-[#ECE6DC] flex justify-between text-base font-black text-[#14191F]">
                <span>Total Settled</span>
                <span>{formatRupiah(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#ECE6DC] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
