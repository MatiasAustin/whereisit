'use client';

import React, { useState, useEffect } from 'react';
import { ProductReview } from '@/types';
import { Star, CheckCircle, EyeOff, MessageSquare, ShieldCheck } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: string, status: ProductReview['status']) => {
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchReviews();
    } catch (e) {
      alert('Failed to update review status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Social Proof & Quality</span>
        <h1 className="text-2xl font-black text-[#14191F]">Product Reviews & Testimonials</h1>
        <p className="text-xs text-[#6C7E8E] mt-0.5">
          Moderate customer impressions, verified buyer ratings, and craftsmanship feedback.
        </p>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl border border-[#ECE6DC] p-6 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE3] pb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <h3 className="text-sm font-bold text-[#14191F]">{rev.title}</h3>
                {rev.verifiedPurchase && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Studio Owner</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#7A8B99]">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
                <select
                  value={rev.status}
                  onChange={(e) => handleStatusChange(rev.id, e.target.value as any)}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] focus:outline-none"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="HIDDEN">HIDDEN</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-[#44505C] leading-relaxed">
              "{rev.content}"
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#7A8B99]">
              <span>By: <strong>{rev.author}</strong> ({rev.email})</span>
              <span>Product: <strong className="text-[#5C7489]">{rev.productName}</strong></span>
            </div>
          </div>
        ))}

        {reviews.length === 0 && !loading && (
          <div className="bg-white rounded-3xl p-12 text-center text-[#7A8B99] border border-[#ECE6DC]">
            No customer reviews submitted yet.
          </div>
        )}
      </div>

    </div>
  );
}
