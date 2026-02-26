"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, UserPlus, Loader2, Eye, EyeOff, Check } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to join");

      setShowPopup(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 * i, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tl from-cyan-500/10 to-transparent rounded-full blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 6, delay: 0.5 }}
      />

      {/* Success Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-green-500/20 to-emerald-500/20 rounded-2xl mx-auto mb-6"
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Check size={32} className="text-emerald-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#333333] text-center mb-3">
                Welcome to Silvexiar!
              </h2>
              <p className="text-[#6B7280] text-center mb-8">
                A verification link has been sent to your email. Please check
                your inbox to confirm your account.
              </p>
              <Link
                href="/login"
                className="w-full bg-linear-to-r from-[#1CA7A6] to-cyan-600 text-white py-4 rounded-xl font-bold text-center hover:shadow-lg transition-all"
              >
                Go to Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-md w-full z-10"
      >
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-100 backdrop-blur-xl">
          {/* Header */}
          <motion.div
            custom={0}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500/20 to-pink-500/20 rounded-2xl mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <UserPlus size={32} className="text-[#F2994A]" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-2">
              Join Silvexiar
            </h1>
            <p className="text-[#6B7280] text-sm">
              Create your account and start shopping
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <motion.div
              custom={1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="relative group"
            >
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1CA7A6] group-focus-within:scale-110 transition-transform"
                size={20}
              />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-12 rounded-xl outline-none focus:border-[#1CA7A6] focus:bg-white focus:shadow-lg focus:shadow-cyan-500/20 text-[#333333] placeholder:text-[#6B7280] transition-all duration-300 font-medium"
              />
            </motion.div>

            {/* Email Field */}
            <motion.div
              custom={2}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="relative group"
            >
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1CA7A6] group-focus-within:scale-110 transition-transform"
                size={20}
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-12 rounded-xl outline-none focus:border-[#1CA7A6] focus:bg-white focus:shadow-lg focus:shadow-cyan-500/20 text-[#333333] placeholder:text-[#6B7280] transition-all duration-300 font-medium"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              custom={3}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="relative group"
            >
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1CA7A6] group-focus-within:scale-110 transition-transform"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-12 pr-12 rounded-xl outline-none focus:border-[#1CA7A6] focus:bg-white focus:shadow-lg focus:shadow-cyan-500/20 text-[#333333] placeholder:text-[#6B7280] transition-all duration-300 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1CA7A6] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              custom={4}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-linear-to-r from-[#F2994A] to-orange-500 text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Create Account
                  <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold tracking-wide text-slate-500">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <motion.a
            custom={5}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            href="/api/auth/google?mode=signup"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full border-2 border-slate-200 bg-white text-[#333333] py-3.5 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </motion.a>

          {/* Login Link */}
          <motion.div
            custom={6}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 pt-6 border-t border-slate-200 text-center"
          >
            <p className="text-[#6B7280] text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#1CA7A6] hover:text-[#F2994A] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
