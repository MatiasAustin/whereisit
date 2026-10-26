'use client';

import React from 'react';
import Image from 'next/image';
import { Layers, ShieldCheck, Cpu, Feather, RefreshCw, CheckCircle } from 'lucide-react';

export default function StudioCraft() {
  const craftFeatures = [
    {
      icon: <Layers className="w-6 h-6 text-[#5C7489]" />,
      title: '0.08mm Layer Density',
      description: 'Ultra-thin horizontal strata combined with dynamic adaptive layer height for clean curved contours that minimize layer artifacts.',
    },
    {
      icon: <Feather className="w-6 h-6 text-[#5C7489]" />,
      title: 'Parametric Gyroid Infill',
      description: 'Mathematical triply periodic minimal surfaces distribute compressive stress evenly, resulting in lightweight strength with zero deadweight.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#5C7489]" />,
      title: 'Tactile Satin Finishing',
      description: 'Each piece passes through three-stage manual wet sanding and satin protective sealing, giving a warm, stone-like touch rather than harsh plastic.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#5C7489]" />,
      title: 'Architectural Bio-polymers',
      description: 'Cast from recyclable high-grade PLA+ composites, carbon fiber blends, and mineral-filled filaments with certified non-toxic durability.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F4EFEA] border-t border-[#ECE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Studio Standards</span>
          <h2 className="text-3xl sm:text-4xl font-light text-[#14191F] tracking-tight mt-1">
            Engineered with intent. <br />
            <span className="font-bold">Finished with patience.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#667584]">
            3D printing is our precision tool, but human craftsmanship is our soul. Here is how WhereIsIt ensures every piece feels distinctly premium.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {craftFeatures.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5DFD4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="p-3 rounded-2xl bg-[#EDF3F7] w-fit mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#14191F] mb-2">{item.title}</h3>
                <p className="text-xs text-[#667584] leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#ECE6DC] flex items-center gap-1.5 text-[11px] text-[#5C7489] font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified Studio Standard</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
