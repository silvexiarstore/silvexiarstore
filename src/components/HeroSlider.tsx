"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop",
    tag: "Spring Collection",
    title: "Earthy Elegance",
    subtitle:
      "Discover organic textures and warm tones designed for mindful living.",
    link: "/shop",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=2000&auto=format&fit=crop",
    tag: "Minimalist Space",
    title: "Curated Comfort",
    subtitle:
      "Transform your surroundings with pieces that speak volumes through silence.",
    link: "/shop",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    tag: "Essential Wardrobe",
    title: "Timeless Form",
    subtitle:
      "Sartorial staples built to outlast trends and elevate your everyday.",
    link: "/shop",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  // Autoplay with hover pause
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext, isHovered]);

  const imageVariants = {
    enter: { opacity: 0, scale: 1.05 },
    center: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.8 } },
  } as const;

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section 
      className="relative w-full h-[75vh] md:h-[90vh] overflow-hidden bg-stone-100 font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Full-Bleed Background Images */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={SLIDES[current].id}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[current].image}
            alt={SLIDES[current].title}
            fill
            className="object-cover object-center"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. Texture & Gradient Overlays */}
      {/* Dark vignette for text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* 3. Floating Glassmorphic Content Card */}
      <div className="absolute inset-0 flex items-end md:items-center px-6 md:px-16 lg:px-24 pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={SLIDES[current].id}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            className="w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white/40 p-8 md:p-12 rounded-3xl shadow-2xl shadow-black/10"
          >
            {/* Tag */}
            <motion.div variants={textVariants} className="mb-4">
              <span className="text-amber-700 text-sm font-semibold tracking-widest uppercase">
                {SLIDES[current].tag}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={textVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-light text-stone-900 mb-4 leading-tight"
            >
              {SLIDES[current].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={textVariants}
              className="text-stone-600 text-lg md:text-xl mb-8 leading-relaxed font-light"
            >
              {SLIDES[current].subtitle}
            </motion.p>

            {/* CTA & Controls Container */}
            <motion.div variants={textVariants} className="flex flex-wrap items-center justify-between gap-6">
              <Link
                href={SLIDES[current].link}
                className="group flex items-center gap-3 px-7 py-3.5 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors duration-300"
              >
                <span className="font-medium">Explore Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Integrated Arrow Controls */}
              <div className="flex gap-2">
                <button
                  onClick={goPrev}
                  className="p-3 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="p-3 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Minimalist Progress Dots (Bottom Right) */}
      <div className="absolute bottom-8 right-8 md:right-16 flex items-center gap-3 z-20">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(index)}
            className="group py-4 px-1"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={`h-0.5 transition-all duration-500 rounded-full ${
                index === current
                  ? "w-10 bg-white"
                  : "w-4 bg-white/40 group-hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}