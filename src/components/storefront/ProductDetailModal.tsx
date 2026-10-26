'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatRupiah, formatUSD } from '@/lib/utils';
import { useCart } from '@/lib/cartContext';
import { X, Star, Check, ShoppingBag, ShieldCheck, Box, RefreshCw } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  if (!product) return null;

  const activeColor = selectedColor || product.colorOptions[0] || 'Default';
  const activeImg = product.images[selectedImage] || product.images[0];

  const handleAddToCart = () => {
    addToCart(product, quantity, activeColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#FAF8F5] text-[#14191F] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D7] max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#14191F] shadow-sm transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Image Gallery */}
        <div className="w-full md:w-1/2 p-6 bg-[#F2EDE4] flex flex-col justify-between">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner bg-[#EAE4D9]">
            <Image
              src={activeImg}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#14191F] text-white">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto no-scrollbar pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === idx ? 'border-[#5C7489] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Specifications */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto no-scrollbar flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5C7489] mb-1">
              <span>{product.category}</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-[#14191F]">
                <span>{product.rating}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14191F] mb-2">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-[#14191F]">
                {formatRupiah(product.price)}
              </span>
              <span className="text-sm text-[#7A8B99]">
                ({formatUSD(product.price)} USD)
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-[#8E9FAA] line-through">
                  {formatRupiah(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-[#44505C] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Color Finish Selector */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A8B99] mb-2">
                  Studio Finish: <span className="text-[#14191F] font-bold">{activeColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeColor === color
                          ? 'bg-[#5C7489] text-white shadow-sm'
                          : 'bg-[#ECE6DC] text-[#44505C] hover:bg-[#DFD8CC]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="bg-[#F2EDE4] rounded-2xl p-4 space-y-2.5 text-xs text-[#44505C] mb-6 border border-[#E5DFD4]">
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Materials:</span>
                <span className="font-semibold text-right max-w-[60%]">{product.materials}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Dimensions:</span>
                <span className="font-semibold">{product.dimensions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Weight:</span>
                <span className="font-semibold">{product.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8B99]">Layer Resolution:</span>
                <span className="font-semibold">{product.layerResolution}</span>
              </div>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="pt-4 border-t border-[#ECE6DC] flex items-center gap-4">
            <div className="flex items-center border border-[#D5CEBF] rounded-full bg-white px-3 py-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-lg font-semibold px-2 text-[#7A8B99] hover:text-[#14191F]"
              >
                -
              </button>
              <span className="text-sm font-bold px-2">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-lg font-semibold px-2 text-[#7A8B99] hover:text-[#14191F]"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-6 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#14191F] text-white hover:bg-[#5C7489]'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • {formatRupiah(product.price * quantity)}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
