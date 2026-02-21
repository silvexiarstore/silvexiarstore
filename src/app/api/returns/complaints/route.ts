import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureComplaintsSchema } from "@/lib/complaints-schema";
import {
  sendAdminNewComplaintEmail,
  sendCustomerComplaintReceivedEmail,
} from "@/lib/complaint-mails";

const complaintSchema = z.object({
  orderId: z.string().min(8),
  orderCode: z.string().trim().optional().default(""),
  lookupEmail: z.string().trim().optional().default(""),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  issueType: z.enum(["NOT_RECEIVED", "DAMAGED", "WRONG_ITEM", "DEFECTIVE", "MISSING_PARTS", "OTHER"]),
  subject: z.string().min(4).max(140),
  message: z.string().min(15).max(4000),
  itemTitle: z.string().max(180).optional().nullable(),
  attachments: z.array(z.string().url()).max(8).default([]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = complaintSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid complaint payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    await ensureComplaintsSchema();

    const session = await getSession();
    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: {
        user: { select: { email: true, id: true } },
        address: { select: { email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (session?.userId) {
      if (order.userId !== (session.userId as string)) {
        return NextResponse.json({ error: "You cannot submit a complaint for this order." }, { status: 403 });
      }
    } else {
      const codeOk = payload.orderCode
        ? order.id.toLowerCase().startsWith(payload.orderCode.toLowerCase())
        : true;
      const emailNeedle = payload.lookupEmail.toLowerCase();
      const emailOk = payload.lookupEmail
        ? [order.user.email, order.address?.email]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase() === emailNeedle)
        : true;

      if (!payload.orderCode && !payload.lookupEmail) {
        return NextResponse.json(
          { error: "For guest complaints, provide order code or email used in lookup." },
          { status: 400 },
        );
      }

      if (!codeOk || !emailOk) {
        return NextResponse.json(
          { error: "Order verification failed. Use the same data used during lookup." },
          { status: 400 },
        );
      }
    }

    if (!payload.subject.trim() || !payload.message.trim()) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 },
      );
    }

    const complaintId = randomUUID();
    const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
      INSERT INTO "ReturnComplaint" (
        "id",
        "orderId",
        "customerName",
        "customerEmail",
        "issueType",
        "subject",
        "message",
        "itemTitle",
        "attachments",
        "status",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${complaintId},
        ${payload.orderId},
        ${payload.customerName.trim()},
        ${payload.customerEmail.trim().toLowerCase()},
        ${payload.issueType}::"ComplaintIssueType",
        ${payload.subject.trim()},
        ${payload.message.trim()},
        ${payload.itemTitle?.trim() || null},
        ${payload.attachments}::text[],
        'OPEN'::"ComplaintStatus",
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    const complaint = rows[0];
    if (!complaint) {
      return NextResponse.json({ error: "Failed to create complaint." }, { status: 500 });
    }

    try {
      await sendAdminNewComplaintEmail({
        complaintId: complaint.id,
        orderId: complaint.orderId,
        customerName: complaint.customerName,
        customerEmail: complaint.customerEmail,
        issueType: complaint.issueType,
        subject: complaint.subject,
        message: complaint.message,
        itemTitle: complaint.itemTitle,
        attachments: Array.isArray(complaint.attachments) ? complaint.attachments : [],
      });
    } catch (emailError) {
      console.error("ADMIN_COMPLAINT_EMAIL_ERROR:", emailError);
    }

    try {
      await sendCustomerComplaintReceivedEmail({
        to: complaint.customerEmail,
        customerName: complaint.customerName,
        complaintId: complaint.id,
        orderId: complaint.orderId,
        issueType: complaint.issueType,
        subject: complaint.subject,
      });
    } catch (emailError) {
      console.error("CUSTOMER_COMPLAINT_CONFIRMATION_ERROR:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        complaintId: complaint.id,
        status: complaint.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE_COMPLAINT_ERROR:", error);
    return NextResponse.json({ error: "Failed to submit complaint." }, { status: 500 });
  }
}
