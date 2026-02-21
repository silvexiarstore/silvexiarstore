import prisma from "@/lib/prisma";

export function normalizeOrderCode(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function findOrderByCodeAndEmail(orderCode: string, email: string) {
  const normalizedCode = normalizeOrderCode(orderCode);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedCode || !normalizedEmail) return null;

  return prisma.order.findFirst({
    where: {
      id: { startsWith: normalizedCode },
      OR: [
        { user: { email: { equals: normalizedEmail, mode: "insensitive" } } },
        { address: { email: { equals: normalizedEmail, mode: "insensitive" } } },
      ],
    },
    include: {
      user: { select: { email: true } },
      address: { select: { email: true } },
      items: {
        include: {
          product: { select: { title: true } },
        },
      },
    },
  });
}
