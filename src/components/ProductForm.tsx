
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Package,
  Truck,
  Zap,
  Settings,
  Plus,
  X,
  UploadCloud,
  Link as LinkIcon,
  CheckCircle2,
  Rocket,
  Type,
  ImagePlus,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface Spec {
  name: string;
  values: string[];
}

type ContentStyle = "normal" | "bold" | "italic";
type ContentType = "text" | "image";

interface ContentSection {
  id: string;
  type: ContentType;
  text: string;
  style: ContentStyle;
  image: string;
  caption: string;
}

interface ProductSpecificationsPayload {
  variantOptions: Spec[];
  contentSections: ContentSection[];
}

interface CategoryItem {
  id: string;
  name: string;
}

interface ProductFormInitialData {
  id?: string;
  title?: string;
  description?: string;
  categoryId?: string | null;
  price?: string | number;
  oldPrice?: string | number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  inStock?: boolean;
  freeShippingEnabled?: boolean;
  freeShippingPrice?: string | number | null;
  freeShippingMinDeliveryDays?: number | null;
  freeShippingMaxDeliveryDays?: number | null;
  fastShippingEnabled?: boolean;
  fastShippingPrice?: string | number | null;
  fastShippingMinDeliveryDays?: number | null;
  fastShippingMaxDeliveryDays?: number | null;
  superFastShippingEnabled?: boolean;
  superFastPrice?: string | number | null;
  superFastMinDeliveryDays?: number | null;
  superFastMaxDeliveryDays?: number | null;
  images?: string[];
  specifications?: unknown;
}

interface ProductFormProps {
  initialData?: ProductFormInitialData;
}

const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg|mov)$/i);

const toSafeInt = (value: string, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const makeSectionId = () => `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function normalizeSpecsPayload(raw: unknown): ProductSpecificationsPayload {
  const empty: ProductSpecificationsPayload = { variantOptions: [], contentSections: [] };

  if (Array.isArray(raw)) {
    return {
      ...empty,
      variantOptions: raw
        .filter((item): item is Spec => {
          return Boolean(
            item &&
              typeof item === "object" &&
              "name" in item &&
              "values" in item &&
              Array.isArray((item as Spec).values),
          );
        })
        .map((item) => ({ name: String(item.name || ""), values: item.values.map((v) => String(v)) }))
        .filter((item) => item.name.trim().length > 0),
    };
  }

  if (!raw || typeof raw !== "object") return empty;

  const obj = raw as { variantOptions?: unknown; contentSections?: unknown };

  const variantOptions = Array.isArray(obj.variantOptions)
    ? obj.variantOptions
        .filter((item): item is Spec => {
          return Boolean(
            item &&
              typeof item === "object" &&
              "name" in item &&
              "values" in item &&
              Array.isArray((item as Spec).values),
          );
        })
        .map((item) => ({ name: String(item.name || ""), values: item.values.map((v) => String(v)) }))
        .filter((item) => item.name.trim().length > 0)
    : [];

  const contentSections = Array.isArray(obj.contentSections)
    ? obj.contentSections
        .filter((item): item is Partial<ContentSection> => Boolean(item && typeof item === "object"))
        .map((item) => {
          const type = (item.type === "image" ? "image" : "text") as "image" | "text";
          return {
            id: String(item.id || makeSectionId()),
            type,
            text: String(item.text || ""),
            style:
              item.style === "bold" || item.style === "italic"
                ? (item.style as "bold" | "italic")
                : ("normal" as ContentStyle),
            image: String(item.image || ""),
            caption: String(item.caption || ""),
          };
        })
    : [];

  return { variantOptions, contentSections };
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "",
    oldPrice: "",
    isNew: true,
    isBestSeller: false,
    inStock: true,
    freeShippingEnabled: false,
    freeShippingPrice: "",
    freeShippingMinDeliveryDays: 5,
    freeShippingMaxDeliveryDays: 8,
    fastShippingEnabled: false,
    fastShippingPrice: "",
    fastShippingMinDeliveryDays: 3,
    fastShippingMaxDeliveryDays: 5,
    superFastShippingEnabled: false,
    superFastPrice: "",
    superFastMinDeliveryDays: 1,
    superFastMaxDeliveryDays: 2,
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingContentFor, setUploadingContentFor] = useState<string | null>(null);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [tempInput, setTempInput] = useState<Record<number, string>>({});
  const [currentSpecName, setCurrentSpecName] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));

    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId ? String(initialData.categoryId) : "",
        price: initialData.price?.toString() || "",
        oldPrice: initialData.oldPrice?.toString() || "",
        isNew: initialData.isNew || false,
        isBestSeller: initialData.isBestSeller || false,
        inStock: initialData.inStock ?? true,
        freeShippingEnabled: initialData.freeShippingEnabled || false,
        freeShippingPrice: initialData.freeShippingPrice?.toString() || "",
        freeShippingMinDeliveryDays: initialData.freeShippingMinDeliveryDays || 5,
        freeShippingMaxDeliveryDays: initialData.freeShippingMaxDeliveryDays || 8,
        fastShippingEnabled: initialData.fastShippingEnabled || false,
        fastShippingPrice: initialData.fastShippingPrice?.toString() || "",
        fastShippingMinDeliveryDays: initialData.fastShippingMinDeliveryDays || 3,
        fastShippingMaxDeliveryDays: initialData.fastShippingMaxDeliveryDays || 5,
        superFastShippingEnabled: initialData.superFastShippingEnabled || false,
        superFastPrice: initialData.superFastPrice?.toString() || "",
        superFastMinDeliveryDays: initialData.superFastMinDeliveryDays || 1,
        superFastMaxDeliveryDays: initialData.superFastMaxDeliveryDays || 2,
      });
      setImages(initialData.images || []);

      const normalizedSpecs = normalizeSpecsPayload(initialData.specifications);
      setSpecs(normalizedSpecs.variantOptions);
      setContentSections(normalizedSpecs.contentSections);
    }
  }, [initialData]);

  const uploadToBucket = async (file: File) => {
    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const { error } = await supabase.storage.from("products").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImg(true);
    const files = Array.from(e.target.files);

    try {
      for (const file of files) {
        const publicUrl = await uploadToBucket(file);
        setImages((prev) => [...prev, publicUrl]);
      }
      toast.success("Media uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingImg(false);
      if (e.target) (e.target as HTMLInputElement).value = "";
    }
  };

  const handleContentImageUpload = async (
    sectionId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploadingContentFor(sectionId);
    try {
      const publicUrl = await uploadToBucket(e.target.files[0]);
      setContentSections((prev) =>
        prev.map((section) =>
          section.id === sectionId ? { ...section, image: publicUrl } : section,
        ),
      );
      toast.success("Content image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingContentFor(null);
      if (e.target) (e.target as HTMLInputElement).value = "";
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput) return;
    setImages([...images, imageUrlInput]);
    setImageUrlInput("");
    toast.success("URL added");
  };

  const setMainImage = (index: number) => {
    const newImages = [...images];
    const item = newImages.splice(index, 1)[0];
    newImages.unshift(item);
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpecGroup = () => {
    if (!currentSpecName) return;
    setSpecs([...specs, { name: currentSpecName, values: [] }]);
    setCurrentSpecName("");
  };

  const addSpecValue = (specIdx: number, val: string) => {
    if (!val) return;
    const newSpecs = [...specs];
    if (!newSpecs[specIdx].values.includes(val)) newSpecs[specIdx].values.push(val);
    setSpecs(newSpecs);
  };

  const removeSpecGroup = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSpecValue = (specIdx: number, valIdx: number) => {
    const newSpecs = [...specs];
    newSpecs[specIdx].values.splice(valIdx, 1);
    setSpecs(newSpecs);
  };

  const addContentSection = (type: ContentType) => {
    setContentSections((prev) => [
      ...prev,
      {
        id: makeSectionId(),
        type,
        text: "",
        style: "normal",
        image: "",
        caption: "",
      },
    ]);
  };

  const updateContentSection = (id: string, patch: Partial<ContentSection>) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? {
              ...section,
              ...patch,
            }
          : section,
      ),
    );
  };

  const moveContentSection = (index: number, direction: "up" | "down") => {
    setContentSections((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeContentSection = (id: string) => {
    setContentSections((prev) => prev.filter((section) => section.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.freeShippingEnabled &&
      formData.freeShippingMinDeliveryDays > formData.freeShippingMaxDeliveryDays
    ) {
      toast.error("Free shipping range is invalid");
      return;
    }

    if (
      formData.fastShippingEnabled &&
      formData.fastShippingMinDeliveryDays > formData.fastShippingMaxDeliveryDays
    ) {
      toast.error("Fast shipping range is invalid");
      return;
    }

    if (
      formData.superFastShippingEnabled &&
      formData.superFastMinDeliveryDays > formData.superFastMaxDeliveryDays
    ) {
      toast.error("Super fast shipping range is invalid");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving changes...");

    const normalizedContentSections = contentSections.filter((section) => {
      if (section.type === "text") return section.text.trim().length > 0;
      return section.image.trim().length > 0;
    });

    const payload = {
      ...formData,
      id: initialData?.id,
      price: parseFloat(formData.price),
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      freeShippingPrice:
        formData.freeShippingEnabled && formData.freeShippingPrice
          ? parseFloat(formData.freeShippingPrice)
          : 0,
      fastShippingPrice:
        formData.fastShippingEnabled && formData.fastShippingPrice
          ? parseFloat(formData.fastShippingPrice)
          : null,
      superFastPrice:
        formData.superFastShippingEnabled && formData.superFastPrice
          ? parseFloat(formData.superFastPrice)
          : null,
      freeShippingMinDeliveryDays: formData.freeShippingEnabled
        ? formData.freeShippingMinDeliveryDays
        : null,
      freeShippingMaxDeliveryDays: formData.freeShippingEnabled
        ? formData.freeShippingMaxDeliveryDays
        : null,
      fastShippingMinDeliveryDays: formData.fastShippingEnabled
        ? formData.fastShippingMinDeliveryDays
        : null,
      fastShippingMaxDeliveryDays: formData.fastShippingEnabled
        ? formData.fastShippingMaxDeliveryDays
        : null,
      superFastMinDeliveryDays: formData.superFastShippingEnabled
        ? formData.superFastMinDeliveryDays
        : null,
      superFastMaxDeliveryDays: formData.superFastShippingEnabled
        ? formData.superFastMaxDeliveryDays
        : null,
      images,
      specifications: {
        variantOptions: specs,
        contentSections: normalizedContentSections,
      },
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();

      toast.success("Saved", { id: toastId });
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Error saving", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-20 p-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-800">
        <div className="text-center md:text-left">
          <Link
            href="/admin/products"
            className="text-slate-400 hover:text-sky-400 text-sm font-bold flex items-center gap-1 mb-2 transition-all"
          >
            <Truck size={16} /> Back to Inventory
          </Link>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {initialData ? "Edit Product" : "New Product"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
        >
          {loading ? "..." : initialData ? "UPDATE" : "PUBLISH"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-8 rounded-[2rem] border-2 border-violet-50 shadow-xl shadow-violet-100/20">
            <h2 className="text-xl font-black text-violet-900 mb-8 flex items-center gap-3">
              <div className="bg-violet-100 p-2.5 rounded-2xl text-violet-600 shadow-inner">
                <Plus size={20} />
              </div>
              Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <label className="flex flex-col items-center justify-center border-4 border-dashed border-violet-100 rounded-[2rem] p-10 hover:bg-violet-50/50 hover:border-violet-300 transition-all cursor-pointer">
                <UploadCloud size={40} className="text-violet-300" />
                <span className="mt-3 font-bold text-violet-900">Upload Media</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImg}
                />
              </label>

              <div className="bg-slate-50 rounded-[2rem] p-8 flex flex-col justify-center items-center gap-4">
                <LinkIcon size={24} className="text-slate-400" />
                <input
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-500"
                  placeholder="Paste link here..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="w-full bg-slate-900 text-white py-2 rounded-xl font-bold hover:bg-black"
                >
                  Add URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {images.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                    idx === 0 ? "border-violet-500 scale-105 shadow-xl" : "border-slate-100"
                  }`}
                >
                  {isVideo(item) ? (
                    <video src={item} className="w-full h-full object-cover" muted loop />
                  ) : (
                    <Image src={item} alt="p" fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-violet-900/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col gap-1 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setMainImage(idx)}
                      className="text-[10px] bg-white text-black px-2 py-1 rounded-lg font-bold"
                    >
                      Main
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-bold"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-sky-50 shadow-xl shadow-sky-100/20">
            <h2 className="text-xl font-black text-sky-900 mb-8 flex items-center gap-3">
              <div className="bg-sky-100 p-2.5 rounded-2xl text-sky-600 shadow-inner">
                <Settings size={20} />
              </div>
              Product Information
            </h2>
            <div className="space-y-6">
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-bold text-slate-800 transition-all"
                placeholder="Product Title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                required
                rows={5}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-medium text-slate-700 transition-all resize-none"
                placeholder="Detailed description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-blue-50 shadow-xl shadow-blue-100/20">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-black text-blue-900 flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-600 shadow-inner">
                  <Type size={20} />
                </div>
                Product Page Content
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addContentSection("text")}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 text-white flex items-center gap-2"
                >
                  <Type size={14} /> Add Text
                </button>
                <button
                  type="button"
                  onClick={() => addContentSection("image")}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 text-white flex items-center gap-2"
                >
                  <ImagePlus size={14} /> Add Image
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-5">
              Add as many text/image blocks as you want. They will appear on the product page in the same order.
            </p>

            <div className="space-y-4">
              {contentSections.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
                  No content blocks yet. Add text or image.
                </div>
              )}

              {contentSections.map((section, index) => (
                <div key={section.id} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-700">
                      Block {index + 1} - {section.type === "text" ? "Text" : "Image"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveContentSection(index, "up")}
                        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40"
                        disabled={index === 0}
                      >
                        <MoveUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveContentSection(index, "down")}
                        className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40"
                        disabled={index === contentSections.length - 1}
                      >
                        <MoveDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeContentSection(section.id)}
                        className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {section.type === "text" ? (
                    <>
                      <div className="flex gap-2">
                        {(["normal", "bold", "italic"] as ContentStyle[]).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => updateContentSection(section.id, { style })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                              section.style === style
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={5}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm"
                        placeholder="Write content text..."
                        value={section.text}
                        onChange={(e) => updateContentSection(section.id, { text: e.target.value })}
                      />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm"
                          placeholder="Image URL..."
                          value={section.image}
                          onChange={(e) => updateContentSection(section.id, { image: e.target.value })}
                        />
                        <label className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-2">
                          <UploadCloud size={14} />
                          {uploadingContentFor === section.id ? "Uploading..." : "Upload Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleContentImageUpload(section.id, e)}
                            disabled={uploadingContentFor === section.id}
                          />
                        </label>
                      </div>
                      <input
                        className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm"
                        placeholder="Caption (optional)..."
                        value={section.caption}
                        onChange={(e) => updateContentSection(section.id, { caption: e.target.value })}
                      />
                      {section.image && (
                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <Image src={section.image} alt={section.caption || "content image"} fill className="object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-pink-50 shadow-xl shadow-pink-100/20">
            <h2 className="text-xl font-black text-pink-900 mb-8 flex items-center gap-3">
              <div className="bg-pink-100 p-2.5 rounded-2xl text-pink-600 shadow-inner">
                <Package size={20} />
              </div>
              Custom Options
            </h2>
            <div className="space-y-6">
              {specs.map((spec, sIdx) => (
                <div key={sIdx} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                  <div className="flex justify-between mb-4">
                    <span className="font-black text-pink-900 text-sm tracking-widest">{spec.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecGroup(sIdx)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {spec.values.map((v, vIdx) => (
                      <span
                        key={vIdx}
                        className="bg-white border-2 border-pink-100 px-4 py-1.5 rounded-xl text-sm font-bold text-pink-700 flex items-center gap-2 shadow-sm"
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => removeSpecValue(sIdx, vIdx)}
                          className="text-slate-300 hover:text-pink-500"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-4 py-2 border-2 border-white rounded-xl outline-none focus:border-pink-300"
                      placeholder="Add value..."
                      value={tempInput[sIdx] || ""}
                      onChange={(e) => setTempInput({ ...tempInput, [sIdx]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSpecValue(sIdx, tempInput[sIdx]);
                          setTempInput({ ...tempInput, [sIdx]: "" });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addSpecValue(sIdx, tempInput[sIdx]);
                        setTempInput({ ...tempInput, [sIdx]: "" });
                      }}
                      className="bg-pink-600 text-white px-4 rounded-xl font-bold"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 bg-pink-50/50 p-4 rounded-3xl">
                <input
                  className="flex-1 bg-white border-2 border-pink-100 px-6 py-3 rounded-2xl outline-none"
                  placeholder="Variant name (e.g. Size)"
                  value={currentSpecName}
                  onChange={(e) => setCurrentSpecName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addSpecGroup}
                  className="bg-pink-600 text-white px-6 rounded-2xl font-black"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-8 rounded-[2rem] border-2 border-indigo-50 shadow-xl shadow-indigo-100/20">
            <h2 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-3">
              <div className="bg-indigo-100 p-2.5 rounded-2xl text-indigo-600 shadow-inner">
                <Truck size={20} />
              </div>
              Shipping Methods
            </h2>

            <div className="space-y-4">
              <label className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.freeShippingEnabled ? "border-indigo-500 bg-indigo-50/50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={formData.freeShippingEnabled ? "text-indigo-600" : "text-slate-300"} />
                    <span className={`font-black text-sm ${formData.freeShippingEnabled ? "text-indigo-900" : "text-slate-500"}`}>FREE SHIPPING</span>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.freeShippingEnabled} onChange={(e) => setFormData({ ...formData, freeShippingEnabled: e.target.checked })} />
                </div>
                {formData.freeShippingEnabled && (
                  <div className="flex flex-col gap-3 mt-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input type="number" step="0.001" className="w-full pl-8 pr-4 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500" placeholder="Price..." value={formData.freeShippingPrice} onChange={(e) => setFormData({ ...formData, freeShippingPrice: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Delivery Days:</span>
                      <input type="number" min="0" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-indigo-500" value={formData.freeShippingMinDeliveryDays} onChange={(e) => setFormData({ ...formData, freeShippingMinDeliveryDays: toSafeInt(e.target.value, 0) })} />
                      <span className="text-sm text-slate-500">to</span>
                      <input type="number" min="0" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-indigo-500" value={formData.freeShippingMaxDeliveryDays} onChange={(e) => setFormData({ ...formData, freeShippingMaxDeliveryDays: toSafeInt(e.target.value, 0) })} />
                    </div>
                  </div>
                )}
              </label>

              <label className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.fastShippingEnabled ? "border-amber-500 bg-amber-50/50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Zap size={20} className={formData.fastShippingEnabled ? "text-amber-500" : "text-slate-300"} />
                    <span className={`font-black text-sm ${formData.fastShippingEnabled ? "text-amber-900" : "text-slate-500"}`}>FAST SHIPPING</span>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.fastShippingEnabled} onChange={(e) => setFormData({ ...formData, fastShippingEnabled: e.target.checked })} />
                </div>
                {formData.fastShippingEnabled && (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input type="number" step="0.001" className="w-full pl-8 pr-4 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-amber-500" placeholder="Price..." value={formData.fastShippingPrice} onChange={(e) => setFormData({ ...formData, fastShippingPrice: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Delivery Days:</span>
                      <input type="number" min="0" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-amber-500" value={formData.fastShippingMinDeliveryDays} onChange={(e) => setFormData({ ...formData, fastShippingMinDeliveryDays: toSafeInt(e.target.value, 0) })} />
                      <span className="text-sm text-slate-500">to</span>
                      <input type="number" min="0" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-amber-500" value={formData.fastShippingMaxDeliveryDays} onChange={(e) => setFormData({ ...formData, fastShippingMaxDeliveryDays: toSafeInt(e.target.value, 0) })} />
                    </div>
                  </div>
                )}
              </label>

              <label className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.superFastShippingEnabled ? "border-violet-500 bg-violet-50/50" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Rocket size={20} className={formData.superFastShippingEnabled ? "text-violet-500" : "text-slate-300"} />
                    <span className={`font-black text-sm ${formData.superFastShippingEnabled ? "text-violet-900" : "text-slate-500"}`}>SUPER FAST SHIPPING</span>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.superFastShippingEnabled} onChange={(e) => setFormData({ ...formData, superFastShippingEnabled: e.target.checked })} />
                </div>
                {formData.superFastShippingEnabled && (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input type="number" step="0.001" className="w-full pl-8 pr-4 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-violet-500" placeholder="Price..." value={formData.superFastPrice} onChange={(e) => setFormData({ ...formData, superFastPrice: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Delivery Days:</span>
                      <input type="number" min="0" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-violet-500" value={formData.superFastMinDeliveryDays} onChange={(e) => setFormData({ ...formData, superFastMinDeliveryDays: toSafeInt(e.target.value, 0) })} />
                      <span className="text-sm text-slate-500">to</span>
                      <input type="number" min="0" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-violet-500" value={formData.superFastMaxDeliveryDays} onChange={(e) => setFormData({ ...formData, superFastMaxDeliveryDays: toSafeInt(e.target.value, 0) })} />
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-amber-50 shadow-xl shadow-amber-100/20">
            <h2 className="text-xl font-black text-amber-900 mb-6 flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-600 shadow-inner"><LinkIcon size={20} /></div>
              Pricing
            </h2>
            <div className="space-y-4">
              <div><label className="text-xs font-black text-amber-900 ml-1">BASE PRICE</label><input required type="number" step="0.001" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-400 font-black text-xl" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div>
              <div><label className="text-xs font-black text-slate-400 ml-1">OLD PRICE (SALE)</label><input type="number" step="0.001" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-400 text-slate-400 line-through" placeholder="0.00" value={formData.oldPrice} onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })} /></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-50 shadow-xl shadow-emerald-100/20">
            <h2 className="text-lg font-black text-emerald-900 mb-6">Category</h2>
            <select required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none appearance-none font-bold" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
              <option value="">Select Category...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-cyan-50 shadow-xl shadow-cyan-100/20">
            <div className="space-y-3">
              {[
                { label: "IN STOCK", key: "inStock", color: "bg-green-500" },
                { label: "NEW BADGE", key: "isNew", color: "bg-blue-600" },
                { label: "BEST SELLER", key: "isBestSeller", color: "bg-orange-500" },
              ].map((b) => (
                <label key={b.key} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                  <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${formData[b.key as keyof typeof formData] ? b.color : "bg-slate-200"}`}></div><span className="font-black text-xs text-slate-600">{b.label}</span></div>
                  <input type="checkbox" className="w-5 h-5 accent-black" checked={formData[b.key as keyof typeof formData] as boolean} onChange={(e) => setFormData({ ...formData, [b.key]: e.target.checked })} />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
