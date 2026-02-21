"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Search } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const safeImages = useMemo(() => (images.length > 0 ? images : []), [images]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoverOrigin, setHoverOrigin] = useState({ x: 50, y: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState(1);

  if (safeImages.length === 0) {
    return (
      <div className="aspect-[4/5] rounded-[3rem] bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold">
        No image
      </div>
    );
  }

  const activeImage = safeImages[selectedIndex];

  const onMainMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setHoverOrigin({ x, y });
  };

  return (
    <div className="space-y-5">
      <div
        className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-slate-100 cursor-zoom-in group"
        onMouseMove={onMainMouseMove}
        onClick={() => {
          setModalZoom(1.4);
          setIsModalOpen(true);
        }}
      >
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          unoptimized
          className="object-cover transition-transform duration-200 group-hover:scale-[1.65]"
          style={{ transformOrigin: `${hoverOrigin.x}% ${hoverOrigin.y}%` }}
        />
        <div className="absolute bottom-5 right-5 bg-black/70 text-white rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
          <Search size={12} />
          Zoom
        </div>
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative w-24 h-28 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                selectedIndex === i ? "border-amber-600 scale-105" : "border-white hover:border-amber-200"
              }`}
            >
              <Image src={img} alt={`${title} thumbnail ${i + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm p-4 md:p-8">
          <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-10 relative bg-black/40 rounded-3xl overflow-hidden flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 bg-white/90 text-black rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest"
              >
                Close
              </button>
              <div className="relative w-full h-full min-h-[60vh]">
                <Image
                  src={activeImage}
                  alt={`${title} zoom`}
                  fill
                  unoptimized
                  className="object-contain transition-transform duration-200"
                  style={{ transform: `scale(${modalZoom})` }}
                />
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalZoom((v) => Math.max(1, Number((v - 0.2).toFixed(2))))}
                  className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center"
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setModalZoom((v) => Math.min(4, Number((v + 0.2).toFixed(2))))}
                  className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white/5 rounded-3xl p-4 overflow-y-auto">
              <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">Photos</p>
              <div className="space-y-3">
                {safeImages.map((img, i) => (
                  <button
                    key={`zoom-${img}-${i}`}
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 ${
                      selectedIndex === i ? "border-amber-500" : "border-white/20"
                    }`}
                  >
                    <Image src={img} alt={`${title} preview ${i + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

