'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import { JournalArticle } from '@/types';

interface JournalSectionProps {
  articles: JournalArticle[];
}

export default function JournalSection({ articles }: JournalSectionProps) {
  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED');
  if (publishedArticles.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#F8F6F1] border-t border-[#ECE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#5C7489]"></span>
              <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">
                Studio Journal & Material Essays
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight">
              Thoughtful process, <br />
              <span className="font-bold">documented by our industrial designers</span>
            </h2>
          </div>
          <div className="text-sm text-[#7A8B99]">
            Stories of tactile experiments and archival printing.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publishedArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-[#FAF8F5] rounded-3xl overflow-hidden border border-[#E5DFD4] shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
            >
              <div>
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src={article.coverImage || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80'}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-[#14191F]/80 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-[#8BA1B4]" />
                    <span>Studio Essay</span>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-xs text-[#7A8B99] mb-2 font-mono">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })} • by {article.author}
                  </p>
                  <h3 className="text-xl font-bold text-[#14191F] group-hover:text-[#5C7489] transition-colors mb-3 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#667584] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8 pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#14191F] group-hover:text-[#5C7489] transition-colors">
                  <span>Read full studio essay</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
