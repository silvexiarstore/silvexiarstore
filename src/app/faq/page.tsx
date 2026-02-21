import Link from "next/link";

const faqs = [
  {
    q: "How do your orders work?",
    a: "We centralize products from suppliers, validate details, then track each order until delivery.",
  },
  {
    q: "Is delivery secure?",
    a: "Yes. We follow each step of the order to ensure reliable and secure delivery.",
  },
  {
    q: "Can I track my order status?",
    a: "Yes, from your account. You also receive emails whenever the status changes.",
  },
  {
    q: "How can I contact you?",
    a: "By email: silvexiarstore@gmail.com",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] py-14 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-12">
        <p className="text-amber-700 text-xs font-black uppercase tracking-[0.3em] mb-2">Support</p>
        <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-8">FAQ</h1>

        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="bg-slate-50 rounded-2xl p-5">
              <h2 className="font-black text-slate-900 mb-2">{item.q}</h2>
              <p className="text-slate-700">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-6 mt-8 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/about" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">About</Link>
          <Link href="/terms" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">Terms</Link>
          <Link href="/policies" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200">Policies</Link>
        </div>
      </div>
    </div>
  );
}
