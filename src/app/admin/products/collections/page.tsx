'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/types';
import { Layers, Plus, Edit2, ArrowRight } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCollections(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Taxonomy & Grouping</span>
          <h1 className="text-2xl font-black text-[#14191F]">Product Collections</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Curate thematic groups for furniture, desk objects, interior decor, and collectibles.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors"
        >
          View All Products
        </Link>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white rounded-3xl border border-[#ECE6DC] p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-start"
          >
            <div className="relative w-full sm:w-36 aspect-square rounded-2xl overflow-hidden bg-[#F2EDE4] shrink-0 border border-[#E5DFD4]">
              <Image src={col.image} alt={col.name} fill className="object-cover" />
              <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#14191F]/80 text-white px-2 py-0.5 rounded-full">
                {col.productCount} Items
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#14191F]">{col.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {col.status}
                  </span>
                </div>
                <p className="text-xs text-[#556473] mt-2 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#ECE6DC] flex items-center justify-between text-xs">
                <span className="text-[#7A8B99] font-mono">slug: /{col.slug}</span>
                <Link
                  href="/admin/products"
                  className="font-semibold text-[#5C7489] hover:text-[#14191F] flex items-center gap-1"
                >
                  <span>Filter Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
