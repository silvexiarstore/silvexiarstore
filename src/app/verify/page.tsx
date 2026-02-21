"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MotionDiv } from "@/components/MotionDiv";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (token) {
      fetch(`/api/auth/verify?token=${token}`)
        .then((res) => {
          if (res.ok) setStatus("success");
          else setStatus("error");
        });
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6">
      <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-gray-100">
        {status === "loading" && (
          <div className="space-y-6">
            <Loader2 size={60} className="text-amber-700 animate-spin mx-auto" />
            <h1 className="text-2xl font-serif italic">Decrypting Identity...</h1>
          </div>
        )}
        {status === "success" && (
          <div className="space-y-6 animate-in zoom-in">
            <CheckCircle size={80} className="text-green-600 mx-auto shadow-neon" />
            <h1 className="text-4xl font-serif italic text-gray-900">Vault Activated</h1>
            <p className="text-gray-500 font-medium">Your membership is now official. Welcome to the circle.</p>
            <button onClick={() => router.push("/login")} className="w-full bg-black text-white py-5 rounded-full font-black text-xs uppercase tracking-widest">Enter the Vault</button>
          </div>
        )}
        {status === "error" && (status as any) !== "loading" && (
          <div className="space-y-6">
            <XCircle size={80} className="text-red-500 mx-auto" />
            <h1 className="text-3xl font-serif italic text-gray-900">Link Expired</h1>
            <p className="text-gray-500 font-medium">This activation key is no longer valid.</p>
            <button onClick={() => router.push("/register")} className="w-full bg-gray-100 text-gray-900 py-5 rounded-full font-black text-xs uppercase tracking-widest">Request New Link</button>
          </div>
        )}
      </MotionDiv>
    </div>
  );
}