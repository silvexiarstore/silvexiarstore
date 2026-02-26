"use client";

import { motion } from "framer-motion";

export default function HomeIntroLogo() {
  return (
    <section className="relative h-[42vh] md:h-[50vh] min-h-[300px] md:min-h-[380px] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(28,167,166,0.22),transparent_55%),linear-gradient(135deg,#072B2B_0%,#0F3D3D_55%,#145D5D_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.10),transparent_40%)]" />
      <div className="relative h-full w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.9, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-[var(--color-primary)] shadow-[0_22px_70px_rgba(28,167,166,0.42)] flex items-center justify-center"
          >
            <span className="text-white font-black text-3xl md:text-4xl">S</span>
          </motion.div>
          <p className="text-sm md:text-base font-black tracking-[0.42em] text-white">
            SILVEXIAR
          </p>
        </motion.div>
      </div>
    </section>
  );
}
