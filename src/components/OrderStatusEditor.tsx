"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Truck,
  Package,
  Clock,
  XCircle,
  CreditCard,
  Ban,
  Loader2,
} from "lucide-react";

type OrderStatusValue = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type PaymentStatusValue = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";
type IconType = typeof Clock;

type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon: IconType;
  color: string;
};

const STATUS_OPTIONS: SelectOption<OrderStatusValue>[] = [
  { value: "PENDING", label: "Pending", icon: Clock, color: "text-gray-500 bg-gray-50" },
  { value: "PROCESSING", label: "Processing", icon: Loader2, color: "text-blue-500 bg-blue-50" },
  { value: "SHIPPED", label: "Shipped", icon: Truck, color: "text-purple-600 bg-purple-50" },
  { value: "DELIVERED", label: "Delivered", icon: Package, color: "text-green-600 bg-green-50" },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-50" },
];

const PAYMENT_OPTIONS: SelectOption<PaymentStatusValue>[] = [
  { value: "UNPAID", label: "Unpaid", icon: Ban, color: "text-amber-600 bg-amber-50" },
  { value: "PAID", label: "Paid", icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
  { value: "REFUNDED", label: "Refunded", icon: XCircle, color: "text-gray-600 bg-gray-50" },
  { value: "FAILED", label: "Failed", icon: XCircle, color: "text-rose-600 bg-rose-50" },
];

function CustomSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (val: T) => void;
  options: SelectOption<T>[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const Icon = selectedOption.icon;

  return (
    <div className="relative w-full md:w-48" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md ${selectedOption.color}`}>
            <Icon size={16} />
          </div>
          <span className="text-sm font-medium text-gray-700">{selectedOption.label}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => {
            const OptIcon = option.icon;
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isSelected ? "bg-gray-50 text-black font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className={`p-1 rounded-md ${option.color}`}>
                  <OptIcon size={16} />
                </div>
                {option.label}
                {isSelected && <Check size={14} className="ml-auto text-black" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface EditableOrder {
  id: string;
  status: OrderStatusValue;
  paymentStatus: PaymentStatusValue;
}

export default function OrderStatusEditor({ order }: { order: EditableOrder }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatusValue>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>(order.paymentStatus);

  const handleUpdate = async () => {
    setLoading(true);
    const toastId = toast.loading("Updating order...");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status,
          paymentStatus,
        }),
      });

      if (res.ok) {
        toast.success("Order updated successfully!", { id: toastId });
        router.refresh();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to update order", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row gap-3">
        <CustomSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <CustomSelect value={paymentStatus} onChange={setPaymentStatus} options={PAYMENT_OPTIONS} />
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-slate-900 text-white text-sm py-2.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : (
          "Update Status"
        )}
      </button>
    </div>
  );
}
