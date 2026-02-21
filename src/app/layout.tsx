// layout.tsx - Silvexiar Design System
"use client";

import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartSessionSync from "@/components/CartSessionSync";
import ScrollEnhancer from "@/components/ScrollEnhancer";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} app-shell antialiased`}
        suppressHydrationWarning
      >
        <CartSessionSync />
        <ScrollEnhancer />
        {!isAdminPage && <Navbar />}
        {!isAdminPage && <CartDrawer />}

        <main>{children}</main>

        {!isAdminPage && <Footer />}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#333333",
              border: "1px solid rgba(28, 167, 166, 0.3)",
              borderRadius: "12px",
              padding: "14px 20px",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            },
            className: "shadow-md",
          }}
        />
      </body>
    </html>
  );
}
