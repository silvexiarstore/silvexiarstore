import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] py-14 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-12 space-y-6">
        <p className="text-amber-700 text-xs font-black uppercase tracking-[0.3em]">Legal</p>
        <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900">Terms of Service</h1>

        <p className="text-slate-700 leading-relaxed">
          By using Silvexiar, you agree to the sale, shipping, and payment terms published on our platform.
        </p>
        <p className="text-slate-700 leading-relaxed">
          We operate as an intermediary between clients and suppliers to provide a secure and organized shopping experience.
        </p>
        <p className="text-slate-700 leading-relaxed">
          For legal or order-related questions: silvexiarstore@gmail.com
        </p>

        <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/about" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">About</Link>
          <Link href="/faq" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">FAQ</Link>
          <Link href="/policies" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">Policies</Link>
        </div>
      </div>
    </div>
  );
}
