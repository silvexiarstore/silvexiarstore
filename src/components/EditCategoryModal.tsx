"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";
import { X, UploadCloud, Loader2, Save } from "lucide-react";

interface EditCategoryModalProps {
  category: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoryModal({ category, onClose, onSuccess }: EditCategoryModalProps) {
  const [name, setName] = useState(category.name);
  const [image, setImage] = useState(category.image || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileName = `categories/${Date.now()}-${file.name}`;
    try {
      const { data, error } = await supabase.storage.from("products").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
      setImage(urlData.publicUrl);
      toast.success("Image replaced!");
    } catch (err) { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category.id, name, image }),
      });
      if (res.ok) {
        toast.success("Category updated! ✨");
        onSuccess();
        onClose();
      }
    } catch (err) { toast.error("Update failed"); }
    finally { setLoading(false); }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-black transition-colors">
            <X size={28} />
        </button>

        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <div className="bg-sky-100 p-2 rounded-xl text-sky-600"><Save size={24} /></div>
          Edit Category
        </h2>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">New Name</label>
            <input 
              required
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-sky-500 font-bold transition-all text-lg"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Category Image</label>
            <div className="relative group h-48 w-full bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-100 flex items-center justify-center">
              {image ? (
                <>
                  <Image src={image} alt="preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl font-bold text-xs shadow-xl hover:scale-105 transition-transform">
                      CHANGE IMAGE
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                   <UploadCloud size={32} className="text-slate-300" />
                   <span className="text-xs font-bold text-slate-400 mt-2">Upload Image</span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-sky-500" size={32} />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              disabled={loading || uploading}
              className="flex-[2] py-4 bg-sky-500 text-white rounded-2xl font-black text-sm hover:bg-sky-400 shadow-lg shadow-sky-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "SAVING..." : "UPDATE CATEGORY"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
