// src\components\AddToCartButton.tsx
"use client";

import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { ShoppingBag, ArrowRight, CheckCircle2, X, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoney } from "@/lib/money";

interface ProductProps {
  id: string;
  title: string;
  price: number;
  image: string;
  specs?: any[];
}

export default function AddToCartButton({ product }: { product: ProductProps }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSelectOption = (specName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [specName]: value }));
    setError("");
  };

  const handleAddToCart = () => {
    // Use pre-selected values from product.specs if available, otherwise use local state
    const optionsToUse = product.specs && product.specs.length > 0
      ? product.specs.reduce((acc, spec) => {
          if (spec.value) {
            acc[spec.name] = spec.value;
          }
          return acc;
        }, {} as Record<string, string>)
      : selectedOptions;

    if (product.specs && product.specs.length > 0) {
      const missingOptions = product.specs.filter(spec => !optionsToUse[spec.name]);
      if (missingOptions.length > 0) {
        setError(`Please select ${missingOptions[0].name}`);
        toast.error(`Selection required: ${missingOptions[0].name}`);
        return;
      }
    }

    const variantTitle = Object.values(optionsToUse).join(" / ");
    const finalTitle = variantTitle ? `${product.title} (${variantTitle})` : product.title;

    // Use optionsToUse for cart item ID
    const optionsForId = Object.values(optionsToUse).sort().join("-");
    // Convert optionsToUse to specs array format
    const specsArray = Object.entries(optionsToUse).map(([name, value]) => ({ name, value }));
    addItem({
      id: `${product.id}-${optionsForId}`,
      productId: product.id,
      title: finalTitle,
      price: product.price,
      image: product.image,
      quantity: 1,
      specs: specsArray, // Store the selected options (shipping, color, etc.)
    });

    // setShowModal(true); // Removed: No popup on add to bag
  };

  // Removed modalContent and popup logic

  return (
    <div className="space-y-8">
      

      {error && <p className="text-rose-600 text-sm font-semibold text-center lg:text-left">⚠️ {error}</p>}

      <button
        onClick={handleAddToCart}
        className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl active:scale-98 flex items-center justify-center gap-3"
      >
        <ShoppingBag size={20} />
        Add to Bag - {formatMoney(product.price)}
      </button>

      {/* Popup removed: nothing rendered here */}
    </div>
  );
}
