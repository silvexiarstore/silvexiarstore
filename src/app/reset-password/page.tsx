"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MotionDiv } from "@/components/MotionDiv";
import { Lock, CheckCircle, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function ResetPasswordPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token"); // جلب التوكن من الرابط

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setSuccess(true);
      // توجيه المستخدم بعد 3 ثواني
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* تأثيرات الخلفية */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-125 w-full z-10"
      >
        <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-gray-50 relative">
          
          {!success ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-block p-6 bg-gray-50 rounded-[2rem] mb-6 shadow-inner text-amber-700">
                  <Lock size={40} className="shadow-neon-amber" />
                </div>
                <h2 className="text-amber-800 text-xs font-black uppercase tracking-[0.5em] mb-3">Security Protocol</h2>
                <h1 className="text-4xl md:text-5xl font-serif italic text-gray-900 leading-tight">New Access Key</h1>
                <p className="text-gray-400 text-sm mt-4 font-medium">Please define your new premium access credentials.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-shake">
                  <ShieldAlert size={18} /> {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-700 transition-colors" size={22} />
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      required 
                      className="w-full bg-gray-50 border-none p-6 pl-16 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-500/10 text-xl font-medium transition-all"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-700 transition-colors" size={22} />
                    <input 
                      type="password" 
                      placeholder="Confirm New Password" 
                      required 
                      className="w-full bg-gray-50 border-none p-6 pl-16 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-500/10 text-xl font-medium transition-all"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading} 
                  className="w-full bg-black text-white py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-amber-800 transition-all shadow-xl flex items-center justify-center gap-4 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Update Access Key"}
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-10 animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-neon">
                <CheckCircle className="text-white" size={48} />
              </div>
              <h1 className="text-4xl font-serif italic text-gray-900 mb-4">Access Restored</h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed">
                Your credentials have been successfully updated. Redirecting to vault entry...
              </p>
              <div className="mt-10">
                <Loader2 className="animate-spin text-amber-700 mx-auto" size={32} />
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/login" className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] hover:text-black transition-colors">
               Cancel Restoration
            </Link>
          </div>
        </div>

        <p className="text-center mt-12 text-gray-300 text-[9px] font-black uppercase tracking-[0.5em]">
          Silvexiar Secure Terminal • Encrypted v2.0
        </p>
      </MotionDiv>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageInner />
    </Suspense>
  );
}