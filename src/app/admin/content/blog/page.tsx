'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { JournalArticle } from '@/types';
import { FileText, Plus, Edit2, BookOpen } from 'lucide-react';

export default function BlogAdminPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/journal')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setArticles(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Editorial Publications</span>
          <h1 className="text-2xl font-black text-[#14191F]">Studio Journal & Stories</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Articles on computational design, parametric infills, material research, and behind-the-scenes craft.
          </p>
        </div>

        <button
          onClick={() => alert('New article draft created')}
          className="px-4 py-2 rounded-xl bg-[#14191F] text-white text-xs font-bold hover:bg-[#5C7489] transition-colors flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-3xl border border-[#ECE6DC] p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#F2EDE4] mb-4 border border-[#E5DFD4]">
                <Image src={art.coverImage} alt={art.title} fill className="object-cover" />
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-[#14191F]/80 text-white px-2.5 py-1 rounded-full">
                  {art.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#7A8B99] mb-1">
                <span>By {art.author}</span>
                <span>•</span>
                <span>{art.publishedAt}</span>
              </div>

              <h3 className="text-base font-bold text-[#14191F] leading-snug">{art.title}</h3>
              <p className="text-xs text-[#556473] mt-2 leading-relaxed line-clamp-2">
                {art.excerpt}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#ECE6DC] flex items-center justify-between text-xs">
              <span className="text-[#7A8B99] font-mono">slug: /{art.slug}</span>
              <button
                onClick={() => alert(`Editing "${art.title}"`)}
                className="font-semibold text-[#5C7489] hover:text-[#14191F] flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
