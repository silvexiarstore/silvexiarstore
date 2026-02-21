"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { MotionDiv } from "./MotionDiv";

export default function WishlistButton({ productId }: { productId: string }) {
  const [active, setActive] = useState(false);

  // 1. كنعرفو واش المنتج ديجا ف المفضلة ملي كتحل الصفحة
  useEffect(() => {
    fetch(`/api/user/wishlist?productId=${productId}`)
      .then(res => res.json())
      .then(data => setActive(data.active));
  }, [productId]);

  const toggle = async () => {
    const res = await fetch("/api/user/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId })
    });
    const data = await res.json();
    if (res.ok) setActive(data.active);
    else if (res.status === 401) alert("Please login to use Wishlist");
  };

  return (
    <button onClick={toggle} className="group relative">
      <MotionDiv
        whileTap={{ scale: 0.8 }}
        className={`p-4 rounded-full backdrop-blur-md transition-all duration-500 ${
          active ? 'bg-amber-700 text-white shadow-[0_0_20px_rgba(180,83,9,0.5)]' : 'bg-white/80 text-black hover:bg-black hover:text-white'
        }`}
      >
        <Heart size={24} fill={active ? "currentColor" : "none"} strokeWidth={active ? 0 : 2} />
      </MotionDiv>
    </button>
  );
}