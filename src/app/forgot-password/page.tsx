"use client";

import { useState } from "react";
import { MotionDiv } from "@/components/MotionDiv";
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (res.ok) setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6">
      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[500px] w-full bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-block p-6 bg-blue-50 rounded-[2rem] mb-6"><Sparkles className="text-blue-600" size={40} /></div>
          <h1 className="text-4xl font-serif italic text-gray-900 mb-4">Restore Access</h1>
          <p className="text-gray-400 text-base font-medium">Enter your email to receive a secure restoration key.</p>
        </div>

        {sent ? (
          <div className="p-6 bg-green-50 rounded-3xl border border-green-100 text-green-800 text-center animate-in zoom-in">
             A restoration link has been dispatched. Please check your inbox.
          </div>
        ) : (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={24} />
              <input type="email" placeholder="Email Address" required className="w-full bg-gray-50 border-none p-6 pl-16 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 text-xl font-medium" onChange={e => setEmail(e.target.value)} />
            </div>
            <button disabled={loading} className="w-full bg-black text-white py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-900 transition-all shadow-xl">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Request Link"}
            </button>
          </form>
        )}

        <div className="mt-12 text-center">
          <Link href="/login" className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black">
            <ArrowLeft size={16} /> Return to Entry
          </Link>
        </div>
      </MotionDiv>
    </div>
  );
}