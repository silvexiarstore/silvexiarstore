"use client";

import { useMemo, useState } from "react";
import { Gift, Zap, CheckCircle2, Rocket } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { formatMoney } from "@/lib/money";

type ShippingMethod = "FREE" | "FAST" | "SUPER_FAST";
type VariantOption = { name: string; values: string[] };
type ProductActionProduct = {
  id: string;
  title: string;
  price: number | string;
  images: string[];
  specifications: unknown;
  freeShippingEnabled: boolean;
  freeShippingPrice: number | string | null;
  freeShippingMinDeliveryDays: number | null;
  freeShippingMaxDeliveryDays: number | null;
  fastShippingEnabled: boolean;
  fastShippingPrice: number | string | null;
  fastShippingMinDeliveryDays: number | null;
  fastShippingMaxDeliveryDays: number | null;
  superFastShippingEnabled: boolean;
  superFastPrice: number | string | null;
  superFastMinDeliveryDays: number | null;
  superFastMaxDeliveryDays: number | null;
};

function extractVariantOptions(specifications: unknown): VariantOption[] {
  if (Array.isArray(specifications)) {
    return specifications as VariantOption[];
  }

  if (
    specifications &&
    typeof specifications === "object" &&
    "variantOptions" in specifications &&
    Array.isArray((specifications as { variantOptions?: unknown }).variantOptions)
  ) {
    return (specifications as { variantOptions: VariantOption[] }).variantOptions;
  }

  return [];
}

export default function ProductActions({ product }: { product: ProductActionProduct }) {
  const shippingOptions = useMemo(
    () =>
      [
        product.freeShippingEnabled
          ? {
              method: "FREE" as ShippingMethod,
              label: "Free Shipping",
              price: Number(product.freeShippingPrice) || 0,
              minDays: product.freeShippingMinDeliveryDays,
              maxDays: product.freeShippingMaxDeliveryDays,
            }
          : null,
        product.fastShippingEnabled
          ? {
              method: "FAST" as ShippingMethod,
              label: "Fast Shipping",
              price: Number(product.fastShippingPrice) || 0,
              minDays: product.fastShippingMinDeliveryDays,
              maxDays: product.fastShippingMaxDeliveryDays,
            }
          : null,
        product.superFastShippingEnabled
          ? {
              method: "SUPER_FAST" as ShippingMethod,
              label: "Super Fast Shipping",
              price: Number(product.superFastPrice) || 0,
              minDays: product.superFastMinDeliveryDays,
              maxDays: product.superFastMaxDeliveryDays,
            }
          : null,
      ].filter(Boolean) as Array<{
        method: ShippingMethod;
        label: string;
        price: number;
        minDays: number | null;
        maxDays: number | null;
      }>,
    [product],
  );

  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(
    shippingOptions[0]?.method ?? "FREE",
  );

  const specs = extractVariantOptions(product.specifications);
  const colors = specs?.find((s) => s.name.toLowerCase() === "color")?.values || [];
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");

  const selectedShippingOption =
    shippingOptions.find((option) => option.method === selectedShipping) ?? shippingOptions[0];
  const finalPrice = Number(product.price) + Number(selectedShippingOption?.price || 0);

  const shippingIcon = (method: ShippingMethod, active: boolean) => {
    if (method === "FREE") return <Gift className={active ? "text-emerald-600" : "text-gray-300"} size={22} />;
    if (method === "FAST") return <Zap className={active ? "text-purple-600" : "text-gray-300"} size={22} />;
    return <Rocket className={active ? "text-rose-600" : "text-gray-300"} size={22} />;
  };

  return (
    <div className="space-y-10">
      {shippingOptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-800">
            Selected Shipping: <span className="text-gray-900">{selectedShipping.replace("_", " ")}</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {shippingOptions.map((option) => {
              const active = selectedShipping === option.method;
              return (
                <button
                  key={option.method}
                  type="button"
                  onClick={() => setSelectedShipping(option.method)}
                  className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                    active
                      ? "border-amber-500 bg-amber-50/40 shadow-[0_0_20px_rgba(180,83,9,0.08)]"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    {shippingIcon(option.method, active)}
                    <div className="text-left">
                      <p className="text-sm font-black uppercase tracking-widest text-gray-900">{option.label}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                        {option.price > 0 ? `+ ${formatMoney(option.price)}` : "Complimentary"}
                        {option.minDays != null && option.maxDays != null
                          ? ` - ${option.minDays}-${option.maxDays} days`
                          : ""}
                      </p>
                    </div>
                  </div>
                  {active && <CheckCircle2 size={20} className="text-amber-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-800">
            Selected Color: <span className="text-gray-900">{selectedColor || "None"}</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color: string) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`px-8 py-4 rounded-2xl border-2 uppercase text-[10px] font-black tracking-widest transition-all duration-500 ${
                  selectedColor === color
                    ? "bg-black text-white border-black shadow-xl"
                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-10 border-t border-gray-100">
        <AddToCartButton
          product={{
            id: product.id,
            title: product.title,
            price: finalPrice,
            image: product.images[0],
            specs: [
              { name: "Shipping", value: selectedShipping },
              ...(selectedShippingOption
                ? [
                    { name: "Shipping Cost", value: String(selectedShippingOption.price) },
                    { name: "Min Delivery Days", value: String(selectedShippingOption.minDays ?? "") },
                    { name: "Max Delivery Days", value: String(selectedShippingOption.maxDays ?? "") },
                  ]
                : []),
              ...(selectedColor ? [{ name: "Color", value: selectedColor }] : []),
            ],
          }}
        />
      </div>
    </div>
  );
}
