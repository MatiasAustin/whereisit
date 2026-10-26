'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, ProductCategory } from '@/types';
import { formatUSD, formatRupiah } from '@/lib/utils';
import { useCart } from '@/lib/cartContext';
import { Star, Eye, ShoppingBag, SlidersHorizontal, Sparkles } from 'lucide-react';

interface FreshCollectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Small Furniture',
  'Desk Objects',
  'Home & Decor',
  'Character & Collectibles',
];

export default function FreshCollection({ products, onSelectProduct }: FreshCollectionProps) {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [currencyMode, setCurrencyMode] = useState<'IDR' | 'USD'>('USD');
  const [activeImageIndexes, setActiveImageIndexes] = useState<{ [productId: string]: number }>({});

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handleNextImage = (productId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }));
  };

  const handleDotClick = (productId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [productId]: index,
    }));
  };

  return (
    <section id="catalog" className="py-20 md:py-28 bg-[#11161B] text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with "Go to full catalog" and Currency Switcher (Image 1 reference) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#5C7489]"></span>
              <span className="text-xs uppercase tracking-widest text-[#8E9FAA] font-semibold">
                Curated 3D Collection
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white mt-1">
              Fresh <span className="font-bold text-white">collection</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency toggle */}
            <div className="bg-[#1A2128] border border-[#2B3743] rounded-full p-1 flex items-center text-xs">
              <button
                onClick={() => setCurrencyMode('USD')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  currencyMode === 'USD' ? 'bg-[#5C7489] text-white' : 'text-[#8E9FAA] hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrencyMode('IDR')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  currencyMode === 'IDR' ? 'bg-[#5C7489] text-white' : 'text-[#8E9FAA] hover:text-white'
                }`}
              >
                IDR (Rp)
              </button>
            </div>

            <button 
              onClick={() => setSelectedCategory('All')}
              className="px-6 py-2.5 rounded-full bg-[#FAF8F5] text-[#14191F] font-semibold text-xs sm:text-sm hover:bg-[#EAE4D9] transition-colors"
            >
              Go to full catalog
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-10 text-xs sm:text-sm font-medium">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#5C7489] text-white shadow-md'
                  : 'bg-[#182027] text-[#8E9FAA] hover:text-white hover:bg-[#202B35] border border-[#24303B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid - Exactly styled after the bottom cards in Image 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const currentImgIndex = activeImageIndexes[product.id] || 0;
            const currentImg = product.images[currentImgIndex] || product.images[0];

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-[#FFFFFF] text-[#14191F] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 border border-[#E8E2D7]"
              >
                {/* Card Top: Title, Badge, Material specs, Description, Price, Buy Now */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-xl font-bold tracking-tight text-[#14191F] group-hover:text-[#5C7489] transition-colors">
                      {product.name}
                    </h3>
                    {product.badge && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EDF3F7] text-[#5C7489] border border-[#D5E1E9]">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#7C8B99] font-medium tracking-tight line-clamp-1 mb-2">
                    {product.materials}
                  </p>

                  <p className="text-xs text-[#44505C] leading-relaxed line-clamp-2 mb-4 font-normal">
                    {product.shortDescription || product.description}
                  </p>

                  {/* Price and Buy Now Button */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE3]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-[#14191F]">
                        {currencyMode === 'USD' ? formatUSD(product.price) : formatRupiah(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-[#8E9FAA] line-through">
                          {currencyMode === 'USD' ? formatUSD(product.compareAtPrice) : formatRupiah(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                      }}
                      className="px-5 py-2 rounded-full bg-[#14191F] text-white text-xs font-semibold hover:bg-[#5C7489] transition-colors shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy now</span>
                    </button>
                  </div>
                </div>

                {/* Card Bottom: Product Image Container with Carousel Dots & Pill Tags */}
                <div className="relative mt-4 w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4EFEA] group/img">
                  <Image
                    src={currentImg}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 rounded-full bg-[#14191F]/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick Details</span>
                    </span>
                  </div>

                  {/* Multi-angle dot indicators */}
                  {product.images.length > 1 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => handleDotClick(product.id, idx, e)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            currentImgIndex === idx ? 'bg-white w-3' : 'bg-white/50 hover:bg-white'
                          }`}
                          aria-label={`View image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Bottom Pill Tags (Matching Image 1: e.g. "4.8 ★", "ergonomic", "minimal") */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-medium pointer-events-none">
                    <div className="flex items-center gap-1 bg-[#14191F]/70 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                      <span>{product.rating}</span>
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {product.tags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-[#14191F]/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full lowercase"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty state if category has no items */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-[#8E9FAA]">
            <p>No products found in this category.</p>
          </div>
        )}

      </div>
    </section>
  );
}
