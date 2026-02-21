// src\components\ReviewForm.tsx
"use client";
import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Select rating");
    setLoading(true);
    // تواصل مع API لإرسال التقييم
    const res = await fetch("/api/user/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // 👈 تأكد من هاد السطر
      body: JSON.stringify({
        productId: productId,
        rating: rating,
        comment: comment,
      }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.error || "Failed to submit review");
      setLoading(false);
      return;
    }
    
    window.location.reload();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6"
    >
      <h3 className="text-xl font-serif italic">Share Your Experience</h3>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            className="transition-transform active:scale-90"
          >
            <Star
              size={24}
              className={
                rating >= s ? "text-amber-500 fill-amber-500" : "text-gray-700"
              }
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder="How would you describe this masterpiece?"
        className="w-full bg-gray-900 border-none p-5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-amber-500/50 h-32"
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        disabled={loading}
        className="w-full bg-white text-black py-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 hover:text-white transition-all"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <Send size={14} /> Submit Testimony
          </>
        )}
      </button>
    </form>
  );
}
