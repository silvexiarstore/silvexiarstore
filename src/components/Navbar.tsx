"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Heart,
  User,
  ChevronDown,
  RefreshCcw,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Navbar() {
  const { toggleCart, items } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };

    const loadWishlistCount = async () => {
      try {
        const res = await fetch("/api/user/wishlist");
        const data = await res.json();
        setWishlistCount(Number(data?.count || 0));
      } catch {
        setWishlistCount(0);
      }
    };

    loadCategories();
    loadWishlistCount();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
      setIsMobileOpen(false);
    }
  };

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/returns", label: "Returns" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[var(--shadow-md)] border-b border-[var(--border)]"
            : "bg-white border-b border-[var(--border)]"
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-[var(--color-primary)] text-white text-center py-2 text-[11px] md:text-xs font-medium tracking-wide">
          Discover Our New Products 
          {/* Discover Our Products - Use Code{" "} */}
          {/* <span className="font-bold text-white">SILVEX10</span> for 10% off */}
        </div>

        {/* Main Nav */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="relative h-14 md:h-16 flex items-center justify-between">
            {/* Left: Hamburger + Nav */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen((v) => !v)}
                className="lg:hidden w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1 ml-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all duration-200 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] ${
                      pathname === link.href
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute left-3.5 bottom-1 h-[2px] bg-[var(--color-primary)] transition-all duration-300 ${
                        pathname === link.href
                          ? "w-[calc(100%-28px)]"
                          : "w-0 group-hover:w-[calc(100%-28px)]"
                      }`}
                    />
                  </Link>
                ))}

                {/* Categories Dropdown */}
                <div className="relative group/nav">
                  <button className="relative flex items-center gap-1 px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200">
                    Categories{" "}
                    <ChevronDown
                      size={13}
                      className="opacity-50 group-hover/nav:rotate-180 transition-transform duration-200"
                    />
                  </button>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 translate-y-1 group-hover/nav:translate-y-0">
                    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-1.5 min-w-[200px] shadow-[var(--shadow-lg)]">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.slug}`}
                          className="block px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-150"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      {categories.length === 0 && (
                        <p className="px-3.5 py-2.5 text-sm text-[var(--text-muted)]">
                          No categories yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10"
              aria-label="Silvexiar home"
            >
              <div className="w-8 h-8 rounded-md bg-(--color-primary) flex items-center justify-center shadow-(--shadow-sm)">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="hidden md:block text-[15px] font-bold tracking-[0.18em] text-(--text-primary)">
                SILVEXIAR
              </span>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link
                href="/account/wishlist"
                className="relative w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account"
                className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              <Link
                href="/returns"
                className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                aria-label="Returns and complaints"
              >
                <RefreshCcw size={17} />
              </Link>

              <button
                onClick={toggleCart}
                className="relative w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white flex items-center justify-center shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-dark)] hover:scale-[1.02] hover:shadow-[var(--shadow-md)] transition-all duration-200"
                aria-label="Cart"
              >
                <ShoppingBag size={17} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        {categories.length > 0 && (
          <div className="border-t border-[var(--border)] bg-white/95">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
              <div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:bg-[var(--color-accent-dark)] hover:shadow-[var(--shadow-md)]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0.9, 0.3, 1] }}
              className="border-t border-[var(--border)] bg-white overflow-hidden"
            >
              <div className="max-w-2xl mx-auto px-4 py-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    placeholder="Search products, categories..."
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-lg)] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)] placeholder:text-[var(--text-muted)] transition-all duration-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 bg-black/30 z-50"
                onClick={() => setIsMobileOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3, ease: [0.2, 0.9, 0.3, 1] }}
                className="lg:hidden fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white border-l border-[var(--border)] shadow-[var(--shadow-xl)] z-50 overflow-y-auto"
              >
                <div className="px-5 py-5 space-y-5">
                  {/* Close */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsMobileOpen(false)}
                      className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-200"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-lg)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-muted)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </form>

                  {/* Mobile Nav Links */}
                  <div className="space-y-0.5">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`block px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 ${
                          pathname === link.href
                            ? "text-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                            : "text-[var(--text-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Categories */}
                  {categories.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2 px-4">
                        Categories
                      </p>
                      <div className="space-y-0.5">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setIsMobileOpen(false)}
                            className="block px-4 py-2.5 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all duration-150"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile CTA */}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <Link
                      href="/shop"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-[var(--color-accent)] text-white py-3 rounded-[var(--radius-lg)] font-semibold text-sm shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-dark)] transition-all duration-200"
                    >
                      <ShoppingBag size={16} />
                      Shop Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header */}
      <div
        className={categories.length > 0 ? "h-[126px] md:h-[132px]" : "h-[88px] md:h-[94px]"}
        suppressHydrationWarning
      />
    </>
  );
}
