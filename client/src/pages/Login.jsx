import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuSquareCheck, LuEye, LuEyeOff, LuArrowRight } from "react-icons/lu";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-[#080b12] transition-colors duration-300 font-sans">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-surface-950">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-surface-950 to-[#080b12] opacity-90 z-10" />
        
        {/* Animated decorative shapes using Framer Motion */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div 
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-500/30 blur-[100px]" 
          />
          <motion.div 
            animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]" 
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
              Focus on what <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-purple-400">matters most.</span>
            </h1>
            <p className="text-xl text-surface-300 font-medium max-w-lg leading-relaxed">
              The premium workspace for teams to collaborate, plan, and execute projects seamlessly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-12 lg:hidden">
            <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30">
              <LuSquareCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">TaskFlow</span>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-3 text-base font-medium">
              Log in to your workspace to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium"
                placeholder="name@company.com"
                required
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-surface-700 dark:text-surface-300">Password</label>
                <a href="#" className="text-brand-600 dark:text-brand-400 text-xs font-bold hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium"
                  placeholder="••••••••"
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-base font-bold shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_10px_25px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Continue to Workspace"}
              {!loading && <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-surface-500 dark:text-surface-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
