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
          className="object-contain p-4 transition-transform duration-200 group-hover:scale-[1.65]"
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
            <div className="lg:col-span-10 relative bg-[#0a0a0a] rounded-3xl flex flex-col items-center border border-white/10 shadow-2xl">
              <div className="w-full flex justify-between items-center p-4 z-50 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 rounded-t-3xl">
                 <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalZoom((v) => Math.max(1, Number((v - 0.2).toFixed(2))))}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                  >
                    <Minus size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalZoom((v) => Math.min(4, Number((v + 0.2).toFixed(2))))}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white/90 text-black rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors shadow-lg"
                >
                  Close
                </button>
              </div>

              <div className="w-full h-[70vh] md:h-[85vh] overflow-auto custom-scrollbar flex items-start justify-center pt-20 pb-10">
                <Image
                  src={activeImage}
                  alt={`${title} zoom`}
                  width={3000}
                  height={3000}
                  unoptimized
                  className="transition-all duration-200 object-contain"
                  style={{ 
                    width: `${modalZoom * 100}%`, 
                    height: 'auto',
                    maxWidth: 'none'
                  }}
                />
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

