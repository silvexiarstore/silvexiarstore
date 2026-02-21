import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { sendCustomerComplaintReplyEmail } from "@/lib/complaint-mails";
import { ensureComplaintsSchema } from "@/lib/complaints-schema";

const updateSchema = z.object({
  complaintId: z.string().min(8),
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED"]).optional(),
  adminReply: z.string().min(5).max(4000).optional(),
});

async function ensureAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;

  const admin = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { role: true },
  });
  return admin?.role === "ADMIN";
}

export async function GET(req: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureComplaintsSchema();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const validStatus = status === "OPEN" || status === "IN_REVIEW" || status === "RESOLVED" ? status : null;

  const whereSql = validStatus
    ? Prisma.sql`WHERE c."status" = ${validStatus}::"ComplaintStatus"`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<any[]>(Prisma.sql`
    SELECT
      c."id",
      c."orderId",
      c."customerName",
      c."customerEmail",
      c."issueType",
      c."subject",
      c."message",
      c."itemTitle",
      c."attachments",
      c."status",
      c."adminReply",
      c."adminRepliedAt",
      c."createdAt",
      c."updatedAt",
      o."status" AS "orderStatus",
      o."paymentStatus" AS "orderPaymentStatus",
      o."createdAt" AS "orderCreatedAt",
      o."totalAmount" AS "orderTotalAmount"
    FROM "ReturnComplaint" c
    INNER JOIN "Order" o ON o."id" = c."orderId"
    ${whereSql}
    ORDER BY c."status" ASC, c."createdAt" DESC
  `);

  const complaints = rows.map((row) => ({
    id: row.id,
    orderId: row.orderId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    issueType: row.issueType,
    subject: row.subject,
    message: row.message,
    itemTitle: row.itemTitle,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    status: row.status,
    adminReply: row.adminReply,
    adminRepliedAt: row.adminRepliedAt ? new Date(row.adminRepliedAt).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    order: {
      id: row.orderId,
      status: row.orderStatus,
      paymentStatus: row.orderPaymentStatus,
      createdAt: new Date(row.orderCreatedAt).toISOString(),
      totalAmount: Number(row.orderTotalAmount),
    },
  }));

  return NextResponse.json(complaints);
}

export async function PATCH(req: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureComplaintsSchema();

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const payload = parsed.data;
    const adminReply = payload.adminReply?.trim();
    const nextStatus = payload.status || (adminReply ? "IN_REVIEW" : undefined);

    if (!adminReply && !nextStatus) {
      return NextResponse.json({ error: "No changes submitted" }, { status: 400 });
    }

    const existingRows = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT "id", "customerEmail", "customerName", "orderId", "adminReply"
      FROM "ReturnComplaint"
      WHERE "id" = ${payload.complaintId}
      LIMIT 1
    `);
    const existing = existingRows[0];

    if (!existing) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    let updatedRows: any[] = [];

    if (adminReply && nextStatus) {
      updatedRows = await prisma.$queryRaw<any[]>(Prisma.sql`
        UPDATE "ReturnComplaint"
        SET
          "status" = ${nextStatus}::"ComplaintStatus",
          "adminReply" = ${adminReply},
          "adminRepliedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE "id" = ${payload.complaintId}
        RETURNING *
      `);
    } else if (adminReply) {
      updatedRows = await prisma.$queryRaw<any[]>(Prisma.sql`
        UPDATE "ReturnComplaint"
        SET
          "status" = 'IN_REVIEW'::"ComplaintStatus",
          "adminReply" = ${adminReply},
          "adminRepliedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE "id" = ${payload.complaintId}
        RETURNING *
      `);
    } else if (nextStatus) {
      updatedRows = await prisma.$queryRaw<any[]>(Prisma.sql`
        UPDATE "ReturnComplaint"
        SET
          "status" = ${nextStatus}::"ComplaintStatus",
          "updatedAt" = NOW()
        WHERE "id" = ${payload.complaintId}
        RETURNING *
      `);
    }

    const updated = updatedRows[0];
    if (!updated) {
      return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
    }

    if (adminReply && adminReply !== existing.adminReply) {
      try {
        await sendCustomerComplaintReplyEmail({
          to: updated.customerEmail,
          customerName: updated.customerName,
          complaintId: updated.id,
          orderId: updated.orderId,
          status: updated.status,
          adminReply,
        });
      } catch (emailError) {
        console.error("CUSTOMER_COMPLAINT_REPLY_EMAIL_ERROR:", emailError);
      }
    }

    return NextResponse.json({
      ...updated,
      createdAt: new Date(updated.createdAt).toISOString(),
      updatedAt: new Date(updated.updatedAt).toISOString(),
      adminRepliedAt: updated.adminRepliedAt ? new Date(updated.adminRepliedAt).toISOString() : null,
    });
  } catch (error) {
    console.error("ADMIN_COMPLAINT_PATCH_ERROR:", error);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}
