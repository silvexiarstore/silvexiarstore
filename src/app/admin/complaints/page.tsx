import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import AdminComplaintsPanel from "@/components/AdminComplaintsPanel";

export default async function AdminComplaintsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <AdminComplaintsPanel initialComplaints={[]} />
      </div>
    </div>
  );
}
