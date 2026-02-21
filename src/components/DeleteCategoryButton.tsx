"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Trash2, X, Loader2, AlertCircle } from "lucide-react";

export default function DeleteCategoryButton({ id, name }: { id: string, name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted!");
        setShowModal(false);
        router.refresh();
      } else {
        toast.error("Category is linked to products!");
      }
    } catch (err) { toast.error("Error occurred"); }
    finally { setLoading(false); }
  };

  const modalContent = showModal && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !loading && setShowModal(false)} />
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500"><AlertCircle size={32} /></div>
          <h3 className="text-xl font-black text-slate-900 mb-2 font-sans">Delete "{name}"?</h3>
          <p className="text-slate-500 text-sm mb-6">This will remove the category. Make sure it has no products linked to it.</p>
          <div className="flex gap-3 w-full">
            <button disabled={loading} onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-xs">CANCEL</button>
            <button disabled={loading} onClick={handleDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setShowModal(true)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
        <Trash2 size={18} />
      </button>
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}