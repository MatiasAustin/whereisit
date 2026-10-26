'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, CheckCircle2, Ruler, Sliders, Box, Layers } from 'lucide-react';

export default function CustomDesignSection() {
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    projectType: 'Desk Object',
    dimensionConstraints: '',
    estimatedBudget: 'Rp 1.000.000 - Rp 2.500.000',
    description: '',
    desiredTimeline: '2-3 Weeks',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error sending request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="custom-design" className="py-20 md:py-28 bg-[#F4EFEA] border-t border-[#E8E2D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDF3F7] text-[#5C7489] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#D5E1E9]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Your Design</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight leading-tight">
            From spatial problem to <br />
            <span className="font-bold">functional art & bespoke objects</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#556473] leading-relaxed">
            WhereIsIt starts with your intent. Tell us what problem you want to solve, what space you want to fit, or what form you envision. Our industrial designers consult with you to refine the geometry and structural integrity before manufacturing.
          </p>
        </div>

        {/* 4-Step Consultation Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          
          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5DFD4] relative shadow-sm">
            <span className="text-2xl font-black text-[#5C7489]/40 mb-3 block">01</span>
            <div className="p-2.5 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#14191F] mb-1">Needs & Context Brief</h3>
            <p className="text-xs text-[#667584] leading-relaxed">
              Share the intended purpose, dimensions, physical constraints, and aesthetic mood of your room or workstation.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5DFD4] relative shadow-sm">
            <span className="text-2xl font-black text-[#5C7489]/40 mb-3 block">02</span>
            <div className="p-2.5 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#14191F] mb-1">Parametric 3D Design</h3>
            <p className="text-xs text-[#667584] leading-relaxed">
              Our studio sculpts digital geometry, calculates structural stress, and refines the ergonomic balance for production.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5DFD4] relative shadow-sm">
            <span className="text-2xl font-black text-[#5C7489]/40 mb-3 block">03</span>
            <div className="p-2.5 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#14191F] mb-1">Material & Tactile Curation</h3>
            <p className="text-xs text-[#667584] leading-relaxed">
              Select from matte architectural polymers, mineral composites, or metallic infills with custom studio color matching.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5DFD4] relative shadow-sm">
            <span className="text-2xl font-black text-[#5C7489]/40 mb-3 block">04</span>
            <div className="p-2.5 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#14191F] mb-1">Hand-Finished Craft</h3>
            <p className="text-xs text-[#667584] leading-relaxed">
              Precision extrusion followed by meticulous manual wet-sanding, sealing, and secure presentation packaging.
            </p>
          </div>

        </div>

        {/* Interactive Consultation Form Container */}
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-[#E2DDD4] shadow-lg max-w-4xl mx-auto">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#14191F]">Consultation Request Received</h3>
              <p className="text-sm text-[#556473] max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to WhereIsIt Studio. Our design team will review your project brief and contact you within 24 business hours via WhatsApp or Email.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-semibold hover:bg-[#5C7489] transition-colors"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#ECE6DC] pb-4">
                <h3 className="text-xl font-bold text-[#14191F]">Start Your Design Brief</h3>
                <p className="text-xs text-[#7A8B99] mt-1">
                  We review every concept individually before confirming feasibility. No automated generic production.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Leonardo Pratama"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. leo@studio.com"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                    Project Category
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  >
                    <option value="Desk Object">Desk Object / Organiser</option>
                    <option value="Small Furniture">Small Furniture / Accent Stool</option>
                    <option value="Home Decor">Home Decor / Architectural Vase</option>
                    <option value="Functional Hardware">Functional Living Hardware</option>
                    <option value="Other">Other Bespoke Form</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                    Target Budget Range
                  </label>
                  <select
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  >
                    <option value="Rp 500.000 - Rp 1.500.000">Rp 500k - Rp 1.5M (Small Object)</option>
                    <option value="Rp 1.500.000 - Rp 3.500.000">Rp 1.5M - Rp 3.5M (Bespoke Feature)</option>
                    <option value="Rp 3.500.000+">Rp 3.5M+ (Small Furniture / Complex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                  Approximate Dimensions or Space Constraints
                </label>
                <input
                  type="text"
                  value={formData.dimensionConstraints}
                  onChange={(e) => setFormData({ ...formData, dimensionConstraints: e.target.value })}
                  placeholder="e.g. Workstation shelf max 350mm × 200mm × 120mm height"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                  Describe the Problem, Context & Desired Function *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us what you want to achieve, how you plan to use it, and any material or aesthetic preferences..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[#7A8B99]">
                  • Inquiries are handled directly by WhereIsIt studio engineers.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#14191F] text-white text-sm font-semibold hover:bg-[#5C7489] transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Brief...</span>
                  ) : (
                    <>
                      <span>Send Consultation Request</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
