import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import OrderStatusEditor from "@/components/OrderStatusEditor";
import { formatMoney } from "@/lib/money";

// Helper Component for Status Icons
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'DELIVERED':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'SHIPPED':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; // Bolt icon for fast shipping or Truck
    case 'PROCESSING':
      return <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
    case 'CANCELLED':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
    default: // PENDING
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true } },
      address: true,
    },
  });

  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  const paypalInvoiceId =
    (order as typeof order & { paypalInvoiceId?: string | null }).paypalInvoiceId ?? null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/admin/orders" className="text-slate-500 hover:text-black text-sm font-medium mb-2 inline-flex items-center gap-1 transition-colors group">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Order <span className="text-slate-400 font-mono text-2xl">#{order.id.slice(0, 8)}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Placed on {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Payment Status Badge */}
            <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 shadow-sm ${
              order.paymentStatus === 'PAID' 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              {order.paymentStatus === 'PAID' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              {order.paymentStatus}
            </div>

            {/* Order Status Badge (New) */}
            <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 shadow-sm bg-white border-slate-200 text-slate-700`}>
              <StatusIcon status={order.status} />
              {order.status}
            </div>
          </div>
        </div>

        {/* 2. PROGRESS BAR */}
        {!isCancelled && (
          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-100/50 border border-slate-100">
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full mx-4"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-slate-900 -z-10 rounded-full transition-all duration-700 mx-4"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                
                return (
                  <div key={step} className="flex flex-col items-center bg-white px-2 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all duration-500 shadow-sm ${
                      isActive 
                        ? "border-slate-900 bg-slate-900 text-white scale-110 shadow-slate-900/30" 
                        : "border-slate-200 text-slate-400"
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className={`text-xs mt-3 font-bold uppercase tracking-wider transition-colors ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-rose-700 font-bold text-center flex items-center justify-center gap-2 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            This order has been CANCELLED
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <h2 className="font-bold text-lg text-slate-900">Items Ordered</h2>
              </div>
              
              <div className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 transition-colors">
                    <div className="relative h-20 w-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 group">
                      {item.product.images[0] && (
                        <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-lg truncate">{item.product.title}</p>
                      <p className="text-sm text-slate-500 mt-1 font-mono text-xs">ID: {item.product.slug.slice(0,10)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">{item.quantity} x {formatMoney(item.price)}</p>
                      <p className="font-bold text-slate-900 text-lg">{formatMoney(Number(item.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div className="bg-slate-50/50 p-8 border-t border-slate-100">
                <div className="flex flex-col gap-3 ml-auto max-w-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatMoney(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                      {order.shippingMethod.replace("_", " ")} ({Number(order.shippingCost || 0) > 0 ? formatMoney(order.shippingCost) : "Free"})
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl text-slate-900">Total</span>
                    <span className="font-extrabold text-3xl text-slate-900">{formatMoney(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="space-y-6">
            
            {/* 1. MANAGEMENT (Settings Icon) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-xl shadow-indigo-100/50 relative  group hover:border-indigo-100 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 z-0 opacity-50"></div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 relative z-10">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl text-sm shadow-sm">
                  {/* Settings Icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </span>
                Management
              </h3>
              <div className="relative z-10">
                <OrderStatusEditor 
                  order={{
                    id: order.id,
                    status: order.status,
                    paymentStatus: order.paymentStatus
                  }} 
                />
              </div>
            </div>

            {/* 2. CUSTOMER */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-50">
                <span className="bg-sky-100 text-sky-600 p-1.5 rounded-lg text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                Customer
              </h3>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-slate-800 to-black text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-2 border-white ring-2 ring-slate-100">
                  {order.user.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{order.user.fullName}</p>
                  <Link href={`mailto:${order.user.email}`} className="text-sm text-sky-600 hover:text-sky-700 hover:underline block truncate font-medium transition-colors">
                    {order.user.email}
                  </Link>
                  <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100">ID: {order.user.id.slice(0, 6)}</p>
                </div>
              </div>
            </div>

            {/* 3. PAYMENT REFERENCES */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-50">
                <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a5 5 0 00-10 0v2m-2 0h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z"></path></svg>
                </span>
                Payment References
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">PayPal Order ID</p>
                  <p className="font-mono text-xs bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 break-all">
                    {order.transactionId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">PayPal Invoice ID</p>
                  <p className="font-mono text-xs bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 break-all">
                    {paypalInvoiceId || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. SHIPPING ADDRESS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-50">
                <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </span>
                Shipping Address
              </h3>
              {order.address ? (
                <div className="text-sm text-slate-600 space-y-3">
                  <div className="font-bold text-slate-900 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {order.address.fullName}
                  </div>
                  <div className="pl-3 border-l-2 border-slate-100 ml-2 space-y-1 py-1">
                    <p>{order.address.addressLine}</p>
                    <p>{order.address.city}, {order.address.postalCode}</p>
                    <p className="font-bold text-slate-800">{order.address.country}</p>
                    {order.address.email && (
                      <p className="text-sky-700 font-medium">{order.address.email}</p>
                    )}
                  </div>
                  <div className="pt-2">
                    <a href={`tel:${order.address.phone}`} className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg w-full justify-center font-medium border border-transparent hover:border-slate-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {order.address.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm border border-rose-100 flex items-center gap-2 justify-center font-bold">
                  No address
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
