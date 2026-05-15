import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuSquareCheck, LuEye, LuEyeOff, LuArrowRight, LuShieldCheck } from "react-icons/lu";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success("Account created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse bg-surface-50 dark:bg-[#080b12] transition-colors duration-300 font-sans">
      {/* Right Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-surface-950">
        <div className="absolute inset-0 bg-gradient-to-tl from-brand-900 via-surface-950 to-[#080b12] opacity-90 z-10" />

        {/* Animated decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-brand-500/20 blur-[120px]"
          />
        </div>

        <div className="relative z-20 flex flex-col justify-center p-20 xl:p-28 h-full text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4 mb-14">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                <LuSquareCheck className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight">TaskFlow</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              complete task <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-brand-400">faster together.</span>
            </h1>
            <p className="text-xl text-surface-300 font-medium max-w-lg leading-relaxed">
              Join modern teams who use TaskFlow to manage complex workflows with simplicity.
            </p>

            {/* Security notice */}
            <div className="mt-10 flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 max-w-md">
              <LuShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-surface-300 font-medium">
                New accounts are created as team members. Your workspace admin can upgrade your role.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Left Panel - Signup Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30">
              <LuSquareCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">TaskFlow</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-base font-medium">
              Start your journey to better productivity today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
                >
                  {showPassword ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Security info badge */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-surface-100 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl">
              <LuShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
                You'll be signed up as a <span className="font-bold text-surface-700 dark:text-surface-300">Team Member</span>. An admin can grant elevated access.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-base font-bold shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_10px_25px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-surface-500 dark:text-surface-400">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all">
              Log in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
