import { motion } from "framer-motion";
import { cn } from "../../utils/helpers";

export default function StatCard({ icon: Icon, label, value, color, trend, delay = 0 }) {
  const colorMap = {
    brand: "from-brand-500 to-brand-600 text-brand-500 shadow-brand-500/20",
    emerald: "from-emerald-400 to-emerald-600 text-emerald-500 shadow-emerald-500/20",
    amber: "from-amber-400 to-amber-600 text-amber-500 shadow-amber-500/20",
    rose: "from-rose-400 to-rose-600 text-rose-500 shadow-rose-500/20",
    blue: "from-blue-400 to-blue-600 text-blue-500 shadow-blue-500/20",
    purple: "from-purple-400 to-purple-600 text-purple-500 shadow-purple-500/20",
  };

  const bgGlow = {
    brand: "bg-brand-500/10",
    emerald: "bg-emerald-500/10",
    amber: "bg-amber-500/10",
    rose: "bg-rose-500/10",
    blue: "bg-blue-500/10",
    purple: "bg-purple-500/10",
  };

  const selectedColor = colorMap[color] || colorMap.brand;
  const glow = bgGlow[color] || bgGlow.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="relative group cursor-default"
    >
      <div className={cn("absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10", glow)} />
      
      <div className="glass-card p-6 h-full flex flex-col justify-between border border-surface-200/50 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600 transition-all duration-300 overflow-hidden relative">
        {/* Animated Background Orb */}
        <div className={cn("absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 mix-blend-screen", glow)} />

        <div className="flex items-start justify-between relative z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Icon className={cn("w-6 h-6", selectedColor.split(" ")[2])} />
          </div>
          {trend && (
            <span className={cn("text-xs font-bold px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800", trend.includes("+") ? "text-emerald-500" : "text-rose-500")}>
              {trend}
            </span>
          )}
        </div>

        <div className="mt-6 relative z-10">
          <motion.p 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight"
          >
            {value}
          </motion.p>
          <p className="text-sm font-semibold text-surface-500 dark:text-surface-400 mt-1">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
