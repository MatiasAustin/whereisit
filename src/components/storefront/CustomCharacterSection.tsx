'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Heart, Camera, Gift, Award, CheckCircle2, Send, HelpCircle } from 'lucide-react';
import ImageUploadWithCompress from '@/components/ui/ImageUploadWithCompress';

const CHARACTER_STYLES = [
  {
    id: 'Chibi Petite',
    name: 'Chibi Petite',
    description: 'Rounded cute proportions, big expressive eyes, and gentle posture. The ultimate adorable desktop companion.',
    tag: 'Most Popular',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'Minimalist Line',
    name: 'Minimalist Monolith',
    description: 'Abstract architectural silhouettes preserving distinct hairstyle, posture, and iconic facial silhouette.',
    tag: 'Modern Interior',
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'Comic Stylized',
    name: 'Comic Stylized',
    description: 'Dynamic character lines with vibrant personality details, glasses, attire, and favorite accessories.',
    tag: 'High Resemblance',
    img: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'Mascot Costume',
    name: 'Animal / Mascot Persona',
    description: 'Transform portrait features into a cozy bear, bunny, or astronaut hooded costume figurine.',
    tag: 'Keepsake Edition',
    img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
  },
];

export default function CustomCharacterSection() {
  const [selectedStyle, setSelectedStyle] = useState('Chibi Petite');
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    characterType: 'Self / Portrait' as any,
    plaqueText: '',
    referenceNotes: '',
    photoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          style: selectedStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit character inquiry');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="custom-character" className="py-20 md:py-28 bg-[#F8F6F1] border-t border-[#ECE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDF3F7] text-[#5C7489] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#D5E1E9]">
              <Sparkles className="w-3.5 h-3.5 text-[#5C7489]" />
              <span>Personalized Figurines & Keepsakes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#14191F] tracking-tight leading-tight">
              Turn your memories into <br />
              <span className="font-bold">charming 3D collectible characters</span>
            </h2>
            <p className="mt-4 text-base text-[#556473] leading-relaxed">
              Send us a photo of yourself, a loved one, a couple, or your pet. WhereIsIt translates real human charm into a stylized, tactile 3D figurine — preserving likeness while infusing adorable warmth.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#7A8B99] font-medium">
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#5C7489]" />
              <span>Perfect Anniversary / Birthday Keepsake</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#5C7489]" />
              <span>Brass Plaque Inscription</span>
            </div>
          </div>
        </div>

        {/* Transformation Showcase (Photo to 3D Figurines reference from Image 2 screen) */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#E5DFD4] shadow-md mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">The Transformation Journey</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#14191F] mt-1">From Photo to Hand-Finished Sculpture</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-center">
            
            {/* Step 1: Real Photo */}
            <div className="bg-white rounded-2xl p-4 border border-[#ECE6DC] shadow-sm flex flex-col items-center text-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#F0ECE1]">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="Original Portrait Reference"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-bold text-[#14191F]">1. Client Photo Brief</span>
              <p className="text-[11px] text-[#7A8B99] mt-0.5">Capturing hairstyle, eye expression, and favorite outfit</p>
            </div>

            {/* Step 2: 3D Digital Character Model */}
            <div className="bg-white rounded-2xl p-4 border border-[#ECE6DC] shadow-sm flex flex-col items-center text-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#F0ECE1]">
                <Image
                  src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"
                  alt="Stylized 3D Character Model"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-[#5C7489] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  WhereIsIt Stylization
                </div>
              </div>
              <span className="text-xs font-bold text-[#14191F]">2. Parametric Chibi Sculpt</span>
              <p className="text-[11px] text-[#7A8B99] mt-0.5">Cute proportioning while retaining unmistakable likeness</p>
            </div>

            {/* Step 3: Physical Finished Collectible Figurine */}
            <div className="bg-white rounded-2xl p-4 border border-[#ECE6DC] shadow-sm flex flex-col items-center text-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#F0ECE1]">
                <Image
                  src="https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=600&q=80"
                  alt="Finished 3D Printed Figurine with Brass Plaque"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-[#14191F]/80 backdrop-blur-md text-white text-[10px] py-1 px-2 rounded-lg font-mono">
                  Brass Core · Satin Sealed
                </div>
              </div>
              <span className="text-xs font-bold text-[#14191F]">3. Tangible Keepsake</span>
              <p className="text-[11px] text-[#7A8B99] mt-0.5">Weighted base, brass engraved nameplate, luxury box</p>
            </div>

          </div>
        </div>

        {/* Character Style Selection Grid */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-[#14191F] mb-4">Choose Your Desired Character Vibe:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHARACTER_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-3xl text-left transition-all duration-200 border flex flex-col justify-between ${
                  selectedStyle === style.id
                    ? 'bg-[#14191F] text-white border-[#14191F] shadow-lg -translate-y-1'
                    : 'bg-[#FAF8F5] text-[#14191F] border-[#E5DFD4] hover:bg-[#F2EDE4]'
                }`}
              >
                <div>
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-[#EAE4D9]">
                    <Image src={style.img} alt={style.name} fill className="object-cover" />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{style.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      selectedStyle === style.id ? 'bg-[#5C7489] text-white' : 'bg-[#EDF3F7] text-[#5C7489]'
                    }`}>
                      {style.tag}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    selectedStyle === style.id ? 'text-[#8E9FAA]' : 'text-[#667584]'
                  }`}>
                    {style.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Character Inquiry Form */}
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-[#E2DDD4] shadow-lg max-w-4xl mx-auto">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#14191F]">Character Brief Submitted!</h3>
              <p className="text-sm text-[#556473] max-w-md mx-auto leading-relaxed">
                We are thrilled to bring your character to life. Our sculptors will inspect your reference notes and reply with concept advice and turnaround time within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#14191F] text-white text-xs font-semibold hover:bg-[#5C7489] transition-colors"
              >
                Create Another Character
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#ECE6DC] pb-4">
                <h3 className="text-xl font-bold text-[#14191F]">Request Custom Character Consultation</h3>
                <p className="text-xs text-[#7A8B99] mt-1">
                  Selected Style: <strong className="text-[#5C7489]">{selectedStyle}</strong>. Each figure is custom modeled with precision likeness.
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
                    placeholder="e.g. Natasya Salim"
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
                    placeholder="e.g. natasya@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                    WhatsApp Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 813-xxxx-xxxx"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                    Character Type
                  </label>
                  <select
                    value={formData.characterType}
                    onChange={(e) => setFormData({ ...formData, characterType: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                  >
                    <option value="Self / Portrait">Single Portrait / Self</option>
                    <option value="Couple">Couple / Wedding Keepsake</option>
                    <option value="Pet">Beloved Pet Figurine</option>
                    <option value="Custom Mascot">Custom Creative Mascot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                  Optional Brass Plaque Inscription
                </label>
                <input
                  type="text"
                  value={formData.plaqueText}
                  onChange={(e) => setFormData({ ...formData, plaqueText: e.target.value })}
                  placeholder="e.g. 'Leo & Natasya • 24.10.2026' or 'To My Best Friend'"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                  Reference Portrait / Photo (Auto-Compressed)
                </label>
                <ImageUploadWithCompress
                  value={formData.photoUrl}
                  onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                  label="Upload Reference Photo"
                  helperText="Upload person / pet photo (auto-compressed on device, max 1200px)"
                  aspectRatio="auto"
                  compressionOptions={{ maxWidth: 1200, maxHeight: 1200, quality: 0.85 }}
                />
                <div className="mt-2 text-xs text-[#8292A1] flex items-center gap-1">
                  <span>Or enter Google Drive / Image Link:</span>
                </div>
                <input
                  type="url"
                  value={formData.photoUrl && !formData.photoUrl.startsWith('data:') ? formData.photoUrl : ''}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://drive.google.com/... (optional if photo uploaded above)"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl bg-[#F4EFEA] border border-[#DDD5C7] text-xs focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#556473] mb-1.5">
                  Special Notes & Persona Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.referenceNotes}
                  onChange={(e) => setFormData({ ...formData, referenceNotes: e.target.value })}
                  placeholder="Tell us key traits: hairstyle, glasses, clothing style, pose (peace sign, coffee cup, sitting with legs crossed), or pet features..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4EFEA] border border-[#DDD5C7] text-sm focus:outline-none focus:border-[#5C7489]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[#7A8B99]">
                  • Hand-finished with weighted core & collectible gift box included.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#14191F] text-white text-sm font-semibold hover:bg-[#5C7489] transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Character...</span>
                  ) : (
                    <>
                      <span>Submit Character Consultation</span>
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
