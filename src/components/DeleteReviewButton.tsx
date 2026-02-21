"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh(); // تحديث الصفحة لرؤية النتائج
      } else {
        alert("Failed to delete review.");
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-5 bg-red-50 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-sm group"
    >
      {loading ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}