'use client';

import React from 'react';
import { Truck, CreditCard, Shield, Clock, Check } from 'lucide-react';
import { StoreSettings } from '@/types';
import { formatRupiah } from '@/lib/utils';

interface DeliveryPaymentSectionProps {
  storeSettings?: StoreSettings;
}

export default function DeliveryPaymentSection({ storeSettings }: DeliveryPaymentSectionProps) {
  const activeCarriers = storeSettings?.shippingCarriers?.filter(c => c.active) || [
    { name: 'JNE YES (Next Day Air)', fee: 35000, active: true },
    { name: 'SiCepat Gokil (Cargo & Heavy Object)', fee: 25000, active: true },
    { name: 'Studio Dedicated Courier (Jabodetabek)', fee: 50000, active: true }
  ];

  const activePayments = storeSettings?.paymentMethods?.filter(p => p.active) || [
    { name: 'Bank Transfer (BCA / Mandiri Manual Verification)', type: 'BANK_TRANSFER', active: true },
    { name: 'QRIS Instant Payment', type: 'QRIS', active: true },
    { name: 'Credit / Debit Card (Visa / Mastercard)', type: 'CARD', active: true }
  ];

  return (
    <section id="delivery" className="py-20 md:py-28 bg-[#F8F6F1] border-t border-[#ECE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <span className="text-xs uppercase tracking-widest text-[#5C7489] font-bold">Safe & Transparent</span>
          <h2 className="text-3xl sm:text-4xl font-light text-[#14191F] tracking-tight mt-1">
            Careful packaging, <br />
            <span className="font-bold">insured delivery & seamless ordering</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#667584]">
            Because our objects are precision-crafted, our packaging is custom engineered to ensure safe arrival in pristine gallery condition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Production & Fulfillment Times */}
          <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E5DFD4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#14191F] mb-3">Fulfillment & Lead Times</h3>
              <ul className="space-y-3 text-xs text-[#556473]">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <span><strong>Ready-to-Buy Catalog Items:</strong> Dispatched within 24–48 hours from our Jakarta workshop.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <span><strong>Custom Character Keepsakes:</strong> 5–7 working days (includes 3D modeling review and hand-painting).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <span><strong>Bespoke Furniture / Large Objects:</strong> 10–14 working days with iterative prototype milestones.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECE6DC] text-[11px] text-[#7A8B99]">
              Tracked notification sent at every stage.
            </div>
          </div>

          {/* Card 2: Safe Packaging & Shipping Partners (From Database) */}
          <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E5DFD4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#14191F] mb-3">Courier & Safe Transit</h3>
              <p className="text-xs text-[#556473] mb-3">
                Live delivery partner channels configured in studio database:
              </p>
              <ul className="space-y-2.5 text-xs text-[#556473]">
                {activeCarriers.map((carrier, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2 p-2 rounded-xl bg-white/70 border border-[#ECE6DC]">
                    <div className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#5C7489] shrink-0 mt-0.5" />
                      <span className="font-medium text-[#14191F]">{carrier.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#5C7489] shrink-0 font-semibold">
                      {formatRupiah(carrier.fee)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECE6DC] text-[11px] text-[#7A8B99]">
              Insured transit with custom shock-absorbing foam inserts.
            </div>
          </div>

          {/* Card 3: Payment Architecture & Foundation (From Database) */}
          <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E5DFD4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#14191F] mb-3">Payment Methods</h3>
              <p className="text-xs text-[#556473] leading-relaxed mb-3">
                Active settlement options connected to studio checkout:
              </p>
              <ul className="space-y-2 text-xs text-[#556473]">
                {activePayments.map((method, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-[#ECE6DC]">
                    <span className="w-2 h-2 rounded-full bg-[#5C7489]"></span>
                    <span className="font-medium text-[#14191F]">{method.name}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 px-2 pt-1 text-[11px] text-[#7A8B99]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E9FAA]"></span>
                  <span>Bespoke 3D milestone payments (50% upfront, 50% approval)</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECE6DC] text-[11px] text-[#7A8B99] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#5C7489]" />
              <span>Official studio VAT tax invoices provided.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
