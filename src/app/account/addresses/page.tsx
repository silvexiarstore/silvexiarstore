"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, MapPin, X, Edit3, Loader2 } from "lucide-react";
import { MotionDiv } from "@/components/MotionDiv";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ fullName: "", email: "", addressLine: "", city: "", postalCode: "", country: "", phone: "" });

  useEffect(() => {
    fetch("/api/user/addresses").then(res => res.json()).then(data => {
      setAddresses(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `/api/user/addresses?id=${editingId}` : "/api/user/addresses";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      window.location.reload(); // Refresh to see changes
    }
    setLoading(false);
  };

  const handleEdit = (addr: any) => {
    setFormData({ ...addr });
    setEditingId(addr.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] py-10 font-sans">
      <div className="max-w-2xl mx-auto px-3 sm:px-6">
        <Link href="/account" className="flex items-center gap-2 text-[#1CA7A6] font-bold uppercase tracking-widest text-xs mb-8 hover:text-[#F2994A] transition-colors">
          <ArrowLeft size={16} /> Back to Account
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient-brand mb-8 leading-tight drop-shadow-md">My Addresses</h1>

        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({fullName:"", email:"", addressLine:"", city:"", postalCode:"", country:"", phone:""}) }} 
          className="w-full bg-[#1CA7A6] text-white py-5 rounded-full font-bold uppercase tracking-widest text-sm mb-8 shadow-lg flex items-center justify-center gap-2 animate-sheen hover:bg-[#F2994A] transition-colors">
          {showForm ? <X size={18} /> : <><Plus size={18} /> New Address</>}
        </button>

        {showForm && (
          <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 mb-12 space-y-6">
            <h2 className="text-2xl font-serif italic">{editingId ? "Update" : "Authorize"} Address</h2>
            <div className="space-y-4">
              <input required placeholder="Full Name" className="w-full bg-gray-50 border-none p-6 rounded-2xl text-xl outline-none" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input type="email" placeholder="Email" className="w-full bg-gray-50 border-none p-6 rounded-2xl text-xl outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required placeholder="Phone" className="w-full bg-gray-50 border-none p-6 rounded-2xl text-xl outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required placeholder="Address Line" className="w-full bg-gray-50 border-none p-6 rounded-2xl text-xl outline-none" value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required placeholder="City" className="w-full bg-gray-50 border-none p-6 rounded-2xl text-xl outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                <input required placeholder="Country" className="w-full bg-gray-50 border-none p-6 rounded-2xl text-xl outline-none" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                <input required placeholder="Postal Code" className="w-full bg-gray-50 border-none p-6 rounded-2xl text-xl outline-none" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-amber-700 text-white py-6 rounded-full font-black uppercase tracking-widest text-sm shadow-neon-amber">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Changes"}
            </button>
          </MotionDiv>
        )}

        <div className="space-y-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-serif italic text-gray-900">{addr.fullName}</h3>
                <p className="text-xl text-gray-500 mt-2">{addr.addressLine}</p>
                {addr.email && <p className="text-sm text-gray-500 mt-1">{addr.email}</p>}
                <p className="text-sm text-amber-800 font-bold uppercase tracking-widest mt-1">{addr.city}, {addr.country}</p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => handleEdit(addr)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-colors"><Edit3 size={20} /></button>
                <button className="p-4 bg-gray-50 rounded-2xl text-red-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
