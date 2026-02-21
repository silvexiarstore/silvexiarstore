"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CheckCircle, MapPin, ShoppingBag, CreditCard, ArrowLeft } from "lucide-react";
import { MotionDiv } from "@/components/MotionDiv";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/money";

interface Address {
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  postalCode: string;
}

interface ProductSpec {
  name: string;
  value: string | number;
}

function getReadablePayPalError(err: unknown) {
  if (err instanceof Error && err.message) return err.message;

  if (err && typeof err === "object") {
    const asRecord = err as Record<string, unknown>;
    const details = Array.isArray(asRecord.details) ? asRecord.details[0] : null;
    const detailDescription =
      details && typeof details === "object" ? (details as Record<string, unknown>).description : null;
    const detailIssue =
      details && typeof details === "object" ? (details as Record<string, unknown>).issue : null;

    if (typeof detailDescription === "string" && detailDescription.trim()) {
      if (typeof detailIssue === "string" && detailIssue.trim()) {
        return `${detailDescription} (${detailIssue})`;
      }
      return detailDescription;
    }

    if (typeof asRecord.message === "string" && asRecord.message.trim()) {
      return asRecord.message;
    }
  }

  return "PayPal checkout failed.";
}

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const router = useRouter();
  const rawShippingMethod = (items[0]?.specs as ProductSpec[] | undefined)?.find(
    (spec) => spec.name === "Shipping",
  )?.value;
  const selectedShippingMethod: "FREE" | "FAST" | "SUPER_FAST" =
    rawShippingMethod === "SUPER-FAST"
      ? "SUPER_FAST"
      : ["FREE", "FAST", "SUPER_FAST"].includes(String(rawShippingMethod))
        ? (String(rawShippingMethod) as "FREE" | "FAST" | "SUPER_FAST")
        : "FREE";
  const totalShippingCost = items.reduce((total, item) => {
    const shippingCost =
      Number(
        (item.specs as ProductSpec[] | undefined)?.find(
          (spec) => spec.name === "Shipping Cost",
        )?.value,
      ) || 0;
    return total + shippingCost * item.quantity;
  }, 0);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    fullName: "", email: "", phone: "", country: "", city: "", postalCode: "", addressLine: "",
  });

  useEffect(() => {
    fetch("/api/user/addresses")
      .then(async (res) => {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setIsAddingNew(true);
          setLoading(false);
          return null;
        }
        setIsAuthenticated(true);
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) {
          setAddresses(data);
          if (data.length > 0) setSelectedAddressId(data[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const res = await fetch("/api/user/addresses", {
      method: "POST",
      body: JSON.stringify(newAddress),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const savedAddr = await res.json();
      setAddresses([...addresses, savedAddr]);
      setSelectedAddressId(savedAddr.id);
      setIsAddingNew(false);
      setNewAddress({ fullName: "", email: "", phone: "", country: "", city: "", postalCode: "", addressLine: "" });
    }
  };

  const isGuestCheckout = isAuthenticated === false;
  const guestAddressComplete = Boolean(
    newAddress.fullName &&
      newAddress.email &&
      newAddress.phone &&
      newAddress.country &&
      newAddress.city &&
      newAddress.postalCode &&
      newAddress.addressLine,
  );
  const canPay = isGuestCheckout ? guestAddressComplete : Boolean(selectedAddressId);
  const payableTotal = getCartTotal();
  const subtotal = Math.max(0, payableTotal - totalShippingCost);

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: "USD" }}>
      <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] pb-24 pt-8 font-sans">
        
        {/* Top Header Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
          <Link href="/shop" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#1CA7A6] transition-colors font-display">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <div className="text-center">
            <h2 className="text-[#1CA7A6] text-[10px] font-bold uppercase tracking-[0.35em] font-display">Secure Checkout</h2>
            <h1 className="text-2xl md:text-4xl font-display font-extrabold text-gradient-brand leading-tight">Finalize Order</h1>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
            
            {/* --- LEFT: ADDRESS & LOGISTICS --- */}
            <div className="lg:col-span-7 space-y-8">
              
              <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated bg-white rounded-3xl p-8 border-2 border-[#E8F6F6]"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <MapPin className="text-[#F2994A]" size={24} /> 
                    <span className="font-display font-bold text-2xl text-[#333333]">Shipping Destination</span>
                  </h2>
                  {isAuthenticated && (
                    <button
                      onClick={() => setIsAddingNew(!isAddingNew)}
                      className="bg-[#1CA7A6] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#178E8D] transition-all shadow-lg font-display"
                    >
                      {isAddingNew ? "Cancel" : "Add New Address"}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="py-10 text-center animate-pulse text-[#6B7280] font-bold uppercase tracking-widest text-xs font-display">Loading Addresses...</div>
                ) : isAddingNew ? (
                  <form onSubmit={handleSaveAddress} className="space-y-4 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Full Name" required className="bg-white border border-[#E8F6F6] p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] outline-none" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                      <input placeholder="Email" type="email" required={isGuestCheckout} className="bg-white border border-[#E8F6F6] p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] outline-none" value={newAddress.email} onChange={e => setNewAddress({...newAddress, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Phone" required className="bg-white border border-[#E8F6F6] p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] outline-none" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                    </div>
                    <input placeholder="Street Address" required className="bg-white border border-[#E8F6F6] p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] outline-none" value={newAddress.addressLine} onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <input placeholder="City" required className="bg-white border border-[#E8F6F6] p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] outline-none" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                      <input placeholder="Country" required className="bg-white border border-[#E8F6F6] p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] outline-none" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                      <input placeholder="Postal Code" required className="bg-white border border-[#E8F6F6] p-4 rounded-2xl w-full focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] outline-none" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} />
                    </div>
                    {isAuthenticated && (
                      <button type="submit" className="w-full bg-[#1CA7A6] text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-[#178E8D] transition-all font-display animate-sheen">Save Address</button>
                    )}
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`relative cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                          selectedAddressId === addr.id 
                          ? "border-[#1CA7A6] bg-[#E8F6F6]/60 shadow-[0_0_20px_rgba(28,167,166,0.2)]" 
                          : "border-[#E8F6F6] bg-white hover:border-[#BCE8E8]"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg text-[#333333] tracking-tight font-display">{addr.fullName}</p>
                            <p className="text-[#6B7280] text-sm mt-1">{addr.addressLine}</p>
                            {addr.email && <p className="text-[#9CA3AF] text-xs mt-1">{addr.email}</p>}
                            <p className="text-[#6B7280] text-xs uppercase font-bold tracking-widest mt-2 font-display">{addr.city}, {addr.country}</p>
                          </div>
                          {selectedAddressId === addr.id && <CheckCircle className="text-[#1CA7A6]" size={24} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </MotionDiv>
            </div>

            {/* --- RIGHT: ORDER SUMMARY & PAY --- */}
            <div className="lg:col-span-5">
              <MotionDiv 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-elevated bg-white p-8 rounded-3xl border-2 border-[#E8F6F6] sticky top-24"
              >
                <h2 className="text-2xl font-display font-bold text-gradient-brand mb-8 flex items-center gap-3">
                  <ShoppingBag className="text-[#F2994A]" /> Order Review
                </h2>
                
                <div className="space-y-6 mb-8 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-[#E8F6F6] shrink-0">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-[#333333] line-clamp-1 uppercase tracking-tight font-display">{item.title}</h4>
                        <p className="text-[10px] text-[#F2994A] font-bold font-display">QTY: {item.quantity}</p>
                      </div>
                      <span className="font-display font-bold text-[#1CA7A6]">{formatMoney(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E8F6F6] pt-6 space-y-3 mb-8">
                  <div className="flex justify-between text-[#6B7280] text-xs font-bold uppercase tracking-widest font-display">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280] text-xs font-bold uppercase tracking-widest font-display">
                    <span>Shipping ({selectedShippingMethod.replace("_", " ")})</span>
                    <span className="text-[#1CA7A6] font-bold">
                      {totalShippingCost > 0 ? formatMoney(totalShippingCost) : "$0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xl font-display font-bold text-[#333333] pt-2">
                    <span>Total</span>
                    <span className="text-[#F2994A]">{formatMoney(payableTotal)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentError && (
                    <div className="text-center p-4 bg-[#FEF3E8] rounded-2xl border border-[#F2994A]/40 text-[#C96B1C] text-xs font-bold uppercase tracking-widest font-display">
                      {paymentError}
                    </div>
                  )}
                  {!canPay ? (
                    <div className="text-center p-4 bg-[#E8F6F6] rounded-2xl border border-[#1CA7A6]/30 text-[#178E8D] text-xs font-bold uppercase tracking-widest font-display">
                      {isGuestCheckout ? "Fill guest shipping details to pay" : "Select a destination to pay"}
                    </div>
                  ) : (
                    <div className="animate-in fade-in zoom-in duration-700">
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "pill", color: "black", label: "pay" }}
                        createOrder={async () => {
                          setPaymentError(null);
                          const res = await fetch("/api/checkout/paypal", {
                            method: "POST",
                            body: JSON.stringify({
                              cartItems: items,
                              cartTotal: payableTotal.toFixed(2),
                            }),
                          });
                          const order = await res.json();
                          if (!res.ok || !order?.id) {
                            throw new Error(order?.error || "Unable to create PayPal order");
                          }
                          return order.id;
                        }}
                        onApprove={async (data) => {
                          if (isGuestCheckout && !guestAddressComplete) return;
                          setPaymentError(null);

                          const res = await fetch("/api/checkout/paypal", {
                            method: "PATCH",
                            body: JSON.stringify({
                              orderID: data.orderID,
                              cartItems: items,
                              shippingAddressId: selectedAddressId,
                              guestAddress: isGuestCheckout ? newAddress : null,
                              cartTotal: payableTotal.toFixed(2),
                              shippingMethod: selectedShippingMethod,
                            }),
                          });
                          const captureResult = await res.json();
                          if (captureResult.success) {
                            clearCart();
                            router.push("/checkout/success");
                          } else {
                            setPaymentError(captureResult?.error || "Payment capture failed.");
                          }
                        }}
                        onError={(err) => {
                          setPaymentError(getReadablePayPalError(err));
                        }}
                      />
                      {/* Recent Payment Methods */}
                      <div className="flex items-center gap-3 flex-wrap justify-center mt-6 mb-2 bg-white rounded-2xl border-2 border-[#E8F6F6] shadow-lg p-4">
                        {[
                          { name: "PayPal", src: "https://cdn.webfastcdn.com/image/payment/Paypal.svg" },
                          { name: "American Express", src: "https://cdn.webfastcdn.com/image/payment/American_Express.svg" },
                          { name: "Visa", src: "https://cdn.webfastcdn.com/image/payment/Visa.svg" },
                          { name: "Discover", src: "https://cdn.webfastcdn.com/image/payment/Discover.svg" },
                          { name: "Mastercard", src: "https://cdn.webfastcdn.com/image/payment/Mastercard.svg" },
                          { name: "Diners Club", src: "https://cdn.webfastcdn.com/image/payment/Diners_Club.svg" },
                          { name: "Klarna", src: "https://cdn.webfastcdn.com/image/payment/Klarna.svg" },
                        ].map((payment) => (
                          <img
                            key={payment.name}
                            src={payment.src}
                            alt={payment.name}
                            width={40}
                            height={28}
                            className="w-15 h-10 object-contain rounded-sm p-0.5 bg-white/90 border border-[#E8F6F6] hover:scale-110 transition-transform duration-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[9px] text-center text-[#6B7280] uppercase font-bold tracking-[0.2em] mt-4 font-display">
                    <CreditCard size={10} className="inline mb-1 mr-1 text-[#1CA7A6]" /> Encrypted 256-bit SSL Connection
                  </p>
                </div>
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

