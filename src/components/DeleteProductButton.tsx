"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // زدنا useEffect
import { createPortal } from "react-dom"; // زدنا createPortal باش نحل المشكل
import { toast } from "sonner";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // هاد الجزء ضروري باش نتفاداو مشاكل الـ SSR في Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    const toastId = toast.loading("Removing product...");

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully!", { id: toastId });
        setShowModal(false);
        router.refresh();
      } else {
        toast.error("Failed to delete", { id: toastId });
      }
    } catch (err) {
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // المودال (النافذة) غنحطوها فمتغير بوحدها
  const modalContent = showModal && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => !loading && setShowModal(false)}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 z-10">
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle size={40} className="text-rose-500" />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Are you sure?</h3>
          <p className="text-slate-500 font-medium mb-8">
            This action is permanent. You are about to delete this product from your inventory.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              disabled={loading}
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              NO, CANCEL
            </button>
            <button
              disabled={loading}
              onClick={handleDelete}
              className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              YES, DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all duration-300"
      >
        <Trash2 size={16} />
      </button>

      {/* هنا كنستعملو Portal باش نخرجوه لـ Body */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}