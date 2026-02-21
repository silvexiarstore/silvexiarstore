import { sendEmail } from "@/lib/mail";

const ADMIN_COMPLAINT_EMAIL = process.env.COMPLAINT_ALERT_EMAIL || process.env.ORDER_ALERT_EMAIL || "silvexiarstore@gmail.com";

function issueLabel(issueType: string) {
  return issueType.replaceAll("_", " ");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderAttachmentList(attachments: string[]) {
  if (!attachments.length) return "<p><strong>Attachments:</strong> None</p>";
  const items = attachments
    .map((url) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></li>`)
    .join("");
  return `<p><strong>Attachments:</strong></p><ul>${items}</ul>`;
}

export async function sendAdminNewComplaintEmail(payload: {
  complaintId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  issueType: string;
  subject: string;
  message: string;
  itemTitle?: string | null;
  attachments: string[];
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Return Complaint</h2>
      <p><strong>Complaint ID:</strong> ${escapeHtml(payload.complaintId)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(payload.customerName)} (${escapeHtml(payload.customerEmail)})</p>
      <p><strong>Issue Type:</strong> ${escapeHtml(issueLabel(payload.issueType))}</p>
      <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
      <p><strong>Item:</strong> ${escapeHtml(payload.itemTitle || "Order-level issue")}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(payload.message).replaceAll("\n", "<br/>")}</p>
      ${renderAttachmentList(payload.attachments)}
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/complaints">Open Complaints Dashboard</a></p>
    </div>
  `;

  await sendEmail(ADMIN_COMPLAINT_EMAIL, `New Complaint - ${payload.complaintId.slice(0, 8)}`, html);
}

export async function sendCustomerComplaintReceivedEmail(payload: {
  to: string;
  customerName: string;
  complaintId: string;
  orderId: string;
  issueType: string;
  subject: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hello ${escapeHtml(payload.customerName)},</h2>
      <p>We received your complaint and our team will review it shortly.</p>
      <p><strong>Complaint ID:</strong> ${escapeHtml(payload.complaintId)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>Issue:</strong> ${escapeHtml(issueLabel(payload.issueType))}</p>
      <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
      <p>We will send you another email as soon as an admin replies.</p>
      <p>Thank you,<br/>Silvexiar Support</p>
    </div>
  `;

  await sendEmail(payload.to, `Complaint Received - ${payload.complaintId.slice(0, 8)}`, html);
}

export async function sendCustomerComplaintReplyEmail(payload: {
  to: string;
  customerName: string;
  complaintId: string;
  orderId: string;
  status: string;
  adminReply: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hello ${escapeHtml(payload.customerName)},</h2>
      <p>Our support team replied to your complaint.</p>
      <p><strong>Complaint ID:</strong> ${escapeHtml(payload.complaintId)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>Status:</strong> ${escapeHtml(payload.status.replaceAll("_", " "))}</p>
      <p><strong>Admin Reply:</strong><br/>${escapeHtml(payload.adminReply).replaceAll("\n", "<br/>")}</p>
      <p>If you need more help, you can contact us by email.</p>
      <p>Silvexiar Support</p>
    </div>
  `;

  await sendEmail(payload.to, `Complaint Reply - ${payload.complaintId.slice(0, 8)}`, html);
}
