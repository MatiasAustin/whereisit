'use client';

import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { ProductReview } from '@/types';

interface ReviewsSectionProps {
  reviews: ProductReview[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const approvedReviews = reviews.filter((r) => r.status === 'APPROVED');
  if (approvedReviews.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#182028] text-white border-t border-[#25323F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#5C7489]"></span>
              <span className="text-xs uppercase tracking-widest text-[#8BA1B4] font-bold">
                Client Testimonials & Architecture
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Quiet elegance, <br />
              <span className="font-bold text-[#D8E3EB]">verified by our collectors</span>
            </h2>
          </div>
          <div className="text-sm text-[#8BA1B4]">
            Every review is from a verified studio delivery.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#1F2933] p-8 rounded-3xl border border-[#2E3C4B] shadow-lg flex flex-col justify-between hover:border-[#5C7489] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-[#44505C]'}`}
                      />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#5C7489]/50" />
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  &ldquo;{rev.title}&rdquo;
                </h3>
                <p className="text-xs text-[#9EAFBF] leading-relaxed mb-6">
                  {rev.content}
                </p>
              </div>

              <div className="pt-4 border-t border-[#2C3947]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{rev.author}</h4>
                    <p className="text-[10px] text-[#7A8E9E] truncate max-w-[180px]">
                      {rev.productName}
                    </p>
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
