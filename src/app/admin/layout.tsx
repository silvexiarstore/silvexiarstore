import AdminSidebar from "@/components/AdminSidebar";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="md:ml-72 min-h-screen transition-all duration-300">{children}</main>
    </div>
  );
}