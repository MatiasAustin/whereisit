'use client';

import React from 'react';
import { Truck, CreditCard, Shield, Clock, HelpCircle, Check, PackageCheck } from 'lucide-react';

export default function DeliveryPaymentSection() {
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

          {/* Card 2: Safe Packaging & Shipping Partners */}
          <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E5DFD4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#14191F] mb-3">Courier & Safe Transit</h3>
              <ul className="space-y-3 text-xs text-[#556473]">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <span><strong>Domestic Couriers:</strong> JNE YES, SiCepat Gokil (Cargo for furniture), Paxel (Cold/Dry Secure).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <span><strong>Custom Protective Foam:</strong> Recycled shock-absorbing inserts molded specifically to each silhouette.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#5C7489] shrink-0 mt-0.5" />
                  <span><strong>Transit Guarantee:</strong> If any item arrives damaged, we immediately reprint and replace at zero cost.</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECE6DC] text-[11px] text-[#7A8B99]">
              Wooden crating provided for accent chairs and stools.
            </div>
          </div>

          {/* Card 3: Payment Architecture & Foundation */}
          <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E5DFD4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-2xl bg-[#EDF3F7] text-[#5C7489] w-fit mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#14191F] mb-3">Payment Methods</h3>
              <p className="text-xs text-[#556473] leading-relaxed mb-4">
                Our checkout foundation supports seamless order placement with flexible settlement options:
              </p>
              <ul className="space-y-2 text-xs text-[#556473]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C7489]"></span>
                  <span><strong>QRIS Instant:</strong> GoPay, OVO, ShopeePay, Dana</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C7489]"></span>
                  <span><strong>Virtual Account:</strong> BCA, Mandiri, BNI, BRI</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C7489]"></span>
                  <span><strong>Cards:</strong> Visa, MasterCard, JCB</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C7489]"></span>
                  <span><strong>Custom Project Split:</strong> 50% deposit / 50% final sign-off</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ECE6DC] text-[11px] text-[#7A8B99] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#5C7489]" />
              <span>Direct studio invoice & receipts issued.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
