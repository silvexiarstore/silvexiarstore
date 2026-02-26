"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings, 
  Plus, 
  UploadCloud, 
  FolderTree, 
  Image as ImageIcon, 
  Loader2, 
  X, 
  Edit2 
} from "lucide-react";

// Components
import DeleteCategoryButton from "@/components/DeleteCategoryButton";
import EditCategoryModal from "@/components/EditCategoryModal";
import HomepageSettingsManager from "@/components/admin/HomepageSettingsManager";

export default function AdminSettingsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal State for Editing
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Form State
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileName = `categories/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    
    try {
      const { data, error } = await supabase.storage.from("products").upload(fileName, file);
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
      setImage(urlData.publicUrl);
      toast.success("Category image uploaded! ✨");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("Name is required");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      if (res.ok) {
        toast.success("Category created successfully! 📁");
        setName(""); 
        setImage("");
        fetchCategories();
      }
    } catch (err) {
      toast.error("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <Link href="/admin" className="text-slate-400 hover:text-sky-400 text-xs font-black tracking-widest uppercase flex items-center justify-center md:justify-start gap-2 mb-3 transition-all">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                <Settings className="text-sky-500" size={32} />
                Store Settings
              </h1>
              <p className="text-slate-400 mt-2 font-medium">Manage global categories and store configurations.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 1. ADD CATEGORY FORM (Left) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 lg:sticky lg:top-10">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="bg-sky-100 p-2 rounded-xl text-sky-600 shadow-sm"><Plus size={20} /></div>
                Add Category
              </h2>
              
              <form onSubmit={handleCreate} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Category Name</label>
                  <input 
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-sky-500 font-bold transition-all placeholder:text-slate-300"
                    placeholder="e.g. Summer Collection"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Visual Icon / Image</label>
                  <div className="space-y-4">
                    {image ? (
                      <div className="relative h-48 w-full rounded-[2rem] overflow-hidden border-4 border-sky-50 shadow-inner group">
                        <Image src={image} alt="preview" fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                        <button 
                          type="button" 
                          onClick={() => setImage("")} 
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-rose-500 shadow-xl hover:bg-white transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2rem] p-10 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer group">
                        <div className="bg-slate-50 p-4 rounded-full group-hover:scale-110 transition-transform shadow-sm">
                          {uploading ? <Loader2 size={32} className="animate-spin text-sky-500" /> : <UploadCloud size={32} className="text-slate-300 group-hover:text-sky-400" />}
                        </div>
                        <span className="text-xs font-black text-slate-400 mt-4 uppercase tracking-widest">Select Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || uploading}
                  className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "SAVING..." : "CREATE CATEGORY"}
                </button>
              </form>
            </div>
          </div>

          {/* 2. CATEGORIES LIST (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shadow-sm"><FolderTree size={20} /></div>
                Current Infrastructure
              </h2>
              
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic">No active categories found.</p>
                  </div>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl group transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:border-sky-100">
                      <div className="flex items-center gap-5">
                        <div className="relative h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                          {cat.image ? (
                            <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-200"><ImageIcon size={24} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">{cat.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-sky-500 uppercase bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                              {cat._count.products} Products
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {/* EDIT BUTTON */}
                        <button 
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsEditModalOpen(true);
                          }}
                          className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-sky-500 hover:text-white hover:shadow-lg hover:shadow-sky-200 transition-all"
                          title="Edit Category"
                        >
                          <Edit2 size={18} />
                        </button>
                        
                        {/* DELETE BUTTON */}
                        <DeleteCategoryButton id={cat.id} name={cat.name} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        <HomepageSettingsManager />

        {/* Branding Footer */}
        <div className="text-center pb-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Silvexiar Engine • Categories System</p>
        </div>

      </div>

      {/* --- RENDER THE EDIT MODAL (Popup Window) --- */}
      {isEditModalOpen && selectedCategory && (
        <EditCategoryModal 
          category={selectedCategory} 
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }} 
          onSuccess={fetchCategories} 
        />
      )}
    </div>
  );
}
