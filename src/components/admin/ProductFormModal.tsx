'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ProductBadge } from '@/types';
import { X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Small Furniture',
  'Desk Objects',
  'Home & Decor',
  'Character & Collectibles',
];

const BADGES: (ProductBadge | '')[] = [
  '',
  'popular',
  'profitably',
  'premium',
  'limited',
  'signature',
  'new',
];

export default function ProductFormModal({ product, isOpen, onClose, onSaved }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Desk Objects' as ProductCategory,
    price: 450000,
    compareAtPrice: 500000,
    badge: '' as ProductBadge | '',
    shortDescription: '',
    description: '',
    materials: 'High-grade matte structural bio-polymer',
    dimensions: 'W 200mm × D 150mm × H 80mm',
    weight: '400 g',
    layerResolution: '0.12mm Ultra-Fine Adaptive Layering',
    colorOptions: 'Slate Dusty Blue, Bone Alabaster, Charcoal Noir',
    images: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    stock: 10,
    featured: false,
    status: 'ACTIVE' as 'ACTIVE' | 'DRAFT',
    rating: 4.9,
    tags: 'ergonomic, 3d-printed, studio-grade',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice || 0,
        badge: product.badge || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        materials: product.materials,
        dimensions: product.dimensions,
        weight: product.weight,
        layerResolution: product.layerResolution,
        colorOptions: product.colorOptions.join(', '),
        images: product.images.join('\n'),
        stock: product.stock,
        featured: product.featured,
        status: product.status === 'ARCHIVED' ? 'DRAFT' : product.status,
        rating: product.rating,
        tags: product.tags.join(', '),
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        category: 'Desk Objects',
        price: 450000,
        compareAtPrice: 0,
        badge: '',
        shortDescription: '',
        description: '',
        materials: 'High-grade matte structural bio-polymer',
        dimensions: 'W 200mm × D 150mm × H 80mm',
        weight: '400 g',
        layerResolution: '0.12mm Ultra-Fine Adaptive Layering',
        colorOptions: 'Slate Dusty Blue, Bone Alabaster, Charcoal Noir',
        images: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
        stock: 10,
        featured: false,
        status: 'ACTIVE',
        rating: 4.9,
        tags: 'ergonomic, 3d-printed, studio-grade',
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: formData.category,
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice) || undefined,
        badge: formData.badge || undefined,
        shortDescription: formData.shortDescription,
        description: formData.description,
        materials: formData.materials,
        dimensions: formData.dimensions,
        weight: formData.weight,
        layerResolution: formData.layerResolution,
        colorOptions: formData.colorOptions.split(',').map((s) => s.trim()).filter(Boolean),
        images: formData.images.split('\n').map((s) => s.trim()).filter(Boolean),
        stock: Number(formData.stock),
        featured: Boolean(formData.featured),
        status: formData.status,
        rating: Number(formData.rating),
        tags: formData.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to save product');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white text-[#14191F] rounded-3xl shadow-2xl border border-[#E5DFD4] my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#ECE6DC] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {product ? 'Edit Product' : 'Add New 3D Studio Product'}
            </h3>
            <p className="text-xs text-[#7A8B99]">
              Configure catalog details, pricing, materials, and digital assets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F2EDE4] text-[#7A8B99] hover:text-[#14191F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 no-scrollbar">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#44505C] mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aero Lounge Mini Stool"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Compare Price & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Price (IDR) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Compare-at Price (IDR)</label>
              <input
                type="number"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Badge Tag</label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              >
                <option value="">None</option>
                <option value="popular">Popular</option>
                <option value="profitably">Profitably (Ref)</option>
                <option value="premium">Premium</option>
                <option value="signature">Signature</option>
                <option value="limited">Limited Drop</option>
                <option value="new">New Release</option>
              </select>
            </div>
          </div>

          {/* Short & Long Description */}
          <div>
            <label className="block text-xs font-bold text-[#44505C] mb-1">Short Description (Card preview)</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="1 sentence summary shown on the card"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#44505C] mb-1">Full Story & Ergonomic Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
            />
          </div>

          {/* Specifications: Materials, Dimensions, Weight, Layer Height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Materials Specification</label>
              <input
                type="text"
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Layer Resolution</label>
              <input
                type="text"
                value={formData.layerResolution}
                onChange={(e) => setFormData({ ...formData, layerResolution: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Weight</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          {/* Color Options & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Color Finishes (comma separated)</label>
              <input
                type="text"
                value={formData.colorOptions}
                onChange={(e) => setFormData({ ...formData, colorOptions: e.target.value })}
                placeholder="Slate Dusty Blue, Bone Alabaster"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Stock Count</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          {/* Product Image Upload with Auto-Compression */}
          <div className="space-y-3 p-4 bg-[#FAF8F5] rounded-2xl border border-[#ECE6DC]">
            <div>
              <label className="block text-xs font-bold text-[#14191F]">Product Photos</label>
              <p className="text-[11px] text-[#7A8B99]">Upload photos directly (auto-compressed on select) or paste image URLs below.</p>
            </div>

            <ImageUploadWithCompress
              onChange={(compressedDataUrl) => {
                if (compressedDataUrl) {
                  const currentImgs = formData.images ? formData.images.split('\n').filter(Boolean) : [];
                  currentImgs.unshift(compressedDataUrl);
                  setFormData({ ...formData, images: currentImgs.join('\n') });
                }
              }}
              label="Upload Product Photo (Auto-Compressed)"
              helperText="Upload JPG/PNG/WebP photo. Canvas automatically compresses high-res files to ~180KB."
              compressionOptions={{ maxWidth: 1200, maxHeight: 1200, quality: 0.85 }}
            />

            <div>
              <label className="block text-[11px] font-semibold text-[#556473] mb-1">
                Active Image URLs / Compressed Data (1 per line for carousel):
              </label>
              <textarea
                rows={3}
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-[11px] font-mono focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          {/* Status & Featured */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#14191F]">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-[#DDD5C7] text-[#5C7489] focus:ring-0"
              />
              <span>Feature on Hero Showcase</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#44505C]">Status:</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  formData.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {formData.status}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-[#7A8B99] hover:bg-[#F2EDE4]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
