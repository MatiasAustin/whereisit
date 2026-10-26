'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { 
  Package, 
  Search, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Minus,
  Sliders,
  Printer
} from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockChanges, setStockChanges] = useState<{ [id: string]: number }>({});
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStock = (p: Product) => {
    if (stockChanges[p.id] !== undefined) return stockChanges[p.id];
    return p.stock;
  };

  const handleStockDelta = (id: string, delta: number, currentStock: number) => {
    const current = stockChanges[id] !== undefined ? stockChanges[id] : currentStock;
    const nextVal = Math.max(0, current + delta);
    setStockChanges((prev) => ({ ...prev, [id]: nextVal }));
  };

  const handleSaveStock = async (p: Product) => {
    const newStock = stockChanges[p.id];
    if (newStock === undefined) return;

    setSavingId(p.id);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, stock: newStock } : item)));
        setStockChanges((prev) => {
          const next = { ...prev };
          delete next[p.id];
          return next;
        });
      }
    } catch (e) {
      alert('Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = products.filter((p) => {
    const current = getStock(p);
    if (filterStock === 'IN_STOCK' && current <= 0) return false;
    if (filterStock === 'LOW_STOCK' && (current <= 0 || current > 5)) return false;
    if (filterStock === 'OUT_OF_STOCK' && current > 0) return false;

    if (search.trim()) {
      return p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Supply & Production</span>
          <h1 className="text-2xl font-black text-[#14191F]">Inventory & 3D Print Queue</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Monitor real-time buffer stock levels, print queue requirements, and material consumption.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Main Inventory Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterStock(mode)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterStock === mode
                    ? 'bg-[#14191F] text-white'
                    : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Silhouette</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Layer Spec</th>
                <th className="px-6 py-3.5">Available Stock</th>
                <th className="px-6 py-3.5">Stock Adjustment</th>
                <th className="px-6 py-3.5">Machine Queue Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filtered.map((p) => {
                const currentStock = getStock(p);
                const isModified = stockChanges[p.id] !== undefined;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F2EDE4] shrink-0 border border-[#E5DFD4]">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[#14191F]">{p.name}</p>
                        <p className="text-[10px] text-[#7A8B99]">{p.weight} • {p.materials.slice(0, 30)}...</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-[#44505C]">
                      {p.category}
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-[#5C7489]">
                      {p.layerResolution.slice(0, 18)}
                    </td>

                    <td className="px-6 py-4 font-black">
                      <span className={currentStock <= 5 ? 'text-amber-600 font-bold' : 'text-[#14191F]'}>
                        {currentStock} units
                      </span>
                    </td>

                    {/* Stock Stepper */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockDelta(p.id, -1, p.stock)}
                          className="w-7 h-7 rounded-lg border border-[#DDD5C7] bg-white flex items-center justify-center font-bold text-[#44505C] hover:bg-[#FAF8F5]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          value={currentStock}
                          onChange={(e) => setStockChanges({ ...stockChanges, [p.id]: Math.max(0, Number(e.target.value)) })}
                          className="w-14 text-center py-1 rounded-lg border border-[#DDD5C7] text-xs font-bold"
                        />

                        <button
                          onClick={() => handleStockDelta(p.id, 1, p.stock)}
                          className="w-7 h-7 rounded-lg border border-[#DDD5C7] bg-white flex items-center justify-center font-bold text-[#44505C] hover:bg-[#FAF8F5]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {currentStock <= 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Out of Stock • Print Priority High</span>
                        </span>
                      ) : currentStock <= 5 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                          <Printer className="w-3 h-3" />
                          <span>Low Buffer • Print Batch Ready</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sufficient Stock</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isModified ? (
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={savingId === p.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === p.id ? 'Saving...' : 'Save'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#8E9FAA]">No changes</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
