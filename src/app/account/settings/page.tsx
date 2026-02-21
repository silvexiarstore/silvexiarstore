"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Lock, Edit3, CheckCircle, Loader2, X } from "lucide-react";
import { MotionDiv } from "@/components/MotionDiv";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPass, setIsEditingPass] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [userData, setUserData] = useState({ fullName: "", email: "" });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(data => {
        setUserData({ fullName: data.fullName, email: data.email });
        setFetching(false);
      });
  }, []);

  const handleUpdate = async (type: 'profile' | 'password') => {
    setLoading(true);
    const body = type === 'profile' ? { fullName: userData.fullName } : { password: newPassword };
    
    const res = await fetch("/api/user/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setSuccess(true);
      setIsEditingProfile(false);
      setIsEditingPass(false);
      setNewPassword("");
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  if (fetching) return <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center font-serif italic text-2xl">Loading Identity...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] py-10 pb-32 font-sans">
      <div className="max-w-2xl mx-auto px-3 sm:px-6">
        <Link href="/account" className="flex items-center gap-2 text-[#1CA7A6] font-bold uppercase tracking-widest text-xs mb-8 hover:text-[#F2994A] transition-colors">
          <ArrowLeft size={16} /> Back to Account
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient-brand mb-10 leading-tight drop-shadow-md">Settings</h1>

        {success && (
          <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1CA7A6] text-[#F2994A] p-6 rounded-2xl mb-8 flex items-center gap-4 shadow-lg">
            <CheckCircle size={24} /> <span className="font-bold text-base uppercase tracking-widest font-display">Records Updated</span>
          </MotionDiv>
        )}

        <div className="space-y-8">
          
          {/* PERSONAL INFO CARD */}
          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-amber-700">
                <User size={28} /> <h2 className="text-3xl font-serif italic">Identity</h2>
              </div>
              {!isEditingProfile ? (
                <button onClick={() => setIsEditingProfile(true)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-all">
                  <Edit3 size={20} />
                </button>
              ) : (
                <button onClick={() => setIsEditingProfile(false)} className="p-4 bg-red-50 text-red-500 rounded-2xl">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 px-2">Full Legal Name</label>
                {isEditingProfile ? (
                  <input 
                    className="w-full bg-gray-50 border-none p-6 rounded-2xl text-2xl font-medium outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" 
                    value={userData.fullName} 
                    onChange={e => setUserData({...userData, fullName: e.target.value})} 
                  />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 px-2">{userData.fullName}</p>
                )}
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 px-2">Email Credentials (Fixed)</label>
                <p className="text-2xl font-medium text-gray-500 px-2">{userData.email}</p>
              </div>

              {isEditingProfile && (
                <button onClick={() => handleUpdate('profile')} disabled={loading} className="w-full bg-black text-white py-6 rounded-full font-black uppercase tracking-widest text-sm shadow-xl">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Save Identity"}
                </button>
              )}
            </div>
          </section>

          {/* PASSWORD CARD */}
          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-amber-700">
                <Lock size={28} /> <h2 className="text-3xl font-serif italic">Vault Access</h2>
              </div>
              <button onClick={() => setIsEditingPass(!isEditingPass)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-all">
                {isEditingPass ? <X size={20} /> : <Edit3 size={20} />}
              </button>
            </div>

            {!isEditingPass ? (
               <p className="text-xl text-gray-400 italic px-2">Your access key is encrypted and secure.</p>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 px-2">New Access Key (Password)</label>
                  <input 
                    type="password"
                    placeholder="Enter new code"
                    className="w-full bg-gray-50 border-none p-6 rounded-2xl text-2xl font-medium outline-none focus:ring-4 focus:ring-amber-500/10" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <button onClick={() => handleUpdate('password')} disabled={loading || newPassword.length < 6} className="w-full bg-amber-700 text-white py-6 rounded-full font-black uppercase tracking-widest text-sm shadow-neon-amber disabled:opacity-30">
                   {loading ? <Loader2 className="animate-spin mx-auto" /> : "Update Encryption"}
                </button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}