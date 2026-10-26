'use client';

import React, { useState, useEffect } from 'react';
import { CustomDesignInquiry } from '@/types';
import { MessageSquare, Sliders, Layers, Box, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CustomDesignAdminPage() {
  const [inquiries, setInquiries] = useState<CustomDesignInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries/design');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: string, status: CustomDesignInquiry['status']) => {
    try {
      await fetch('/api/inquiries/design', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchInquiries();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Studio Consultation Pipeline</span>
          <h1 className="text-2xl font-black text-[#14191F]">Custom Design Briefs</h1>
          <p className="text-xs text-[#6C7E8E] mt-0.5">
            Bespoke client proposals for architectural desk trays, small furniture, and functional objects.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-semibold text-[#14191F] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Briefs</span>
        </button>
      </div>

      {/* Briefs Cards List */}
      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white rounded-3xl border border-[#ECE6DC] p-6 sm:p-8 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE3] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#14191F]">{inq.clientName}</h3>
                <p className="text-xs text-[#7A8B99]">{inq.email} • {inq.phone || 'No WhatsApp provided'}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#7A8B99]">
                  Submitted {new Date(inq.createdAt).toLocaleDateString()}
                </span>
                <select
                  value={inq.status}
                  onChange={(e) => handleStatusChange(inq.id, e.target.value as any)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DDD5C7] text-[#14191F] focus:outline-none focus:border-[#5C7489]"
                >
                  <option value="NEW">NEW BRIEF</option>
                  <option value="IN_REVIEW">IN_REVIEW (3D MODELING)</option>
                  <option value="QUOTED">QUOTED TO CLIENT</option>
                  <option value="IN_PRODUCTION">IN_PRODUCTION (PRINTING)</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE6DC]">
              <div>
                <span className="text-[#7A8B99] block font-medium">Category:</span>
                <span className="font-bold text-[#14191F]">{inq.projectType}</span>
              </div>
              <div>
                <span className="text-[#7A8B99] block font-medium">Dimension Constraints:</span>
                <span className="font-semibold text-[#14191F]">{inq.dimensionConstraints || 'Open to suggestion'}</span>
              </div>
              <div>
                <span className="text-[#7A8B99] block font-medium">Estimated Budget:</span>
                <span className="font-bold text-[#5C7489]">{inq.estimatedBudget || 'Unspecified'}</span>
              </div>
            </div>

            {/* Proposal Details */}
            <div>
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#7A8B99] mb-1.5">Problem & Purpose Brief:</h5>
              <p className="text-xs text-[#44505C] leading-relaxed bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ECE6DC]">
                {inq.description}
              </p>
            </div>
          </div>
        ))}

        {inquiries.length === 0 && !loading && (
          <div className="bg-white rounded-3xl p-16 text-center text-[#7A8B99] border border-[#ECE6DC]">
            No custom design briefs received yet.
          </div>
        )}
      </div>

    </div>
  );
}
