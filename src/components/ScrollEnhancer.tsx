"use client";

import { useEffect } from "react";

export default function ScrollEnhancer() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (revealTargets.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
      );

      revealTargets.forEach((target) => observer.observe(target));
      return () => observer.disconnect();
    }

    if (reduceMotion) return;
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parallaxTarget = document.querySelector<HTMLElement>("[data-hero-parallax]");
    if (!parallaxTarget) return;

    let ticking = false;
    const updateOffset = () => {
      const heroTop = parallaxTarget.getBoundingClientRect().top + window.scrollY;
      const progress = Math.max(0, window.scrollY - heroTop);
      const y = Math.min(progress * 0.16, 70);
      parallaxTarget.style.setProperty("--hero-offset", `${y}px`);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateOffset);
        ticking = true;
      }
    };

    updateOffset();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
