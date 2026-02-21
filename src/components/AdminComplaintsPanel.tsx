"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Mail, MessageSquare, RefreshCw, Send } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { toast } from "sonner";

type ComplaintStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";

type ComplaintRecord = {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  issueType: string;
  subject: string;
  message: string;
  itemTitle: string | null;
  attachments: string[];
  status: ComplaintStatus;
  adminReply: string | null;
  adminRepliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
    totalAmount: number;
  };
};

export default function AdminComplaintsPanel({ initialComplaints }: { initialComplaints: ComplaintRecord[] }) {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(initialComplaints);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ComplaintStatus>>({});

  const filtered = useMemo(
    () => complaints.filter((item) => statusFilter === "ALL" || item.status === statusFilter),
    [complaints, statusFilter],
  );

  useEffect(() => {
    if (initialComplaints.length === 0) {
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter === "ALL" ? "/api/admin/complaints" : `/api/admin/complaints?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to load complaints");
      setComplaints(data);
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : "Unable to load complaints");
    } finally {
      setLoading(false);
    }
  }

  async function saveComplaint(complaint: ComplaintRecord) {
    const nextReply = (replyDrafts[complaint.id] ?? complaint.adminReply ?? "").trim();
    const nextStatus = statusDrafts[complaint.id] || complaint.status;

    setSavingId(complaint.id);
    setError(null);

    try {
      const res = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: complaint.id,
          status: nextStatus,
          adminReply: nextReply || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update complaint");

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === complaint.id
            ? {
                ...item,
                status: data.status,
                adminReply: data.adminReply,
                adminRepliedAt: data.adminRepliedAt,
                updatedAt: data.updatedAt,
              }
            : item,
        ),
      );
      toast.success("Complaint updated successfully. Reply email sent.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update complaint");
      toast.error("Failed to update complaint.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Complaints Register</h2>
          <p className="text-slate-500 text-sm">Review return complaints, reply by email, and update status.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | "ALL")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In review</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <button
            onClick={reload}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold inline-flex items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 inline-flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
          <CheckCircle2 size={30} className="mx-auto text-emerald-500 mb-3" />
          <p className="font-bold text-slate-800">No complaints found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((complaint) => {
            const draftStatus = statusDrafts[complaint.id] || complaint.status;
            const draftReply = replyDrafts[complaint.id] ?? complaint.adminReply ?? "";

            return (
              <article key={complaint.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Complaint #{complaint.id.slice(0, 8).toUpperCase()}</p>
                    <h3 className="text-xl font-black text-slate-900">{complaint.subject}</h3>
                    <p className="text-sm text-slate-500">
                      {complaint.customerName} ({complaint.customerEmail}) | Issue: {complaint.issueType.replaceAll("_", " ")}
                    </p>
                    <p className="text-sm text-slate-500">
                      Order #{complaint.orderId.slice(0, 8).toUpperCase()} | {formatMoney(complaint.order.totalAmount)} | {complaint.order.status}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border bg-slate-50 text-slate-700 border-slate-200">
                    <MessageSquare size={14} />
                    {complaint.status}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-700 whitespace-pre-line">
                  {complaint.message}
                </div>

                {complaint.itemTitle && (
                  <p className="text-sm text-slate-600">
                    <span className="font-bold">Item:</span> {complaint.itemTitle}
                  </p>
                )}

                {complaint.attachments.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Attachments</p>
                    <div className="space-y-1">
                      {complaint.attachments.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="block text-sm text-sky-700 hover:underline truncate">
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={draftStatus}
                    onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [complaint.id]: e.target.value as ComplaintStatus }))}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                  <a
                    href={`mailto:${complaint.customerEmail}`}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 inline-flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <Mail size={15} /> Email Customer
                  </a>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={draftReply}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                    rows={4}
                    placeholder="Write admin reply. This will be sent to customer by email."
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                  />
                  <button
                    onClick={() => saveComplaint(complaint)}
                    disabled={savingId === complaint.id}
                    className="rounded-full bg-slate-900 text-white px-6 py-3 text-xs font-black uppercase tracking-[0.15em] inline-flex items-center gap-2 hover:bg-slate-700 transition-colors"
                  >
                    {savingId === complaint.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Save & Send Reply
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
