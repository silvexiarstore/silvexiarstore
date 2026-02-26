"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  price: number | string;
  images: string[];
};

type HeroSlideForm = {
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage: string;
  desktopImages: string[];
  mobileImages: string[];
  showText: boolean;
  frameBadges: string[];
  frameTitles: string[];
  frameSubtitles: string[];
  frameShowText: boolean[];
  isActive: boolean;
};

type ProductSectionForm = {
  name: string;
  productIds: string[];
  showTitle: boolean;
  isActive: boolean;
};

type LayoutBlockForm = {
  key: string;
  label: string;
  isActive: boolean;
};

type HomepagePayload = {
  slides: HeroSlideForm[];
  sections: ProductSectionForm[];
  layout: LayoutBlockForm[];
  products: AdminProduct[];
};

const EMPTY_SLIDE: HeroSlideForm = {
  badge: "",
  title: "",
  subtitle: "",
  ctaLabel: "Explore Now",
  ctaLink: "/shop",
  desktopImage: "",
  mobileImage: "",
  desktopImages: [],
  mobileImages: [],
  showText: true,
  frameBadges: [],
  frameTitles: [],
  frameSubtitles: [],
  frameShowText: [],
  isActive: true,
};

const EMPTY_SECTION: ProductSectionForm = {
  name: "",
  productIds: [],
  showTitle: true,
  isActive: true,
};

const BASE_BLOCKS: LayoutBlockForm[] = [
  { key: "HERO", label: "Hero Slider", isActive: true },
  { key: "TRUST", label: "Trust Strip", isActive: true },
  { key: "CATEGORIES", label: "Categories", isActive: true },
];

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export default function HomepageSettingsManager() {
  const [slides, setSlides] = useState<HeroSlideForm[]>([]);
  const [sections, setSections] = useState<ProductSectionForm[]>([]);
  const [layout, setLayout] = useState<LayoutBlockForm[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/homepage");
        if (!res.ok) throw new Error("Failed to load homepage settings");
        const data: HomepagePayload = await res.json();

        const safeSlides = (data.slides || []).map((slide) => {
          const desktopImages = Array.isArray(slide.desktopImages) && slide.desktopImages.length > 0
            ? slide.desktopImages
            : slide.desktopImage
              ? [slide.desktopImage]
              : [];
          const mobileImages = Array.isArray(slide.mobileImages) && slide.mobileImages.length > 0
            ? slide.mobileImages
            : slide.mobileImage
              ? [slide.mobileImage]
              : [];

          return {
            ...EMPTY_SLIDE,
            ...slide,
            desktopImages,
            mobileImages,
            desktopImage: slide.desktopImage || desktopImages[0] || "",
            mobileImage: slide.mobileImage || mobileImages[0] || "",
            frameBadges: Array.isArray(slide.frameBadges) ? slide.frameBadges : [],
            frameTitles: Array.isArray(slide.frameTitles) ? slide.frameTitles : [],
            frameSubtitles: Array.isArray(slide.frameSubtitles) ? slide.frameSubtitles : [],
            frameShowText: Array.isArray(slide.frameShowText) ? slide.frameShowText : [],
          };
        });

        const safeSections = (data.sections || []).map((section) => ({ ...EMPTY_SECTION, ...section }));
        const safeLayout = Array.isArray(data.layout) && data.layout.length > 0
          ? data.layout
          : [
              ...BASE_BLOCKS,
              ...safeSections.map((section, idx) => ({
                key: `SECTION:${idx}`,
                label: section.name || `Section ${idx + 1}`,
                isActive: true,
              })),
            ];

        setSlides(safeSlides);
        setSections(safeSections);
        setLayout(safeLayout);
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        toast.error("Unable to load homepage settings");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const availableBlocks = useMemo(() => {
    const sectionBlocks = sections.map((section, idx) => ({
      key: `SECTION:${idx}`,
      label: section.name?.trim() || `Section ${idx + 1}`,
      isActive: true,
    }));
    return [...BASE_BLOCKS, ...sectionBlocks];
  }, [sections]);

  const handleUpload = async (
    file: File,
    onDone: (url: string) => void,
    slot: string,
  ) => {
    setUploadingKey(slot);
    try {
      const fileName = `homepage/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const { error } = await supabase.storage.from("products").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
      onDone(urlData.publicUrl);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  const saveAll = async () => {
    const validSlides = slides.filter(
      (slide) => slide.desktopImages.length > 0 && slide.mobileImages.length > 0,
    );

    if (validSlides.length === 0) {
      toast.error("Add at least one complete hero slide");
      return;
    }

    const validKeys = new Set(availableBlocks.map((b) => b.key));
    const cleanedLayout = layout.filter((b) => validKeys.has(b.key));

    setSaving(true);
    const toastId = toast.loading("Saving homepage settings...");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, sections, layout: cleanedLayout }),
      });
      if (!res.ok) throw new Error();
      toast.success("Homepage settings saved", { id: toastId });
    } catch {
      toast.error("Failed to save homepage settings", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const addBlockToLayout = (block: LayoutBlockForm) => {
    if (layout.some((b) => b.key === block.key)) return;
    setLayout((prev) => [...prev, block]);
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Loading homepage settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Homepage Control Center</h2>
            <p className="text-sm text-slate-500 mt-1">Complete control: order, show/hide, and per-photo hero text.</p>
          </div>
          <button type="button" onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Homepage
          </button>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-900">Layout Positions</h3>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              {layout.map((block, index) => (
                <div key={`${block.key}-${index}`} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{block.label}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">{block.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1"><input type="checkbox" checked={block.isActive} onChange={(e) => setLayout((prev) => prev.map((b, i) => i === index ? { ...b, isActive: e.target.checked } : b))} />Show</label>
                    <button type="button" disabled={index === 0} onClick={() => setLayout((prev) => moveItem(prev, index, index - 1))} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronUp size={14} /></button>
                    <button type="button" disabled={index === layout.length - 1} onClick={() => setLayout((prev) => moveItem(prev, index, index + 1))} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronDown size={14} /></button>
                    <button type="button" onClick={() => setLayout((prev) => prev.filter((_, i) => i !== index))} className="p-2 rounded-lg bg-rose-50 text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex flex-wrap gap-2">
                {availableBlocks.filter((b) => !layout.some((existing) => existing.key === b.key)).map((block) => (
                  <button key={block.key} type="button" onClick={() => addBlockToLayout(block)} className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wide">+ {block.label}</button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Hero Slides</h3>
              <button type="button" onClick={() => setSlides((prev) => [...prev, { ...EMPTY_SLIDE }])} className="inline-flex items-center gap-2 px-3 py-2 bg-sky-50 text-sky-700 rounded-lg font-semibold text-xs uppercase tracking-wide"><Plus size={14} /> Add Slide</button>
            </div>

            {slides.map((slide, index) => {
              const framesCount = Math.max(slide.desktopImages.length, slide.mobileImages.length);

              return (
                <div key={`slide-${index}`} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">Slide #{index + 1}</p>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={index === 0} onClick={() => setSlides((prev) => moveItem(prev, index, index - 1))} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"><ChevronUp size={14} /></button>
                      <button type="button" disabled={index === slides.length - 1} onClick={() => setSlides((prev) => moveItem(prev, index, index + 1))} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"><ChevronDown size={14} /></button>
                      <button type="button" onClick={() => setSlides((prev) => prev.filter((_, i) => i !== index))} className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <input value={slide.badge} onChange={(e) => setSlides((prev) => prev.map((s, i) => i === index ? { ...s, badge: e.target.value } : s))} placeholder="Default badge" className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={slide.showText} onChange={(e) => setSlides((prev) => prev.map((s, i) => i === index ? { ...s, showText: e.target.checked } : s))} />Show text by default</label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={slide.isActive} onChange={(e) => setSlides((prev) => prev.map((s, i) => i === index ? { ...s, isActive: e.target.checked } : s))} />Slide active</label>
                  </div>

                  <input value={slide.title} onChange={(e) => setSlides((prev) => prev.map((s, i) => i === index ? { ...s, title: e.target.value } : s))} placeholder="Default title" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
                  <textarea value={slide.subtitle} onChange={(e) => setSlides((prev) => prev.map((s, i) => i === index ? { ...s, subtitle: e.target.value } : s))} placeholder="Default subtitle" rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />

                  <div className="grid md:grid-cols-2 gap-3">
                    <input value={slide.ctaLabel} onChange={(e) => setSlides((prev) => prev.map((s, i) => i === index ? { ...s, ctaLabel: e.target.value } : s))} placeholder="CTA label" className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
                    <input value={slide.ctaLink} onChange={(e) => setSlides((prev) => prev.map((s, i) => i === index ? { ...s, ctaLink: e.target.value } : s))} placeholder="CTA link" className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Desktop photos</p>
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          void handleUpload(file, (url) => setSlides((prev) => prev.map((s, i) => i !== index ? s : { ...s, desktopImages: [...s.desktopImages, url], desktopImage: s.desktopImage || url })), `slide-${index}-desktop`);
                        }} />
                        <div className="h-11 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500 text-xs font-semibold">
                          {uploadingKey === `slide-${index}-desktop` ? <Loader2 size={14} className="animate-spin" /> : <><ImagePlus size={14} className="mr-2" />Upload desktop photo</>}
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Mobile photos</p>
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          void handleUpload(file, (url) => setSlides((prev) => prev.map((s, i) => i !== index ? s : { ...s, mobileImages: [...s.mobileImages, url], mobileImage: s.mobileImage || url })), `slide-${index}-mobile`);
                        }} />
                        <div className="h-11 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500 text-xs font-semibold">
                          {uploadingKey === `slide-${index}-mobile` ? <Loader2 size={14} className="animate-spin" /> : <><ImagePlus size={14} className="mr-2" />Upload mobile photo</>}
                        </div>
                      </label>
                    </div>
                  </div>

                  {framesCount > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Per-photo text controls</p>
                      {Array.from({ length: framesCount }).map((_, frameIdx) => (
                        <div key={`frame-${frameIdx}`} className="grid md:grid-cols-6 gap-2 bg-white border border-slate-200 rounded-xl p-3">
                          <div className="relative h-16 rounded-lg overflow-hidden border border-slate-200 md:col-span-1">
                            {(slide.desktopImages[frameIdx] || slide.desktopImages[0]) ? (
                              <Image src={slide.desktopImages[frameIdx] || slide.desktopImages[0]} alt="d" fill className="object-cover" />
                            ) : null}
                          </div>
                          <input value={slide.frameBadges[frameIdx] || ""} onChange={(e) => setSlides((prev) => prev.map((s, i) => {
                            if (i !== index) return s;
                            const next = [...s.frameBadges]; next[frameIdx] = e.target.value;
                            return { ...s, frameBadges: next };
                          }))} placeholder="Badge" className="px-3 py-2 border border-slate-200 rounded-lg text-xs md:col-span-1" />
                          <input value={slide.frameTitles[frameIdx] || ""} onChange={(e) => setSlides((prev) => prev.map((s, i) => {
                            if (i !== index) return s;
                            const next = [...s.frameTitles]; next[frameIdx] = e.target.value;
                            return { ...s, frameTitles: next };
                          }))} placeholder="Title" className="px-3 py-2 border border-slate-200 rounded-lg text-xs md:col-span-2" />
                          <input value={slide.frameSubtitles[frameIdx] || ""} onChange={(e) => setSlides((prev) => prev.map((s, i) => {
                            if (i !== index) return s;
                            const next = [...s.frameSubtitles]; next[frameIdx] = e.target.value;
                            return { ...s, frameSubtitles: next };
                          }))} placeholder="Subtitle" className="px-3 py-2 border border-slate-200 rounded-lg text-xs md:col-span-1" />
                          <label className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 md:col-span-1"><input type="checkbox" checked={slide.frameShowText[frameIdx] ?? slide.showText} onChange={(e) => setSlides((prev) => prev.map((s, i) => {
                            if (i !== index) return s;
                            const next = [...s.frameShowText]; next[frameIdx] = e.target.checked;
                            return { ...s, frameShowText: next };
                          }))} />Show text</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Product Sections</h3>
              <button type="button" onClick={() => setSections((prev) => [...prev, { ...EMPTY_SECTION }])} className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-xs uppercase tracking-wide"><Plus size={14} /> Add Section</button>
            </div>

            {sections.map((section, index) => (
              <div key={`section-${index}`} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Section #{index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={index === 0} onClick={() => setSections((prev) => moveItem(prev, index, index - 1))} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"><ChevronUp size={14} /></button>
                    <button type="button" disabled={index === sections.length - 1} onClick={() => setSections((prev) => moveItem(prev, index, index + 1))} className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"><ChevronDown size={14} /></button>
                    <button type="button" onClick={() => setSections((prev) => prev.filter((_, i) => i !== index))} className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <input value={section.name} onChange={(e) => setSections((prev) => prev.map((s, i) => i === index ? { ...s, name: e.target.value } : s))} placeholder="Section name" className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={section.showTitle} onChange={(e) => setSections((prev) => prev.map((s, i) => i === index ? { ...s, showTitle: e.target.checked } : s))} />Show title</label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={section.isActive} onChange={(e) => setSections((prev) => prev.map((s, i) => i === index ? { ...s, isActive: e.target.checked } : s))} />Section active</label>
                </div>

                <div className="max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                  {products.map((product) => {
                    const checked = section.productIds.includes(product.id);
                    return (
                      <label key={product.id} className="flex items-center gap-3 p-3 text-sm cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={(e) => setSections((prev) => prev.map((s, i) => i !== index ? s : { ...s, productIds: e.target.checked ? [...s.productIds, product.id] : s.productIds.filter((id) => id !== product.id) }))} />
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                          {product.images?.[0] ? <Image src={product.images[0]} alt={product.title} fill className="object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{product.title}</p>
                          <p className="text-xs text-slate-500 truncate">/{product.slug}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {section.productIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {section.productIds.map((id) => (
                      <span key={id} className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wide">
                        {productsById.get(id)?.title || "Unknown"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
