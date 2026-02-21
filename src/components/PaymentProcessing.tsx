// src/components/PaymentProcessing.tsx
"use client";

import { ShieldCheck, Lock, Globe } from "lucide-react";
import { MotionDiv } from "./MotionDiv";

export default function PaymentProcessing() {
  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6"
    >
      <div className="flex items-center gap-4 text-amber-700">
        <div className="p-3 bg-amber-50 rounded-2xl">
          <ShieldCheck size={28} className="shadow-neon-amber" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Secure Payment Vault</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End-to-End Encryption</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
          <Lock size={14} className="text-gray-400" />
          <span>Your payment data is never stored on our servers.</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
          <Globe size={14} className="text-gray-400" />
          <span>International standard security protocols active.</span>
        </div>
      </div>

      {/* خط "نيون" جمالي */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent w-full"></div>
      
      <p className="text-[9px] text-center text-gray-300 font-black uppercase tracking-[0.3em]">
        Silvexiar Secure Terminal v2.0
      </p>
    </MotionDiv>
  );
}