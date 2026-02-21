import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] py-14 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-12 space-y-8">
        <div>
          <p className="text-amber-700 text-xs font-black uppercase tracking-[0.3em] mb-2">About Silvexiar</p>
          <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900">Who We Are</h1>
        </div>

        <p className="text-slate-700 text-lg leading-relaxed">
          Silvexiar is an e-commerce platform that works as a bridge between clients and suppliers.
          We select products, organize processing, track orders, and make sure delivery is fast
          and secure to your address.
        </p>

        <p className="text-slate-700 text-lg leading-relaxed">
          Our mission is to simplify the full buying journey with transparency, safety, and active support,
          so your orders arrive in good condition and as quickly as possible.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-5">
            <h2 className="font-black text-slate-900 mb-2">Contact</h2>
            <a href="mailto:silvexiarstore@gmail.com" className="text-amber-700 font-bold">silvexiarstore@gmail.com</a>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <h2 className="font-black text-slate-900 mb-2">Need Help?</h2>
            <Link href="/faq" className="text-amber-700 font-bold">Visit FAQ</Link>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/faq" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">FAQ</Link>
          <Link href="/terms" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">Terms</Link>
          <Link href="/policies" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">Policies</Link>
          <Link href="/shop" className="px-4 py-2 rounded-full bg-black text-white">Shop</Link>
        </div>
      </div>
    </div>
  );
}
