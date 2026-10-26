'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, ProductCategory, ProductBadge } from '@/types';
import { X, Check, Star, Trash2, Plus, Sparkles, Layers, Box, Tag, Image as ImageIcon, Eye } from 'lucide-react';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';
import { useToast } from '@/lib/toastContext';

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

const BADGES: { value: ProductBadge | ''; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'popular', label: 'Popular (Best Seller)' },
  { value: 'profitably', label: 'Profitably (Ref)' },
  { value: 'premium', label: 'Studio Premium' },
  { value: 'signature', label: 'Signature Object' },
  { value: 'limited', label: 'Limited Drop' },
  { value: 'new', label: 'New Release' },
];

const PRESET_FINISHES = [
  'Slate Dusty Blue',
  'Bone Alabaster',
  'Charcoal Noir',
  'Raw Terracotta',
  'Sage Green Bio-Resin',
  'Smoky Quartz Grey',
];

export default function ProductFormModal({ product, isOpen, onClose, onSaved }: ProductFormModalProps) {
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Desk Objects');
  const [price, setPrice] = useState(450000);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(undefined);
  const [badge, setBadge] = useState<ProductBadge | ''>('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('High-grade matte structural bio-polymer');
  const [dimensions, setDimensions] = useState('W 200mm × D 150mm × H 80mm');
  const [weight, setWeight] = useState('400 g');
  const [layerResolution, setLayerResolution] = useState('0.12mm Ultra-Fine Adaptive Layering');
  const [colorOptions, setColorOptions] = useState<string[]>(['Slate Dusty Blue', 'Bone Alabaster']);
  const [newColorInput, setNewColorInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [stock, setStock] = useState(10);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');
  const [rating, setRating] = useState(4.9);
  const [tags, setTags] = useState('3d-printed, ergonomic, studio-grade');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setCategory(product.category);
      setPrice(product.price);
      setCompareAtPrice(product.compareAtPrice);
      setBadge(product.badge || '');
      setShortDescription(product.shortDescription || '');
      setDescription(product.description || '');
      setMaterials(product.materials);
      setDimensions(product.dimensions);
      setWeight(product.weight);
      setLayerResolution(product.layerResolution);
      setColorOptions(product.colorOptions && product.colorOptions.length > 0 ? product.colorOptions : ['Slate Dusty Blue']);
      setImages(product.images && product.images.length > 0 ? product.images : []);
      setStock(product.stock);
      setFeatured(Boolean(product.featured));
      setStatus(product.status === 'ARCHIVED' ? 'DRAFT' : product.status);
      setRating(product.rating || 4.9);
      setTags(product.tags ? product.tags.join(', ') : '');
    } else {
      setName('');
      setSlug('');
      setCategory('Desk Objects');
      setPrice(450000);
      setCompareAtPrice(undefined);
      setBadge('');
      setShortDescription('');
      setDescription('');
      setMaterials('High-grade matte structural bio-polymer');
      setDimensions('W 200mm × D 150mm × H 80mm');
      setWeight('400 g');
      setLayerResolution('0.12mm Ultra-Fine Adaptive Layering');
      setColorOptions(['Slate Dusty Blue', 'Bone Alabaster']);
      setImages(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80']);
      setStock(10);
      setFeatured(false);
      setStatus('ACTIVE');
      setRating(4.9);
      setTags('3d-printed, ergonomic, studio-grade');
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Add Color Finish
  const handleAddColor = () => {
    const trimmed = newColorInput.trim();
    if (trimmed && !colorOptions.includes(trimmed)) {
      setColorOptions([...colorOptions, trimmed]);
      setNewColorInput('');
    }
  };

  const handleRemoveColor = (col: string) => {
    setColorOptions(colorOptions.filter((c) => c !== col));
  };

  // Add Photo URL
  const handleAddImageUrl = () => {
    const trimmed = newUrlInput.trim();
    if (trimmed && !images.includes(trimmed)) {
      setImages([...images, trimmed]);
      setNewUrlInput('');
    }
  };

  // Remove Photo
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Set Cover Photo (moves index to 0)
  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([target, ...remaining]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product title is required');
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one product photo for the catalog showcase');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        badge: badge || undefined,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        materials: materials.trim(),
        dimensions: dimensions.trim(),
        weight: weight.trim(),
        layerResolution: layerResolution.trim(),
        colorOptions,
        images,
        stock: Number(stock),
        featured: Boolean(featured),
        status,
        rating: Number(rating) || 5.0,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
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

      showSuccess(
        product ? `Produk "${name}" berhasil diperbarui!` : `Produk "${name}" berhasil ditambahkan ke katalog!`
      );
      onSaved();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Gagal menyimpan produk');
      setError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white text-[#14191F] rounded-3xl shadow-2xl border border-[#E5DFD4] my-6 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECE6DC] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C7489]">
                {product ? 'Catalog Editor' : 'New Object Entry'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {status}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#14191F] mt-0.5">
              {product ? `Edit "${product.name}"` : 'Create 3D Studio Product'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EAE4D9] text-[#7A8B99] hover:text-[#14191F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 no-scrollbar">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C7489] flex items-center gap-1.5 border-b border-[#F0EBE3] pb-2">
              <Box className="w-3.5 h-3.5" />
              <span>1. Basic Object Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#44505C] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!product) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Aero Lounge Mini Stool"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Slug (URL friendly)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="aero-lounge-mini-stool"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Short Description (Card preview)</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="1-sentence punchy summary shown on catalog card"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Full Editorial & Design Story</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the intention, computational geometry, tactile texture, and usage context..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs leading-relaxed focus:outline-none focus:border-[#5C7489]"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Badges */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C7489] flex items-center gap-1.5 border-b border-[#F0EBE3] pb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>2. Pricing & Curated Badge</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Price (IDR) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Compare-at Price (IDR)</label>
                <input
                  type="number"
                  value={compareAtPrice || ''}
                  onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 550000 (shows strike-through)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Curated Badge</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                >
                  {BADGES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: 3D Technical Specifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C7489] flex items-center gap-1.5 border-b border-[#F0EBE3] pb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>3. 3D Print & Engineering Specifications</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Materials Specification</label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. High-grade matte structural bio-polymer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. W 200mm × D 150mm × H 80mm"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Weight</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 420 g"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Layer Resolution</label>
                <input
                  type="text"
                  value={layerResolution}
                  onChange={(e) => setLayerResolution(e.target.value)}
                  placeholder="e.g. 0.12mm Ultra-Fine Adaptive Layering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>
            </div>

            {/* Color Finishes Manager */}
            <div>
              <label className="block text-xs font-bold text-[#44505C] mb-1">Available Studio Finishes / Colors</label>
              <div className="flex flex-wrap gap-2 mb-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD5C7] min-h-[44px]">
                {colorOptions.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#14191F] text-xs font-semibold border border-[#D5CEBF] shadow-xs"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c)}
                      className="text-[#7A8B99] hover:text-red-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {colorOptions.length === 0 && (
                  <span className="text-xs text-[#8E9FAA] italic">No finishes added. Customers won't see finish selectors.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                  placeholder="Add custom finish name..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-4 py-2 rounded-xl bg-[#5C7489] text-white text-xs font-bold hover:bg-[#14191F] transition-colors"
                >
                  + Add Finish
                </button>
              </div>

              {/* Quick suggestion pills */}
              <div className="mt-2 flex flex-wrap gap-1.5 items-center text-[11px] text-[#7A8B99]">
                <span>Suggestions:</span>
                {PRESET_FINISHES.map((pf) => (
                  <button
                    key={pf}
                    type="button"
                    onClick={() => {
                      if (!colorOptions.includes(pf)) {
                        setColorOptions([...colorOptions, pf]);
                      }
                    }}
                    className="px-2 py-0.5 rounded-md bg-[#F2EDE4] hover:bg-[#E5DFD4] text-[#44505C] transition-colors"
                  >
                    + {pf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Photo Gallery with Auto-Compression */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C7489] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>4. Media & Multi-Angle Photos ({images.length})</span>
              </h4>
              <span className="text-[11px] text-[#7A8B99]">First photo is the primary cover</span>
            </div>

            {/* Photo Gallery Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 group bg-[#F2EDE4] ${
                      idx === 0 ? 'border-[#5C7489] shadow-md ring-2 ring-[#5C7489]/20' : 'border-[#E5DFD4]'
                    }`}
                  >
                    <Image src={imgUrl} alt={`Photo ${idx + 1}`} fill className="object-cover" />

                    {/* Primary Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 bg-[#14191F]/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>Cover</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-[#14191F]/80 hover:bg-[#14191F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full transition-opacity shadow"
                      >
                        Make Cover
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all shadow"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="absolute bottom-1.5 left-2 text-[9px] text-white/90 drop-shadow font-mono">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Dropzone */}
            <ImageUploadWithCompress
              onChange={(compressedDataUrl) => {
                if (compressedDataUrl) {
                  setImages([...images, compressedDataUrl]);
                }
              }}
              label="Upload Photo (Client Auto-Compressed)"
              helperText="Upload JPG/PNG/WebP photo. Canvas will automatically compress and scale down."
              compressionOptions={{ maxWidth: 1200, maxHeight: 1200, quality: 0.85 }}
            />

            {/* Add via URL */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newUrlInput}
                onChange={(e) => setNewUrlInput(e.target.value)}
                placeholder="Or paste image URL (Unsplash, CDN, etc)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors"
              >
                + Add URL
              </button>
            </div>
          </div>

          {/* Section 5: Inventory, Visibility & Hero Feature */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C7489] flex items-center gap-1.5 border-b border-[#F0EBE3] pb-2">
              <Eye className="w-3.5 h-3.5" />
              <span>5. Inventory & Storefront Visibility</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">
                  Current Stock Count ({stock <= 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-bold focus:outline-none focus:border-[#5C7489]"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setStock(stock + 5)}
                      className="px-2.5 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD5C7] text-[10px] font-bold hover:bg-[#ECE6DC]"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => setStock(stock + 10)}
                      className="px-2.5 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD5C7] text-[10px] font-bold hover:bg-[#ECE6DC]"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44505C] mb-1">Publication Status</label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStatus('ACTIVE')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      status === 'ACTIVE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-[#DDD5C7] text-[#7A8B99]'
                    }`}
                  >
                    ✓ ACTIVE (Public)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('DRAFT')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      status === 'DRAFT'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                        : 'bg-white border-[#DDD5C7] text-[#7A8B99]'
                    }`}
                  >
                    DRAFT (Hidden)
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Hero Switch Card */}
            <div className={`p-4 rounded-2xl border transition-all ${featured ? 'bg-[#EDF3F7] border-[#5C7489]' : 'bg-[#FAF8F5] border-[#E5DFD4]'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#DDD5C7] text-[#5C7489] focus:ring-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#14191F]">Feature on Homepage Hero (Centerpiece)</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#5C7489]" />
                  </div>
                  <p className="text-[11px] text-[#556473] mt-0.5 leading-relaxed">
                    Menjadikan objek 3D ini sebagai foto utama di Hero Section paling atas di halaman utama website.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-between">
            <span className="text-xs text-[#7A8B99]">
              {images.length} photo(s) • {colorOptions.length} finish(es)
            </span>

            <div className="flex items-center gap-3">
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
                className="px-7 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving to Database...' : product ? 'Update Product' : 'Create 3D Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
