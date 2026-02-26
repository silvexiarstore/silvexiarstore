"use client";

import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { CartSpec } from "@/store/cart";

function getSpecValue(specs: CartSpec[] | undefined, name: string): string | number | undefined {
  return specs?.find((spec) => spec.name === name)?.value;
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    toggleCart,
    removeItem,
    updateQuantity,
    getCartTotal,
  } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white border-l border-[var(--border)] shadow-[var(--shadow-xl)] z-[70] transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary-soft)] flex items-center justify-center">
                <ShoppingBag size={16} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={toggleCart}
              className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-all duration-200"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--bg-base)] flex items-center justify-center">
                  <Package size={28} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Start shopping to add items
                  </p>
                </div>
                <button
                  onClick={toggleCart}
                  className="px-6 py-2.5 rounded-[var(--radius-lg)] text-xs font-semibold bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-dark)] hover:scale-[1.02] hover:shadow-[var(--shadow-md)] transition-all duration-200"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-base)] border border-[var(--border)]"
                  >
                    {/* Image */}
                    <div className="relative h-20 w-20 rounded-[var(--radius-md)] overflow-hidden bg-white shrink-0 border border-[var(--border)]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                      <div>
                        <h3 className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                          {item.title}
                        </h3>
                        {getSpecValue(item.specs, "Shipping") && (
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {String(getSpecValue(item.specs, "Shipping")).replace("_", " ")}{" "}
                            -{" "}
                            {(() => {
                              const shippingCost = Number(getSpecValue(item.specs, "Shipping Cost")) || 0;
                              return shippingCost > 0
                                ? formatMoney(shippingCost)
                                : "Free";
                            })()}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[var(--color-primary)] mt-1">
                          {formatMoney(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-white rounded-[var(--radius-md)] border border-[var(--border)] p-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-150"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-7 text-center text-[11px] font-semibold text-[var(--text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-150"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-5 py-4 border-t border-[var(--border)] bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[var(--text-secondary)]">
                    {formatMoney(getCartTotal())}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Shipping</span>
                  <span className="text-[var(--color-primary)] font-medium">
                    Included
                  </span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[var(--color-primary)]">
                    {formatMoney(getCartTotal())}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={toggleCart}
                className="flex items-center justify-center gap-2 w-full bg-[var(--color-accent)] text-white py-3.5 rounded-[var(--radius-lg)] font-semibold text-sm shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-dark)] hover:scale-[1.01] hover:shadow-[var(--shadow-md)] transition-all duration-200 animate-sheen"
              >
                Checkout <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
