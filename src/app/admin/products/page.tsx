'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductCategory } from '@/types';
import { formatRupiah, formatUSD } from '@/lib/utils';
import ProductFormModal from '@/components/admin/ProductFormModal';
import { useToast } from '@/lib/toastContext';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter, 
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Small Furniture',
  'Desk Objects',
  'Home & Decor',
  'Character & Collectibles',
];

export default function AdminProductsPage() {
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'All' | ProductCategory>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the studio catalog?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showSuccess(`Produk "${name}" berhasil dihapus dari katalog.`);
      } else {
        showError('Gagal menghapus produk.');
      }
    } catch (e) {
      showError('Gagal menghapus produk.');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      showSuccess(`Status "${product.name}" diubah menjadi ${nextStatus}!`);
      fetchProducts();
    } catch (e) {
      showError('Gagal mengubah status produk.');
    }
  };

  const filtered = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.materials.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Catalog Management</span>
          <h1 className="text-2xl font-black text-[#14191F]">All 3D Products</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">Manage 3D printed objects, material recipes, pricing, and showcase flags.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/inventory"
            className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors"
          >
            Manage Inventory & Stock
          </Link>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
        
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title, materials, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCat === cat
                    ? 'bg-[#14191F] text-white'
                    : 'bg-[#FAF8F5] text-[#556473] hover:bg-[#ECE6DC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7A8B99] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
              <tr>
                <th className="px-6 py-3.5">Product Silhouette</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Badge</th>
                <th className="px-6 py-3.5">In Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F2EDE4] shrink-0 border border-[#E5DFD4]">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-[#14191F]">{p.name}</p>
                      <p className="text-[11px] text-[#7A8B99] line-clamp-1">{p.materials}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-medium text-[#44505C]">
                    {p.category}
                  </td>

                  <td className="px-6 py-4 font-black text-[#14191F]">
                    {formatRupiah(p.price)}
                    <span className="block text-[10px] font-normal text-[#7A8B99]">{formatUSD(p.price)}</span>
                  </td>

                  <td className="px-6 py-4">
                    {p.badge ? (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#EDF3F7] text-[#5C7489] border border-[#D5E1E9]">
                        {p.badge}
                      </span>
                    ) : (
                      <span className="text-[#8E9FAA]">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-medium">
                    <span className={p.stock <= 5 ? 'text-amber-600 font-bold' : 'text-[#44505C]'}>
                      {p.stock} units
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {p.status}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#5C7489] hover:bg-[#EDF3F7] transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[#7A8B99]">
              No products found matching the criteria.
            </div>
          )}
        </div>

      </div>

      {/* Edit/Add Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchProducts}
      />

    </div>
  );
}
