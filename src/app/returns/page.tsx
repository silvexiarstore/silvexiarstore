"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileVideo,
  ImagePlus,
  Loader2,
  Search,
  ShieldCheck,
  X,
  UploadCloud,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatMoney } from "@/lib/money";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type IssueType = "NOT_RECEIVED" | "DAMAGED" | "WRONG_ITEM" | "DEFECTIVE" | "MISSING_PARTS" | "OTHER";

type LookupItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
};

type LookupOrder = {
  id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  shippingMethod: string;
  shippingCost: number;
  items: LookupItem[];
};

const ISSUE_OPTIONS: Array<{ value: IssueType; label: string; hint: string }> = [
  { value: "NOT_RECEIVED", label: "Not Received", hint: "Order did not arrive" },
  { value: "DAMAGED", label: "Damaged", hint: "Product arrived broken or damaged" },
  { value: "WRONG_ITEM", label: "Wrong Item", hint: "Received a different product" },
  { value: "DEFECTIVE", label: "Defective", hint: "Product is not working correctly" },
  { value: "MISSING_PARTS", label: "Missing Parts", hint: "Package arrived incomplete" },
  { value: "OTHER", label: "Other", hint: "Something else happened" },
];

function issueLabel(issueType: IssueType) {
  return ISSUE_OPTIONS.find((option) => option.value === issueType)?.label || "Other";
}

function detectIssueType(message: string): IssueType | null {
  const text = message.toLowerCase();
  if (text.includes("not received") || text.includes("didn't arrive") || text.includes("did not arrive")) return "NOT_RECEIVED";
  if (text.includes("broken") || text.includes("damage")) return "DAMAGED";
  if (text.includes("wrong item") || text.includes("different item")) return "WRONG_ITEM";
  if (text.includes("defect") || text.includes("not working") || text.includes("doesn't work")) return "DEFECTIVE";
  if (text.includes("missing") || text.includes("part")) return "MISSING_PARTS";
  return null;
}

function buildSuggestions(message: string, issueType: IssueType): string[] {
  const suggestions: string[] = [];
  if (!message.trim()) return suggestions;

  if (message.length < 30) {
    suggestions.push("Add a short timeline: delivery date, when you opened the package, and when you noticed the issue.");
  }
  if (!/\d/.test(message)) {
    suggestions.push("Include quantities or item details (size, color, variant) to speed up review.");
  }
  if (issueType === "DAMAGED" || issueType === "DEFECTIVE") {
    suggestions.push("Attach clear photos/videos showing the issue from multiple angles.");
  }
  if (issueType === "NOT_RECEIVED") {
    suggestions.push("Mention your latest tracking update and expected delivery date.");
  }
  if (issueType === "WRONG_ITEM" || issueType === "MISSING_PARTS") {
    suggestions.push("Compare what you ordered vs what you received in one clear sentence.");
  }

  return suggestions.slice(0, 3);
}

function getUploadErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const raw = String((err as { message?: unknown }).message || "").trim();
    if (raw) return raw;
  }
  if (typeof err === "string" && err.trim()) return err.trim();
  return "Unknown upload error.";
}

function isBucketNotFoundError(err: unknown): boolean {
  const msg = getUploadErrorMessage(err).toLowerCase();
  return msg.includes("bucket not found") || msg.includes("bucket does not exist");
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|avi|mkv)(\?.*)?$/i.test(url);
}

function charCountText(value: string): string {
  return `${value.length} chars`;
}

export default function ReturnsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<LookupOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const [orderCode, setOrderCode] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("OTHER");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [manualUrls, setManualUrls] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  const detectedIssue = useMemo(() => detectIssueType(message), [message]);
  const suggestions = useMemo(
    () => buildSuggestions(message, detectedIssue || issueType),
    [message, issueType, detectedIssue],
  );

  const parsedManualUrls = useMemo(
    () =>
      manualUrls
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => {
          try {
            new URL(line);
            return true;
          } catch {
            return false;
          }
        }),
    [manualUrls],
  );

  useEffect(() => {
    async function boot() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const auth = Boolean(sessionData?.authenticated);
        setIsAuthenticated(auth);

        if (auth) {
          const myOrdersRes = await fetch("/api/returns/my-orders");
          const myOrdersData = await myOrdersRes.json();
          if (myOrdersRes.ok && Array.isArray(myOrdersData.orders)) {
            setOrders(myOrdersData.orders);
            if (myOrdersData.orders[0]?.id) setSelectedOrderId(myOrdersData.orders[0].id);
          }
        }
      } catch {
        setIsAuthenticated(false);
      }
    }

    boot();
  }, []);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupLoading(true);
    setLookupError(null);
    setSubmitError(null);
    setSuccessId(null);

    try {
      const res = await fetch("/api/returns/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, email: lookupEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLookupError(data?.error || "Unable to find orders.");
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setSelectedOrderId(data.orders?.[0]?.id || "");
      if (lookupEmail.trim()) setCustomerEmail(lookupEmail.trim());
      setIssueType("OTHER");
      setSubject("");
      setMessage("");
      setItemTitle("");
      setUploadedUrls([]);
      setManualUrls("");
    } catch {
      setLookupError("Network issue. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setSubmitError(null);
    const nextUrls: string[] = [];
    const storageBuckets = ["returns", "products"] as const;

    try {
      for (const file of Array.from(files).slice(0, 8)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `returns/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
        let uploaded = false;
        let lastError: unknown = null;

        for (const bucket of storageBuckets) {
          const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

          if (error) {
            lastError = error;
            if (isBucketNotFoundError(error) && bucket === "returns") {
              continue;
            }
            throw error;
          }

          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          if (data.publicUrl && /^https?:\/\//.test(data.publicUrl)) {
            nextUrls.push(data.publicUrl);
            uploaded = true;
            break;
          }
          lastError = new Error("file URL is not public or invalid.");
          break;
        }

        if (!uploaded) {
          throw lastError || new Error("Upload failed.");
        }
      }

      setUploadedUrls((prev) => Array.from(new Set([...prev, ...nextUrls])).slice(0, 8));
    } catch (err) {
      const reason = getUploadErrorMessage(err);
      setSubmitError(`Upload failed: ${reason}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmitComplaint(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmitting(true);
    setSubmitError(null);
    setSuccessId(null);

    const finalIssueType = detectedIssue || issueType;
    const finalSubject = subject.trim() || `${issueLabel(finalIssueType)} - Order ${selectedOrder.id.slice(0, 8).toUpperCase()}`;
    // Validate attachment URLs before submit
    const attachmentUrls = Array.from(new Set([...uploadedUrls, ...parsedManualUrls])).slice(0, 8);
    const invalidUrls = attachmentUrls.filter(url => !/^https?:\/\//.test(url));
    if (invalidUrls.length > 0) {
      setSubmitError("One or more attachment URLs are invalid. Please check your uploads.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/returns/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          orderCode,
          lookupEmail,
          customerName,
          customerEmail,
          issueType: finalIssueType,
          subject: finalSubject,
          message,
          itemTitle: itemTitle || null,
          attachments: attachmentUrls,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data?.error || "Failed to submit complaint.");
        return;
      }

      setSuccessId(data.complaintId);
      setShowSuccessModal(true);
    } catch {
      setSubmitError("Network issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function removeUploadedUrl(url: string) {
    setUploadedUrls((prev) => prev.filter((item) => item !== url));
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F6F6] via-[#F8F9FA] to-[#FEF3E8] pb-24 pt-8 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <header className="text-center space-y-3 animate-fade-up">
          <p className="text-[#1CA7A6] text-xs font-bold uppercase tracking-[0.32em] font-display">Returns & Complaints</p>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-gradient-brand">Return Policy & Complaint Portal</h1>
          <p className="text-[#6B7280] max-w-2xl mx-auto">
            Select your order, describe your issue, and attach evidence. Our support team reviews each complaint manually.
          </p>
        </header>

        {isAuthenticated === false && (
          <section className="card-elevated rounded-3xl border-2 border-[#E8F6F6] p-6 md:p-8">
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Search size={18} className="text-[#1CA7A6]" />
                <h2 className="text-xl font-display font-bold text-[#333333]">Guest Lookup</h2>
              </div>
              <p className="text-sm text-[#6B7280]">
                You can search using order code or email, or both.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    minLength={2}
                    placeholder="Order code"
                    className="bg-white border border-[#E8F6F6] rounded-2xl p-4 outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20 w-full"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">{charCountText(orderCode)}</p>
                </div>
                <div>
                  <input
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    type="email"
                    minLength={2}
                    placeholder="Email"
                    className="bg-white border border-[#E8F6F6] rounded-2xl p-4 outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20 w-full"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1">{charCountText(lookupEmail)}</p>
                </div>
              </div>
              <button
                disabled={lookupLoading}
                className="bg-[#1CA7A6] hover:bg-[#178E8D] text-white font-display font-bold uppercase tracking-[0.2em] text-xs rounded-full px-7 py-3 animate-sheen inline-flex items-center gap-2"
              >
                {lookupLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={15} />}
                Search Orders
              </button>
              {lookupError && <p className="text-sm text-[#C96B1C] font-medium">{lookupError}</p>}
            </form>
          </section>
        )}

        {isAuthenticated === true && orders.length === 0 && (
          <section className="card-elevated rounded-3xl border-2 border-[#E8F6F6] p-8 text-center">
            <p className="text-[#6B7280]">No orders found in your account yet.</p>
          </section>
        )}

        {orders.length > 0 && (
          <section className="space-y-6">
            <div className="card-elevated rounded-3xl border-2 border-[#E8F6F6] p-6 md:p-8">
              <h2 className="text-2xl font-display font-bold text-[#333333] mb-5">Select Order</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                      selectedOrderId === order.id
                        ? "border-[#1CA7A6] bg-[#E8F6F6]/70"
                        : "border-[#E8F6F6] bg-white hover:border-[#1CA7A6]/40"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280] font-display">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-[#6B7280]">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-[#F2994A]">{formatMoney(order.totalAmount)}</p>
                        <p className="text-xs text-[#1CA7A6] font-bold">{order.status}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedOrder && (
              <form onSubmit={handleSubmitComplaint} className="card-elevated rounded-3xl border-2 border-[#E8F6F6] p-6 md:p-8 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#F2994A]" />
                    <h2 className="text-2xl font-display font-bold text-[#333333]">Submit Complaint</h2>
                  </div>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-[#E8F6F6] bg-white p-3 flex justify-between items-center text-sm">
                        <span className="text-[#333333] font-medium">{item.title} (x{item.quantity})</span>
                        <span className="text-[#1CA7A6] font-bold">{formatMoney(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      minLength={2}
                      placeholder="Full name"
                      className="bg-white border border-[#E8F6F6] rounded-2xl p-4 outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20 w-full"
                    />
                    <p className="text-[11px] text-[#6B7280] mt-1">{charCountText(customerName)}</p>
                  </div>
                  <div>
                    <input
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      type="email"
                      minLength={2}
                      placeholder="Contact email"
                      className="bg-white border border-[#E8F6F6] rounded-2xl p-4 outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20 w-full"
                    />
                    <p className="text-[11px] text-[#6B7280] mt-1">{charCountText(customerEmail)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as IssueType)}
                    className="bg-white border border-[#E8F6F6] rounded-2xl p-4 outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20"
                  >
                    {ISSUE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.hint}
                      </option>
                    ))}
                  </select>

                  <select
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="bg-white border border-[#E8F6F6] rounded-2xl p-4 outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20"
                  >
                    <option value="">Entire order / Shipping issue</option>
                    {selectedOrder.items.map((item) => (
                      <option key={item.id} value={item.title}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  minLength={2}
                  placeholder="Subject (optional, auto-generated if empty)"
                  className="bg-white border border-[#E8F6F6] rounded-2xl p-4 w-full outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20"
                />
                <p className="text-[11px] text-[#6B7280] -mt-2">{charCountText(subject)}</p>

                <div className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={2}
                    rows={6}
                    placeholder="Describe what happened and what resolution you expect."
                    className="bg-white border border-[#E8F6F6] rounded-2xl p-4 w-full outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20"
                  />
                  <p className="text-[11px] text-[#6B7280] -mt-2">{charCountText(message)}</p>

                  {detectedIssue && detectedIssue !== issueType && (
                    <p className="text-xs text-[#178E8D] font-bold uppercase tracking-wider font-display">
                      Suggested issue type from your text: {issueLabel(detectedIssue)}
                    </p>
                  )}

                  {suggestions.length > 0 && (
                    <div className="bg-[#E8F6F6]/60 border border-[#BCE8E8] rounded-2xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#178E8D] mb-2 font-display">Writing Suggestions</p>
                      <ul className="text-sm text-[#444444] space-y-1">
                        {suggestions.map((hint, index) => (
                          <li key={index}>- {hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-bold text-[#333333] font-display inline-flex items-center gap-2 mb-2">
                      <UploadCloud size={16} className="text-[#1CA7A6]" /> Upload Photos / Videos
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => handleUploadFiles(e.target.files)}
                      className="block w-full text-sm text-[#6B7280] file:mr-4 file:rounded-full file:border-0 file:bg-[#1CA7A6] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider file:text-white hover:file:bg-[#178E8D]"
                    />
                  </label>

                  {uploading && <p className="text-xs text-[#6B7280]">Uploading files...</p>}

                  {uploadedUrls.length > 0 && (
                    <div className="rounded-2xl border border-[#E8F6F6] p-3 bg-white">
                      <p className="text-xs text-[#1CA7A6] font-bold uppercase tracking-wider font-display mb-2">Uploaded Files</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        {uploadedUrls.map((url) => {
                          const isVideo = isVideoUrl(url);
                          if (isVideo) {
                            return (
                              <div key={`preview-${url}`} className="relative">
                                <video
                                  src={url}
                                  className="w-full h-24 rounded-xl object-cover border border-[#E8F6F6]"
                                  controls
                                />
                                <button
                                  type="button"
                                  onClick={() => removeUploadedUrl(url)}
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                                  aria-label="Remove uploaded file"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div key={`preview-${url}`} className="relative">
                              <img
                                src={url}
                                alt="Uploaded attachment"
                                className="w-full h-24 rounded-xl object-cover border border-[#E8F6F6]"
                              />
                              <button
                                type="button"
                                onClick={() => removeUploadedUrl(url)}
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                                aria-label="Remove uploaded file"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-1">
                        {uploadedUrls.map((url) => (
                          <p key={url} className="text-xs text-[#6B7280] truncate">{url}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    value={manualUrls}
                    onChange={(e) => setManualUrls(e.target.value)}
                    minLength={2}
                    placeholder="Optional: paste external image/video URLs (one per line)"
                    className="bg-white border border-[#E8F6F6] rounded-2xl p-4 w-full outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20"
                  />
                  <p className="text-[11px] text-[#6B7280] -mt-2">{charCountText(manualUrls)}</p>

                  <p className="text-xs text-[#6B7280] inline-flex items-center gap-2">
                    <ImagePlus size={12} /> <FileVideo size={12} /> Accepted via upload or direct URLs
                  </p>
                </div>

                {submitError && (
                  <div className="rounded-2xl border border-[#F2994A]/40 bg-[#FEF3E8] px-4 py-3 text-sm text-[#C96B1C] inline-flex items-center gap-2">
                    <AlertCircle size={16} /> {submitError}
                  </div>
                )}

                {successId && (
                  <div className="rounded-2xl border border-[#1CA7A6]/30 bg-[#E8F6F6] px-4 py-3 text-sm text-[#178E8D] inline-flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Complaint submitted successfully. ID: {successId.slice(0, 8).toUpperCase()}.
                  </div>
                )}

                <button
                  disabled={submitting}
                  className="bg-[#1CA7A6] hover:bg-[#178E8D] text-white font-display font-bold uppercase tracking-[0.2em] text-xs rounded-full px-8 py-4 animate-sheen inline-flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={15} />}
                  Submit Complaint
                </button>
              </form>
            )}
          </section>
        )}

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={() => setShowSuccessModal(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Complaint Submitted</h3>
                  <p className="text-slate-500 font-medium mb-8">
                    Your complaint was submitted successfully.<br/>
                    <span className="text-slate-900 font-bold">ID: {successId?.slice(0,8).toUpperCase()}</span>
                  </p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
