"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Tag,
  CircleDollarSign,
  SortAsc,
  SortDesc,
  Clock,
  ChevronRight,
  Truck,
  Gauge,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("min") || "",
    max: searchParams.get("max") || "",
  });
  const [shippingPriceRange, setShippingPriceRange] = useState({
    min: searchParams.get("shipMin") || "",
    max: searchParams.get("shipMax") || "",
  });
  const [deliveryRange, setDeliveryRange] = useState({
    min: searchParams.get("deliveryMin") || "",
    max: searchParams.get("deliveryMax") || "",
  });

  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "latest";
  const activeShipping = searchParams.get("shipping") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  };

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange.min) params.set("min", priceRange.min);
    else params.delete("min");
    if (priceRange.max) params.set("max", priceRange.max);
    else params.delete("max");
    router.push(`/shop?${params.toString()}`);
  };

  const handleShippingApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (shippingPriceRange.min) params.set("shipMin", shippingPriceRange.min);
    else params.delete("shipMin");
    if (shippingPriceRange.max) params.set("shipMax", shippingPriceRange.max);
    else params.delete("shipMax");
    if (deliveryRange.min) params.set("deliveryMin", deliveryRange.min);
    else params.delete("deliveryMin");
    if (deliveryRange.max) params.set("deliveryMax", deliveryRange.max);
    else params.delete("deliveryMax");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-4 text-[#1CA7A6] font-bold text-[10px] uppercase tracking-widest font-display">
          <SortAsc size={16} /> <span>Order By</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: "latest", label: "Newest", icon: Clock },
            { id: "price_asc", label: "Price: Low to High", icon: SortAsc },
            { id: "price_desc", label: "Price: High to Low", icon: SortDesc },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateFilter("sort", opt.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border font-display ${
                activeSort === opt.id
                  ? "bg-[#1CA7A6] text-white border-[#1CA7A6] shadow-md"
                  : "bg-white/80 text-[#6B7280] border-[#E8F6F6] hover:border-[#1CA7A6]/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <opt.icon size={14} />
                {opt.label}
              </div>
              {activeSort === opt.id && <motion.div layoutId="sort-dot" className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-4 text-[#F2994A] font-bold text-[10px] uppercase tracking-widest font-display">
          <Tag size={16} /> <span>Collections</span>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => updateFilter("category", "")}
            className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all font-display ${
              !activeCategory ? "bg-[#E8F6F6] text-[#1CA7A6]" : "text-[#6B7280] hover:bg-[#FEF3E8]"
            }`}
          >
            <span>All Masterpieces</span>
            <ChevronRight size={14} className={!activeCategory ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category", cat.slug)}
              className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all font-display ${
                activeCategory === cat.slug
                  ? "bg-[#E8F6F6] text-[#1CA7A6]"
                  : "text-[#6B7280] hover:bg-[#FEF3E8]"
              }`}
            >
              <span className="capitalize">{cat.name}</span>
              <ChevronRight
                size={14}
                className={activeCategory === cat.slug ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-all"}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-4 text-[#1CA7A6] font-bold text-[10px] uppercase tracking-widest font-display">
          <Truck size={16} /> <span>Shipping</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: "", label: "All Methods" },
            { id: "FREE", label: "Free Shipping" },
            { id: "FAST", label: "Fast Shipping" },
            { id: "SUPER_FAST", label: "Super Fast Shipping" },
          ].map((opt) => (
            <button
              key={opt.id || "all"}
              onClick={() => updateFilter("shipping", opt.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border font-display ${
                activeShipping === opt.id
                  ? "bg-[#F2994A] text-white border-[#F2994A] shadow-md"
                  : "bg-white/80 text-[#6B7280] border-[#E8F6F6] hover:border-[#F2994A]/40"
              }`}
            >
              <span>{opt.label}</span>
              {activeShipping === opt.id && <motion.div layoutId="shipping-dot" className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {activeShipping && (
        <div className="animate-pop">
          <div className="flex items-center gap-2 mb-4 text-[#F2994A] font-bold text-[10px] uppercase tracking-widest font-display">
            <Gauge size={16} /> <span>Shipping Price & Days</span>
          </div>
          <div className="bg-white/75 p-4 rounded-[2rem] border border-[#F2994A]/30 space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Shipping Price</p>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-[10px] font-bold text-[var(--text-muted)]">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full bg-white border border-[#F2994A]/30 rounded-xl py-2.5 pl-6 pr-2 text-xs font-bold outline-none focus:border-[#F2994A]"
                    value={shippingPriceRange.min}
                    onChange={(e) => setShippingPriceRange({ ...shippingPriceRange, min: e.target.value })}
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-[10px] font-bold text-[var(--text-muted)]">$</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full bg-white border border-[#F2994A]/30 rounded-xl py-2.5 pl-6 pr-2 text-xs font-bold outline-none focus:border-[#F2994A]"
                    value={shippingPriceRange.max}
                    onChange={(e) => setShippingPriceRange({ ...shippingPriceRange, max: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Delivery Days</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="From"
                  className="w-full bg-white border border-[#F2994A]/30 rounded-xl py-2.5 px-3 text-xs font-bold outline-none focus:border-[#F2994A]"
                  value={deliveryRange.min}
                  onChange={(e) => setDeliveryRange({ ...deliveryRange, min: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="To"
                  className="w-full bg-white border border-[#F2994A]/30 rounded-xl py-2.5 px-3 text-xs font-bold outline-none focus:border-[#F2994A]"
                  value={deliveryRange.max}
                  onChange={(e) => setDeliveryRange({ ...deliveryRange, max: e.target.value })}
                />
              </div>
            </div>
            <button
              onClick={handleShippingApply}
              className="w-full bg-gradient-to-r from-[#1CA7A6] to-[#F2994A] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:brightness-95 transition-all shadow-md active:scale-95 font-display"
            >
              Apply Shipping Filter
            </button>
          </div>
        </div>
      )}

      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-4 text-[#10B981] font-bold text-[10px] uppercase tracking-widest font-display">
          <CircleDollarSign size={16} /> <span>Price Budget</span>
        </div>
        <div className="bg-white/75 p-4 rounded-[2rem] border border-[#10B981]/30">
          <div className="flex gap-2 items-center mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-[10px] font-bold text-[var(--text-muted)]">$</span>
              <input
                type="number"
                placeholder="Min"
                className="w-full bg-white border border-[#10B981]/30 rounded-xl py-2.5 pl-6 pr-2 text-xs font-bold outline-none focus:border-[#10B981]"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-[10px] font-bold text-[var(--text-muted)]">$</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full bg-white border border-[#10B981]/30 rounded-xl py-2.5 pl-6 pr-2 text-xs font-bold outline-none focus:border-[#10B981]"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div>
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full bg-gradient-to-r from-[#1CA7A6] to-[#10B981] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:brightness-95 transition-all shadow-md active:scale-95 font-display"
          >
            Filter Results
          </button>
        </div>
      </div>

      {(activeCategory ||
        activeSort !== "latest" ||
        priceRange.min ||
        priceRange.max ||
        activeShipping ||
        shippingPriceRange.min ||
        shippingPriceRange.max ||
        deliveryRange.min ||
        deliveryRange.max) && (
        <button
          onClick={() => {
            setPriceRange({ min: "", max: "" });
            setShippingPriceRange({ min: "", max: "" });
            setDeliveryRange({ min: "", max: "" });
            router.push("/shop");
          }}
          className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-[#EF4444] hover:bg-[#FEE2E2] rounded-2xl transition-all border border-transparent hover:border-[#EF4444]/25 font-display"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
