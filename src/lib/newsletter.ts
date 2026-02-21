import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { formatMoney } from "@/lib/money";

let readyPromise: Promise<void> | null = null;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function ensureNewsletterSchema() {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
        "email" TEXT PRIMARY KEY,
        "source" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_isActive_idx" ON "NewsletterSubscriber"("isActive");
    `);
  })();

  return readyPromise;
}

export async function subscribeNewsletter(email: string, source: string) {
  await ensureNewsletterSchema();
  const normalized = email.trim().toLowerCase();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "NewsletterSubscriber" ("email", "source", "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, true, NOW(), NOW())
      ON CONFLICT ("email")
      DO UPDATE SET
        "isActive" = true,
        "source" = EXCLUDED."source",
        "updatedAt" = NOW();
    `,
    normalized,
    source,
  );

  return normalized;
}

export async function isNewsletterSubscribed(email: string) {
  await ensureNewsletterSchema();
  const normalized = email.trim().toLowerCase();

  const rows = await prisma.$queryRawUnsafe<Array<{ email: string }>>(
    `
      SELECT "email"
      FROM "NewsletterSubscriber"
      WHERE "email" = $1 AND "isActive" = true
      LIMIT 1;
    `,
    normalized,
  );

  return rows.length > 0;
}

export async function getActiveNewsletterEmails() {
  await ensureNewsletterSchema();
  const rows = await prisma.$queryRawUnsafe<Array<{ email: string }>>(
    `
      SELECT "email"
      FROM "NewsletterSubscriber"
      WHERE "isActive" = true;
    `,
  );

  return rows.map((row) => row.email);
}

export async function sendNewsletterWelcomeEmail(email: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to Silvexiar Updates</h2>
      <p>You are now subscribed to product updates.</p>
      <p>We will email you whenever a new item is added to our store.</p>
      <p>Thank you for subscribing.</p>
    </div>
  `;

  await sendEmail(email, "Subscription Confirmed - Silvexiar", html);
}

export async function sendNewProductNewsletter(payload: {
  title: string;
  slug: string;
  price: unknown;
  image?: string | null;
}) {
  const emails = await getActiveNewsletterEmails();
  if (!emails.length) return;

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/product/${payload.slug}`;
  const safeTitle = escapeHtml(payload.title);

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Product Just Dropped</h2>
      <p><strong>${safeTitle}</strong> is now available in the store.</p>
      <p><strong>Price:</strong> ${formatMoney(payload.price)}</p>
      ${payload.image ? `<p><img src="${escapeHtml(payload.image)}" alt="${safeTitle}" style="max-width: 260px; border-radius: 12px;" /></p>` : ""}
      <p><a href="${escapeHtml(productUrl)}">View Product</a></p>
      <p>Silvexiar Team</p>
    </div>
  `;

  await Promise.allSettled(
    emails.map((email) => sendEmail(email, `New Product - ${payload.title}`, html)),
  );
}
