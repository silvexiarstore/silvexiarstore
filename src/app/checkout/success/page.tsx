// src/app/checkout/success/page.tsx
"use client";

import { MotionDiv } from "@/components/MotionDiv";
import Link from "next/link";
import { Check, ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] flex items-center justify-center p-6 overflow-hidden font-sans">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#F2994A]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#1CA7A6]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="card-elevated bg-white rounded-[3rem] p-10 md:p-16 text-center border-2 border-[#E8F6F6]"
        >
          <MotionDiv
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, delay: 0.3 }}
            className="w-24 h-24 bg-[#1CA7A6] rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(28,167,166,0.2)]"
          >
            <Check className="text-white" size={40} strokeWidth={3} />
          </MotionDiv>

          <div className="space-y-6">
            <h2 className="text-[#1CA7A6] text-xs font-bold uppercase tracking-[0.5em] font-display">Order Confirmed</h2>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-gradient-brand leading-tight">
              Thank You for Choosing <br />
              <span className="text-[#333333]">Silvexiar</span>
            </h1>

            <div className="w-16 h-1 bg-[#1CA7A6]/20 mx-auto rounded-full" />

            <p className="text-[#6B7280] text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto">
              We appreciate your trust in <span className="text-[#1CA7A6] font-bold">Silvexiar</span>. Your order is currently being processed and will be shipped directly by our certified international suppliers to your doorstep as soon as possible.
            </p>

            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-white border-2 border-[#E8F6F6] p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 text-left mt-8"
            >
              <div className="p-4 bg-[#E8F6F6] rounded-2xl shadow-sm text-[#F2994A]">
                <Truck size={32} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#333333] mb-1 flex items-center gap-2 font-display">
                  <Sparkles size={14} /> Direct Premium Shipping
                </h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed font-bold">
                  To ensure maximum quality, your selection is dispatched from our global fulfillment centers directly to your private residence.
                </p>
              </div>
            </MotionDiv>
          </div>

          <div className="mt-12 space-y-4">
            <Link
              href="/account/orders"
              className="group flex items-center justify-center gap-4 bg-[#1CA7A6] text-white w-full py-5 rounded-full font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#178E8D] transition-all duration-500 shadow-lg font-display animate-sheen"
            >
              Track My Order <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-[#6B7280] hover:text-[#1CA7A6] text-[10px] font-bold uppercase tracking-[0.35em] transition-colors font-display"
            >
              <ShieldCheck size={12} /> Curated Excellence Protected
            </Link>
          </div>
        </MotionDiv>

        <p className="text-center mt-12 text-[#9CA3AF] text-[9px] font-bold uppercase tracking-[0.5em] font-display">
          Silvexiar Luxury Group | Worldwide Shipping
        </p>
      </div>
    </div>
  );
}