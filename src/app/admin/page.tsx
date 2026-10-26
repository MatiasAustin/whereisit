'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, CustomDesignInquiry, CustomCharacterInquiry, Order } from '@/types';
import { formatRupiah, formatUSD } from '@/lib/utils';
import ProductFormModal from '@/components/admin/ProductFormModal';
import { useAuth } from '@/lib/authContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Layers,
  Inbox,
  UserCheck,
  Lock,
  LogOut,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, isLoading: authLoading, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'design-inquiries' | 'character-inquiries' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [designInquiries, setDesignInquiries] = useState<CustomDesignInquiry[]>([]);
  const [characterInquiries, setCharacterInquiries] = useState<CustomCharacterInquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Login form state
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, desRes, charRes, ordRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/inquiries/design').then((r) => r.json()),
        fetch('/api/inquiries/character').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (desRes.success) setDesignInquiries(desRes.data);
      if (charRes.success) setCharacterInquiries(charRes.data);
      if (ordRes.success) setOrders(ordRes.data);
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    const res = await login(passcode);
    if (!res.success) {
      setLoginError(res.error || 'Invalid passcode');
      setLoggingIn(false);
    } else {
      setLoggingIn(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the catalog?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      alert('Failed to delete product');
    }
  };

  const handleUpdateDesignStatus = async (id: string, status: CustomDesignInquiry['status']) => {
    try {
      await fetch('/api/inquiries/design', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleUpdateCharacterStatus = async (id: string, status: CustomCharacterInquiry['status']) => {
    try {
      await fetch('/api/inquiries/character', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleUpdateOrderStatus = async (id: string, orderStatus: Order['orderStatus']) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, orderStatus }),
      });
      fetchData();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  // If loading auth state, show clean loader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#5C7489] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#7A8B99] font-medium tracking-wide">Authenticating Studio Session...</p>
        </div>
      </div>
    );
  }

  // GATED: If not admin, show studio login gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#E5DFD4] shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF3F7] text-[#5C7489] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#14191F]">
              where<span className="text-[#5C7489]">is</span>it
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#7A8B99] font-bold">Studio Management Portal</p>
            <p className="text-xs text-[#556473]">Restricted access for studio operators only.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1.5 uppercase tracking-wider">
                Studio Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. whereisit2026)"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn || !passcode}
              className="w-full py-3.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors shadow-md disabled:opacity-50"
            >
              {loggingIn ? 'Authenticating...' : 'Enter Studio Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#ECE6DC] flex flex-col items-center gap-2 text-center">
            <span className="text-[11px] text-[#7A8B99]">
              Default passcode: <code className="bg-[#F2EDE4] px-1.5 py-0.5 rounded text-[#14191F] font-mono">whereisit2026</code>
            </span>
            <Link
              href="/"
              className="text-xs font-semibold text-[#5C7489] hover:underline flex items-center gap-1 mt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN VIEW
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.materials.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCatalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#14191F]">
      
      {/* Top Admin Navigation Bar */}
      <header className="bg-white border-b border-[#ECE6DC] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C7489] hover:text-[#14191F] transition-colors p-2 rounded-xl hover:bg-[#F4EFEA]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View Storefront</span>
            </Link>
            <div className="h-4 w-px bg-[#E5DFD4]"></div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black tracking-tight">where<span className="text-[#5C7489]">is</span>it</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] ml-1">Studio Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl text-[#7A8B99] hover:text-[#14191F] hover:bg-[#F4EFEA] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-[#14191F] text-white text-xs font-semibold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-[#7A8B99] hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Log Out of Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Stats Overview Cards (Shopify style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#7A8B99] mb-1 font-medium">
              <span>Total Catalog Items</span>
              <Package className="w-4 h-4 text-[#5C7489]" />
            </div>
            <p className="text-2xl font-bold text-[#14191F]">{products.length}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {products.filter((p) => p.status === 'ACTIVE').length} Active for Sale
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#7A8B99] mb-1 font-medium">
              <span>Catalog Asset Value</span>
              <SlidersHorizontal className="w-4 h-4 text-[#5C7489]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#14191F] truncate">
              {formatRupiah(totalCatalogValue)}
            </p>
            <span className="text-[10px] text-[#7A8B99] font-medium">
              Est. In-stock Valuation
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#7A8B99] mb-1 font-medium">
              <span>Custom Inquiries</span>
              <Sparkles className="w-4 h-4 text-[#5C7489]" />
            </div>
            <p className="text-2xl font-bold text-[#14191F]">
              {designInquiries.length + characterInquiries.length}
            </p>
            <span className="text-[10px] text-[#5C7489] font-semibold">
              {designInquiries.length} Design • {characterInquiries.length} Characters
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#ECE6DC] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#7A8B99] mb-1 font-medium">
              <span>Total Orders Placed</span>
              <ShoppingBag className="w-4 h-4 text-[#5C7489]" />
            </div>
            <p className="text-2xl font-bold text-[#14191F]">{orders.length}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Checkout Foundation Active
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#ECE6DC] pb-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-[#14191F] text-white shadow-sm'
                : 'text-[#556473] hover:bg-[#ECE6DC]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('design-inquiries')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'design-inquiries'
                ? 'bg-[#14191F] text-white shadow-sm'
                : 'text-[#556473] hover:bg-[#ECE6DC]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Design Inquiries ({designInquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('character-inquiries')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'character-inquiries'
                ? 'bg-[#14191F] text-white shadow-sm'
                : 'text-[#556473] hover:bg-[#ECE6DC]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Character Requests ({characterInquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#14191F] text-white shadow-sm'
                : 'text-[#556473] hover:bg-[#ECE6DC]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders & Shipping ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-[#ECE6DC] shadow-sm overflow-hidden">
            
            {/* Search and Filters Toolbar */}
            <div className="p-4 sm:p-6 border-b border-[#ECE6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#7A8B99] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-medium focus:outline-none focus:border-[#5C7489]"
                >
                  <option value="All">All Categories</option>
                  <option value="Small Furniture">Small Furniture</option>
                  <option value="Desk Objects">Desk Objects</option>
                  <option value="Home & Decor">Home & Decor</option>
                  <option value="Character & Collectibles">Character & Collectibles</option>
                </select>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#5C7489] text-white text-xs font-semibold hover:bg-[#4E6377] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#556473] font-bold uppercase tracking-wider text-[10px] border-b border-[#ECE6DC]">
                  <tr>
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price (IDR)</th>
                    <th className="px-6 py-3.5">Badge</th>
                    <th className="px-6 py-3.5">Stock</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE3]">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F2EDE4] shrink-0 border border-[#E5DFD4]">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#14191F] hover:text-[#5C7489]">{p.name}</p>
                          <p className="text-[11px] text-[#7A8B99] line-clamp-1">{p.materials}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-[#44505C]">
                        {p.category}
                      </td>

                      <td className="px-6 py-4 font-bold text-[#14191F]">
                        {formatRupiah(p.price)}
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
                        <span className={p.stock < 5 ? 'text-amber-600 font-bold' : 'text-[#44505C]'}>
                          {p.stock} units
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
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
                          onClick={() => handleDeleteProduct(p.id, p.name)}
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

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-[#7A8B99]">
                  No products found matching your filter.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CUSTOM DESIGN INQUIRIES */}
        {activeTab === 'design-inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14191F]">Customer Design Briefs</h3>
                <p className="text-xs text-[#7A8B99]">Proposals submitted for bespoke furniture, organizers, and home objects</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {designInquiries.map((inq) => (
                <div key={inq.id} className="bg-white p-6 rounded-3xl border border-[#ECE6DC] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE3] pb-3">
                    <div>
                      <span className="text-xs font-bold text-[#14191F]">{inq.clientName}</span>
                      <span className="text-xs text-[#7A8B99] ml-2">({inq.email} • {inq.phone || 'No Phone'})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#7A8B99]">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateDesignStatus(inq.id, e.target.value as any)}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] focus:outline-none"
                      >
                        <option value="NEW">NEW</option>
                        <option value="IN_REVIEW">IN_REVIEW</option>
                        <option value="QUOTED">QUOTED</option>
                        <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE6DC]">
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Type:</span>
                      <span className="font-bold text-[#14191F]">{inq.projectType}</span>
                    </div>
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Dimensions Constraint:</span>
                      <span className="font-semibold">{inq.dimensionConstraints || 'Open to suggestion'}</span>
                    </div>
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Target Budget:</span>
                      <span className="font-semibold text-[#5C7489]">{inq.estimatedBudget}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#7A8B99] mb-1">Brief Description:</h5>
                    <p className="text-xs text-[#44505C] leading-relaxed bg-white p-3 rounded-xl border border-[#ECE6DC]">
                      {inq.description}
                    </p>
                  </div>
                </div>
              ))}

              {designInquiries.length === 0 && (
                <div className="bg-white p-12 text-center text-[#7A8B99] rounded-3xl border border-[#ECE6DC]">
                  No design consultation briefs received yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM CHARACTER REQUESTS */}
        {activeTab === 'character-inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14191F]">Photo-to-3D Character Figurines</h3>
                <p className="text-xs text-[#7A8B99]">Personal keepsake sculptures & portrait miniaturizations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {characterInquiries.map((inq) => (
                <div key={inq.id} className="bg-white p-6 rounded-3xl border border-[#ECE6DC] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE3] pb-3">
                    <div>
                      <span className="text-xs font-bold text-[#14191F]">{inq.clientName}</span>
                      <span className="text-xs text-[#7A8B99] ml-2">({inq.email} • {inq.phone || 'No Phone'})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#7A8B99]">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateCharacterStatus(inq.id, e.target.value as any)}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] focus:outline-none"
                      >
                        <option value="NEW">NEW</option>
                        <option value="3D_MODELING">3D_MODELING</option>
                        <option value="REVISION">REVISION</option>
                        <option value="PRINTING">PRINTING</option>
                        <option value="SHIPPED">SHIPPED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE6DC]">
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Style Choice:</span>
                      <span className="font-bold text-[#5C7489]">{inq.style}</span>
                    </div>
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Character Type:</span>
                      <span className="font-semibold">{inq.characterType}</span>
                    </div>
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Brass Plaque Inscription:</span>
                      <span className="font-semibold">{inq.plaqueText || 'None requested'}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#7A8B99] mb-1">Likeness & Pose Notes:</h5>
                    <p className="text-xs text-[#44505C] leading-relaxed bg-white p-3 rounded-xl border border-[#ECE6DC]">
                      {inq.referenceNotes}
                    </p>
                  </div>

                  {inq.photoUrl && (
                    <div className="text-xs">
                      <span className="text-[#7A8B99] mr-2">Reference Link:</span>
                      <a href={inq.photoUrl} target="_blank" rel="noreferrer" className="text-[#5C7489] underline">
                        {inq.photoUrl}
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {characterInquiries.length === 0 && (
                <div className="bg-white p-12 text-center text-[#7A8B99] rounded-3xl border border-[#ECE6DC]">
                  No character consultation requests submitted yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & SHIPPING */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14191F]">Customer Orders & Dispatches</h3>
                <p className="text-xs text-[#7A8B99]">Orders placed through the store checkout flow</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-[#ECE6DC] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE3] pb-3">
                    <div>
                      <span className="text-sm font-black text-[#14191F]">#{order.orderNumber}</span>
                      <span className="text-xs text-[#7A8B99] ml-2">by {order.customer.fullName} ({order.customer.phone})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#14191F]">{formatRupiah(order.total)}</span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] focus:outline-none"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="PRINTING">PRINTING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>

                  {/* Destination & Courier */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE6DC]">
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Delivery Destination:</span>
                      <span className="font-semibold">{order.customer.address}, {order.customer.city} ({order.customer.postalCode})</span>
                    </div>
                    <div>
                      <span className="text-[#7A8B99] block font-medium">Logistics & Courier:</span>
                      <span className="font-semibold">{order.shippingCarrier} • {order.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#F0EBE3]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.quantity}x</span>
                          <span className="text-[#44505C]">{item.productName} ({item.selectedColor || 'Standard'})</span>
                        </div>
                        <span className="font-semibold text-[#14191F]">{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="bg-white p-12 text-center text-[#7A8B99] rounded-3xl border border-[#ECE6DC]">
                  No orders placed yet.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchData}
      />

    </div>
  );
}
