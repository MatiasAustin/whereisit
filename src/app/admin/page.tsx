'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  Layers,
  Tag,
  Users,
  Compass,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import ProductFormModal from '@/components/admin/ProductFormModal';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[#7A8B99] font-medium">Loading studio metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Studio Overview</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14191F] tracking-tight">
            Dashboard & Operations
          </h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Real-time status of 3D orders, bespoke design inquiries, and inventory production.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders/draft"
            className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors shadow-sm"
          >
            Create Draft Order
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add 3D Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Kalana Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A8B99] mb-2">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="p-2 rounded-xl bg-[#EDF3F7] text-[#5C7489]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#14191F]">{formatRupiah(data.totalSales)}</h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A8B99] mb-2">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="p-2 rounded-xl bg-[#EDF3F7] text-[#5C7489]">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#14191F]">{data.totalOrders} Orders</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#5C7489] font-medium mt-1">
              <span>Checkout Foundation Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A8B99] mb-2">
            <span className="text-xs font-semibold">Average Order Value</span>
            <div className="p-2 rounded-xl bg-[#EDF3F7] text-[#5C7489]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#14191F]">{formatRupiah(data.avgOrderValue)}</h3>
            <span className="text-[11px] text-[#7A8B99]">Across ready & bespoke items</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A8B99] mb-2">
            <span className="text-xs font-semibold">Catalog Asset Value</span>
            <div className="p-2 rounded-xl bg-[#EDF3F7] text-[#5C7489]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-[#14191F] truncate">{formatRupiah(data.totalCatalogValue)}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">{data.totalProducts} unique silhouettes</span>
          </div>
        </div>
      </div>

      {/* Operational Attention Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Urgent Inquiries Widget */}
        <div className="bg-white p-6 rounded-3xl border border-[#ECE6DC] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#EDF3F7] text-[#5C7489]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#14191F]">Bespoke Consultation Requests</h4>
                <p className="text-xs text-[#6C7E8E]">Client briefs awaiting 3D parametric review & quote</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {data.pendingInquiriesCount} Pending
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {data.recentDesignInquiries.map((inq: any) => (
              <div key={inq.id} className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#14191F]">{inq.clientName}</p>
                  <p className="text-[11px] text-[#7A8B99] line-clamp-1">{inq.projectType} • {inq.description}</p>
                </div>
                <Link
                  href="/admin/custom/design"
                  className="px-3 py-1 rounded-full bg-[#5C7489] text-white text-[11px] font-semibold hover:bg-[#4E6377] shrink-0"
                >
                  Review Brief
                </Link>
              </div>
            ))}
          </div>

          <Link
            href="/admin/custom/design"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C7489] hover:underline"
          >
            <span>View All Custom Briefs ({data.recentDesignInquiries.length + data.recentCharacterInquiries.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Low Stock & 3D Print Queue Alert */}
        <div className="bg-white p-6 rounded-3xl border border-[#ECE6DC] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#14191F]">3D Print Queue & Low Stock</h4>
                <p className="text-xs text-[#6C7E8E]">Items below buffer stock requiring machine scheduling</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800">
              {data.lowStockCount} Items
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {data.lowStockItems.map((prod: any) => (
              <div key={prod.id} className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE6DC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#ECE6DC] shrink-0">
                    <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-[#14191F] line-clamp-1">{prod.name}</p>
                    <p className="text-[11px] text-amber-600 font-semibold">{prod.stock} units left in stock</p>
                  </div>
                </div>
                <Link
                  href="/admin/products/inventory"
                  className="px-3 py-1 rounded-full bg-[#14191F] text-white text-[11px] font-semibold hover:bg-[#5C7489] shrink-0"
                >
                  Adjust Stock
                </Link>
              </div>
            ))}
          </div>

          <Link
            href="/admin/products/inventory"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C7489] hover:underline"
          >
            <span>Open Inventory & Machine Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#ECE6DC] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#14191F]">Recent Orders & Dispatches</h3>
            <p className="text-xs text-[#7A8B99]">Latest studio orders placed via online storefront</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#5C7489] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Order Number</th>
                <th className="px-6 py-3.5">Recipient</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Courier</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {data.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4 font-black text-[#14191F]">
                    <Link href="/admin/orders" className="hover:text-[#5C7489]">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#14191F]">{order.customer.fullName}</p>
                    <p className="text-[11px] text-[#7A8B99]">{order.customer.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#44505C]">{order.items.length} items</p>
                    <p className="text-[10px] text-[#7A8B99] line-clamp-1">{order.items[0]?.productName}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {order.shippingCarrier}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EDF3F7] text-[#5C7489]">
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-[#14191F]">
                    {formatRupiah(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={null}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchOverview}
      />

    </div>
  );
}
