import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft } from "react-icons/lu";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-[#080b12] p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-9xl font-extrabold gradient-text mb-4 leading-none"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-surface-700 dark:text-surface-300 mb-2 font-bold"
        >
          Page Not Found
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-surface-500 dark:text-surface-400 mb-8 font-medium"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <LuArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
