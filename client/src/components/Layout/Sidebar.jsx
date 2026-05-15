import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuLayoutDashboard,
  LuFolderOpen,
  LuSquareCheck,
  LuUsers,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuSettings,
} from "react-icons/lu";
import useAuth from "../../hooks/useAuth";
import { cn } from "../../utils/helpers";

const navItems = [
  { path: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { path: "/projects", label: "Projects", icon: LuFolderOpen },
  { path: "/tasks", label: "Tasks", icon: LuSquareCheck },
  { path: "/team", label: "Team", icon: LuUsers, adminOnly: true },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter nav items based on role
  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-900/60 dark:bg-[#0b0f19]/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white/80 dark:bg-surface-950/80 backdrop-blur-2xl border-r border-surface-200 dark:border-surface-800/50 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-surface-100 dark:border-surface-800/50 h-[76px]">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <LuSquareCheck className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-surface-900 dark:text-white font-bold text-lg leading-tight tracking-tight">TaskFlow</h1>
                <p className="text-surface-500 dark:text-surface-400 text-[10px] font-bold uppercase tracking-widest">Workspace</p>
              </motion.div>
            )}
          </div>
          
          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-7 w-6 h-6 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full items-center justify-center text-surface-500 hover:text-brand-500 hover:border-brand-500 shadow-sm transition-all z-50"
          >
            {isCollapsed ? <LuChevronRight className="w-3 h-3" /> : <LuChevronLeft className="w-3 h-3" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-4 px-3">
              Menu
            </motion.div>
          )}
          {visibleNavItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-semibold"
                    : "text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-100"
                )
              }
              end={path === "/"}
              title={isCollapsed ? label : ""}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-brand-600 dark:text-brand-400" : "")} />
                  {!isCollapsed && (
                    <span className="truncate">{label}</span>
                  )}
                  {/* Active Indicator Line */}
                  {isActive && !isCollapsed && (
                    <motion.div layoutId="activeNavIndicator" className="absolute left-0 w-1 h-6 bg-brand-500 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-surface-100 dark:border-surface-800/50">
          {!isCollapsed ? (
            <div className="flex flex-col gap-2">
              <div
                onClick={() => {
                  navigate("/settings");
                  if (window.innerWidth < 1024) onClose();
                }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer border border-transparent hover:border-surface-200 dark:hover:border-surface-700"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-brand-200 dark:border-brand-800 shadow-sm" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-400 text-sm font-bold shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-surface-900 dark:text-surface-100 text-sm font-bold truncate">{user?.name}</p>
                  <p className="text-surface-500 dark:text-surface-400 text-[10px] uppercase tracking-wider font-semibold truncate">{user?.role}</p>
                </div>
                <LuSettings className="w-4 h-4 text-surface-400 hover:text-brand-500 transition-colors" />
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-500 hover:text-red-600 dark:text-surface-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-medium group"
              >
                <LuLogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-brand-200 dark:border-brand-800 cursor-pointer" title={user?.name} onClick={() => navigate("/settings")} />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-400 text-sm font-bold cursor-pointer" title={user?.name} onClick={() => navigate("/settings")}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <button onClick={logout} className="p-2 text-surface-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Sign Out">
                <LuLogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
