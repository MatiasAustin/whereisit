'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Layers, 
  PieChart,
  Calendar,
  Sparkles,
  Inbox
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { Product, Order, StravaPreOrder } from '@/types';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stravaOrders, setStravaOrders] = useState<StravaPreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, stravaRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/strava-orders').then((r) => r.json()),
      ]);
      if (prodRes.success) setProducts(prodRes.data || []);
      if (ordRes.success) setOrders(ordRes.data || []);
      if (stravaRes.success) {
        const realStrava = (stravaRes.data || []).filter(
          (o: StravaPreOrder) => !o.isExample && !o.id.includes('EXAMPLE')
        );
        setStravaOrders(realStrava);
      }
    } catch (e) {
      console.error('Error fetching analytics data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute live studio metrics
  const storeSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const stravaSales = stravaOrders.reduce((sum, o) => sum + (o.total || o.price || 0), 0);
  const totalSales = storeSales + stravaSales;

  const totalOrders = orders.length + stravaOrders.length;
  const completedOrders = 
    orders.filter((o) => o.orderStatus === 'DELIVERED' || o.orderStatus === 'SHIPPED').length +
    stravaOrders.filter((o) => o.status === 'Selesai' || o.status === 'Dikirim').length;

  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Real Category Revenue
  const categoryStats: { [cat: string]: number } = {};
  // Seed with categories of existing products
  products.forEach((p) => {
    if (p.category && !categoryStats[p.category]) {
      categoryStats[p.category] = 0;
    }
  });

  // Default standard categories if none exist yet
  if (Object.keys(categoryStats).length === 0) {
    categoryStats['Desk Objects'] = 0;
  }

  // Aggregate orders
  orders.forEach((o) => {
    o.items?.forEach((it) => {
      const prod = products.find((p) => p.name === it.productName || p.id === it.productId);
      const cat = prod?.category || 'Desk Objects';
      categoryStats[cat] = (categoryStats[cat] || 0) + (it.price * it.quantity);
    });
  });

  // Aggregate Strava orders into their category
  stravaOrders.forEach((so) => {
    const cat = 'Desk Objects';
    categoryStats[cat] = (categoryStats[cat] || 0) + (so.total || so.price || 0);
  });

  const categoryTotal = Object.values(categoryStats).reduce((a, b) => a + b, 0);
  const categoryMax = Math.max(...Object.values(categoryStats), 1);

  const handleExportCSV = () => {
    const headers = ['Category', 'Estimated Revenue IDR', 'Share %'];
    const rows = Object.entries(categoryStats).map(([cat, rev]) => [
      `"${cat}"`,
      rev,
      categoryTotal > 0 ? `${Math.round((rev / categoryTotal) * 100)}%` : '0%',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `whereisit-analytics-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Telemetry & Insights</span>
          <h1 className="text-2xl font-black text-[#14191F]">Studio Analytics</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Metrik performa nyata dari pesanan storefront dan antrian pre-order 3D WhereIsIt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#5C7489] hover:bg-[#FAF8F5] transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="bg-white border border-[#DDD5C7] rounded-xl p-1 flex items-center text-xs">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors uppercase ${
                  timeRange === range ? 'bg-[#14191F] text-white' : 'text-[#6C7E8E] hover:text-[#14191F]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-xs font-semibold">Total Studio Revenue</span>
            <DollarSign className="w-4 h-4 text-[#5C7489]" />
          </div>
          <h3 className="text-2xl font-black text-[#14191F]">{formatRupiah(totalSales)}</h3>
          <span className="text-[11px] text-[#5C7489] font-semibold">
            {totalOrders > 0 ? `${totalOrders} pesanan terverifikasi` : 'Belum ada transaksi'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-xs font-semibold">Completed Orders</span>
            <ShoppingCart className="w-4 h-4 text-[#5C7489]" />
          </div>
          <h3 className="text-2xl font-black text-[#14191F]">{completedOrders}</h3>
          <span className="text-[11px] text-[#5C7489] font-medium">
            {totalOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}% terselesaikan` : '0 pesanan selesai'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-xs font-semibold">Average Order Value</span>
            <Package className="w-4 h-4 text-[#5C7489]" />
          </div>
          <h3 className="text-2xl font-black text-[#14191F]">{formatRupiah(avgOrderValue)}</h3>
          <span className="text-[11px] text-[#7A8B99]">Rata-rata per transaksi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
          <div className="flex items-center justify-between text-[#7A8B99] mb-1">
            <span className="text-xs font-semibold">Active Products</span>
            <TrendingUp className="w-4 h-4 text-[#5C7489]" />
          </div>
          <h3 className="text-2xl font-black text-[#14191F]">
            {products.filter((p) => p.status === 'ACTIVE').length}
          </h3>
          <span className="text-[11px] text-[#5C7489] font-semibold">
            Dari {products.length} total produk katalog
          </span>
        </div>
      </div>

      {/* Visual Revenue Breakdown by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE6DC] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14191F]">Sales Revenue by 3D Collection</h3>
              <p className="text-xs text-[#7A8B99]">Distribusi pendapatan aktual berdasarkan kategori produk</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {Object.keys(categoryStats).length === 0 ? (
              <div className="py-8 text-center text-xs text-[#7A8B99]">
                Belum ada data penjualan per kategori.
              </div>
            ) : (
              Object.entries(categoryStats).map(([cat, rev]) => {
                const pct = categoryTotal > 0 ? Math.round((rev / categoryTotal) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#14191F]">{cat}</span>
                      <span className="text-[#5C7489]">
                        {formatRupiah(rev)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#ECE6DC]">
                      <div
                        className="h-full rounded-full bg-[#5C7489] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Performing 3D Pieces */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#ECE6DC] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#14191F] mb-1">Catalog Silhouettes</h3>
            <p className="text-xs text-[#7A8B99] mb-4">Produk studio aktif di katalog</p>

            {products.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#7A8B99]">
                <Inbox className="w-5 h-5 mx-auto mb-2 text-[#DDD5C7]" />
                <p>Belum ada produk di katalog.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 4).map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-[#F0EBE3] last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-[#7A8B99]">0{idx + 1}</span>
                      <div>
                        <p className="font-bold text-[#14191F] line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-[#7A8B99]">{p.category} • Stok: {p.stock}</p>
                      </div>
                    </div>
                    <span className="font-black text-[#5C7489]">{formatRupiah(p.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#ECE6DC] text-center">
            <span className="text-[11px] text-[#7A8B99]">Data studio disinkronkan secara real-time.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
