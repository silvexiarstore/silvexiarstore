import Link from "next/link";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] py-14 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-12 space-y-6">
        <p className="text-amber-700 text-xs font-black uppercase tracking-[0.3em]">Policies</p>
        <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900">Privacy & Policies</h1>

        <p className="text-slate-700 leading-relaxed">
          We protect your personal data and only use the information required for processing, delivery, and support.
        </p>
        <p className="text-slate-700 leading-relaxed">
          We work with verified suppliers and apply control steps so your orders arrive safely and as quickly as possible.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Official contact: <a className="text-amber-700 font-bold" href="mailto:silvexiarstore@gmail.com">silvexiarstore@gmail.com</a>
        </p>

        <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/about" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">About</Link>
          <Link href="/faq" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">FAQ</Link>
          <Link href="/terms" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">Terms</Link>
        </div>
      </div>
    </div>
  );
}
