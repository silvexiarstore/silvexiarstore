"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlideItem {
  id: string;
  badge?: string | null;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage: string;
  desktopImages?: string[];
  mobileImages?: string[];
  showText?: boolean;
  frameBadges?: string[];
  frameTitles?: string[];
  frameSubtitles?: string[];
  frameShowText?: boolean[];
}

interface HeroFrame {
  id: string;
  badge?: string | null;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage: string;
  showText: boolean;
}

interface HeroSliderProps {
  slides: HeroSlideItem[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const frames = useMemo<HeroFrame[]>(() => {
    const list: HeroFrame[] = [];

    for (const slide of slides) {
      const desktops = Array.isArray(slide.desktopImages) && slide.desktopImages.length > 0
        ? slide.desktopImages
        : slide.desktopImage
          ? [slide.desktopImage]
          : [];
      const mobiles = Array.isArray(slide.mobileImages) && slide.mobileImages.length > 0
        ? slide.mobileImages
        : slide.mobileImage
          ? [slide.mobileImage]
          : [];

      const count = Math.max(desktops.length, mobiles.length);
      for (let i = 0; i < count; i += 1) {
        const desktop = desktops[i] || desktops[0] || "";
        const mobile = mobiles[i] || mobiles[0] || desktop;
        if (!desktop || !mobile) continue;
        list.push({
          id: `${slide.id}-${i}`,
          ctaLabel: slide.ctaLabel,
          ctaLink: slide.ctaLink,
          desktopImage: desktop,
          mobileImage: mobile,
          badge: (slide.frameBadges && slide.frameBadges[i]) || slide.badge,
          title: (slide.frameTitles && slide.frameTitles[i]) || slide.title,
          subtitle: (slide.frameSubtitles && slide.frameSubtitles[i]) || slide.subtitle,
          showText: Array.isArray(slide.frameShowText) && typeof slide.frameShowText[i] === "boolean"
            ? Boolean(slide.frameShowText[i])
            : slide.showText !== false,
        });
      }
    }

    return list;
  }, [slides]);

  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [frames.length]);

  const next = useCallback(() => {
    if (frames.length < 2) return;
    setIndex((prev) => (prev + 1) % frames.length);
  }, [frames.length]);

  const prev = useCallback(() => {
    if (frames.length < 2) return;
    setIndex((prev) => (prev === 0 ? frames.length - 1 : prev - 1));
  }, [frames.length]);

  useEffect(() => {
    if (pause || frames.length < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [pause, next, frames.length]);

  if (frames.length === 0) {
    return (
      <section className="relative min-h-[70vh] bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60 font-bold mb-4">Silvexiar</p>
          <h1 className="text-4xl md:text-6xl font-black">New Season Drops</h1>
          <p className="text-white/70 mt-4">Add hero slides from Admin Settings.</p>
        </div>
      </section>
    );
  }

  const current = frames[index];

  return (
    <section
      className="relative min-h-[78vh] md:min-h-[92vh] overflow-hidden"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      <div key={current.id} className="absolute inset-0">
        <picture>
          <source media="(max-width: 767px)" srcSet={current.mobileImage} />
          <img src={current.desktopImage} alt={current.title} className="w-full h-full object-cover" />
        </picture>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-[78vh] md:h-[92vh] flex items-end md:items-center pb-16 md:pb-0">
        {current.showText && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current.id}`}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl"
            >
              <div className="rounded-[2rem] bg-slate-900/62 border border-white/35 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
                {current.badge && (
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.28em] font-black text-cyan-100 mb-4">
                    {current.badge}
                  </p>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1] text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                  {current.title}
                </h1>
                <p className="mt-4 text-xs md:text-sm text-slate-100 max-w-lg leading-relaxed">
                  {current.subtitle}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href={current.ctaLink || "/shop"}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 text-slate-900 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-cyan-300 transition-all shadow-[0_15px_40px_rgba(34,211,238,0.45)]"
                  >
                    {current.ctaLabel || "Explore Now"}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {frames.length > 1 && (
        <>
          <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
            <button
              type="button"
              onClick={prev}
              className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/35 transition-all flex items-center justify-center"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/35 transition-all flex items-center justify-center"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {frames.map((frame, i) => (
              <button
                key={frame.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-10 bg-white" : "w-4 bg-white/45 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
