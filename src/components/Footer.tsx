"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  ShieldCheck,
  FileText,
  HelpCircle,
  Info,
  Scale,
  RefreshCcw,
  ArrowUpRight,
} from "lucide-react";

const PAYMENT_METHODS = [
  { name: "PayPal", src: "https://cdn.webfastcdn.com/image/payment/Paypal.svg" },
  { name: "American Express", src: "https://cdn.webfastcdn.com/image/payment/American_Express.svg" },
  { name: "Visa", src: "https://cdn.webfastcdn.com/image/payment/Visa.svg" },
  { name: "Discover", src: "https://cdn.webfastcdn.com/image/payment/Discover.svg" },
  { name: "Mastercard", src: "https://cdn.webfastcdn.com/image/payment/Mastercard.svg" },
  { name: "Diners Club", src: "https://cdn.webfastcdn.com/image/payment/Diners_Club.svg" },
  { name: "Klarna", src: "https://cdn.webfastcdn.com/image/payment/Klarna.svg" },
];

const footerLinks = {
  company: [
    { href: "/about", label: "About", icon: Info },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/shop", label: "Shop", icon: ShieldCheck },
    { href: "/returns", label: "Returns", icon: RefreshCcw },
  ],
  legal: [
    { href: "/terms", label: "Terms", icon: Scale },
    { href: "/policies", label: "Policies", icon: FileText },
    { href: "/returns", label: "Return Policy", icon: RefreshCcw },
    { href: "/faq", label: "Support", icon: HelpCircle },
  ],
  account: [
    { href: "/account/orders", label: "My Orders" },
    { href: "/account/wishlist", label: "My Wishlist" },
    { href: "/account/addresses", label: "My Addresses" },
  ],
};

export default function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingNewsletter, setLoadingNewsletter] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [guestSuccess, setGuestSuccess] = useState(false);

  useEffect(() => {
    const loadNewsletterStatus = async () => {
      try {
        const sessionRes = await fetch("/api/newsletter");
        const sessionData = await sessionRes.json();

        const authenticated = Boolean(sessionData?.authenticated);
        setIsAuthenticated(authenticated);
        setIsSubscribed(Boolean(sessionData?.subscribed));
        if (sessionData?.email) {
          setEmail(String(sessionData.email));
        }
      } catch {
        setIsAuthenticated(false);
        setIsSubscribed(false);
      } finally {
        setLoadingNewsletter(false);
      }
    };

    loadNewsletterStatus();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGuestSuccess(false);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Subscription failed.");
        return;
      }

      toast.success("Subscription successful.");
      if (isAuthenticated) {
        setIsSubscribed(true);
      } else {
        setGuestSuccess(true);
      }
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0F3D3D] text-white mt-0">
      <div className="bg-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[var(--radius-2xl)] p-8 md:p-12 shadow-(--shadow-lg) border border-[var(--border)]"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-(--color-primary) mb-2">Stay in the loop</h3>
                <p className="text-(--text-muted) text-sm">Get notified whenever a new product is published.</p>
              </div>

              {loadingNewsletter ? (
                <div className="text-sm text-(--text-muted)">Loading...</div>
              ) : isAuthenticated && isSubscribed ? (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                  <Mail size={15} /> You are subscribed to our latest updates.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full sm:w-72 bg-white border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-(--color-accent) text-white font-semibold text-sm shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-dark)] hover:scale-[1.02] hover:shadow-[var(--shadow-md)] transition-all duration-200 disabled:opacity-60"
                  >
                    <Mail size={15} /> {submitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
              )}
            </div>

            {!isAuthenticated && guestSuccess && (
              <p className="mt-4 text-sm text-emerald-700 font-medium">Subscription active. You will receive new product emails.</p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">SILVEXIAR</h2>
            </div>
            <p className="text-white text-sm leading-relaxed">
              We are a trusted bridge between clients and suppliers. Your products arrive safely and fast.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:silvexiarstore@gmail.com"
                className="inline-flex items-center gap-2 text-white/75 text-sm hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                <Mail size={14} className="text-[var(--color-primary)]" />
                silvexiarstore@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-[0.12em] text-white/50 mb-5">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-[var(--color-accent)] text-sm inline-flex items-center gap-2 transition-colors duration-200"
                  >
                    <link.icon size={14} className="text-[var(--color-primary)] opacity-60" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-[0.12em] text-white/50 mb-5">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-[var(--color-accent)] text-sm inline-flex items-center gap-2 transition-colors duration-200"
                  >
                    <link.icon size={14} className="text-[var(--color-primary)] opacity-60" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-[0.12em] text-white/50 mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-[var(--color-accent)] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-5">
          <p className="text-xs text-white">&copy; {new Date().getFullYear()} Silvexiar Store. All rights reserved.</p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {PAYMENT_METHODS.map((payment) => (
              <img
                key={payment.name}
                src={payment.src}
                alt={payment.name}
                width={32}
                height={22}
                loading="lazy"
                className="w-15 h-10 object-contain rounded-sm p-0.5 bg-white/90 hover:scale-110 transition-transform duration-200"
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/about" className="text-white/50 hover:text-[var(--color-accent)] transition-colors duration-200">
              About
            </Link>
            <Link href="/faq" className="text-white/50 hover:text-[var(--color-accent)] transition-colors duration-200">
              FAQ
            </Link>
            <Link href="/terms" className="text-white/50 hover:text-[var(--color-accent)] transition-colors duration-200">
              Terms
            </Link>
            <Link href="/policies" className="text-white/50 hover:text-[var(--color-accent)] transition-colors duration-200">
              Policies
            </Link>
            <Link href="/returns" className="text-white/50 hover:text-[var(--color-accent)] transition-colors duration-200">
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}