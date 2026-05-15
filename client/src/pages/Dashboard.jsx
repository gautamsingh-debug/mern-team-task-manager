import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuLayoutList,
  LuCircleCheck,
  LuCircleAlert,
  LuClock,
  LuFolderOpen,
  LuZap,
  LuTrendingUp,
  LuCalendar,
  LuX,
  LuUser,
} from "react-icons/lu";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import StatCard from "../components/Dashboard/StatCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import Badge from "../components/ui/Badge";
import Loader from "../components/ui/Loader";
import Modal from "../components/ui/Modal";
import { formatDate, isOverdue, getInitials } from "../utils/helpers";

// Time-aware greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const animFrame = useRef(null);

  useEffect(() => {
    if (typeof target !== "number" || target === 0) {
      setValue(target || 0);
      return;
    }

    startTime.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate);
      }
    };

    animFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [target, duration]);

  return value;
}

function AnimatedNumber({ value }) {
  const animated = useCountUp(value);
  return <>{animated}</>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Task detail modal
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    API.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    { icon: LuLayoutList, label: "Total Tasks", value: stats?.totalTasks || 0, color: "brand" },
    { icon: LuCircleCheck, label: "Completed", value: stats?.completedTasks || 0, color: "emerald", trend: stats?.completedTasks > 0 ? `${stats.completedTasks} done` : "" },
    { icon: LuCircleAlert, label: "Overdue", value: stats?.overdueTasks || 0, color: "rose", trend: stats?.overdueTasks > 0 ? "Requires attention" : "" },
    { icon: LuClock, label: "In Progress", value: stats?.inProgressTasks || 0, color: "amber" },
  ];

  const completionRate = stats?.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Personalized Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 font-medium max-w-xl">
            {user?.role === "admin" 
              ? `Here's what's happening in your workspace today. Your team has ${stats?.todoTasks || 0} tasks to do and ${stats?.completedTasks || 0} completed.` 
              : `Here are your tasks for today. You have ${stats?.todoTasks || 0} tasks to do and ${stats?.completedTasks || 0} completed.`}
          </p>
        </motion.div>
        
        {user?.role === "admin" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center gap-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-2 pl-4 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-surface-700 dark:text-surface-300 pr-2">Workspace Online</span>
          </motion.div>
        )}
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Productivity Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <LuTrendingUp className="w-5 h-5 text-brand-500" />
                {user?.role === "admin" ? "Workspace Productivity" : "Personal Productivity"}
              </h3>
              <select className="select-field w-auto py-1.5 text-xs bg-surface-50 dark:bg-surface-950">
                <option>Last 7 Days</option>
              </select>
            </div>
            <ProductivityChart data={stats?.chartData || []} />
          </motion.div>

          {/* Recent Tasks */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">Recent Activity</h3>
              <button
                onClick={() => navigate("/tasks")}
                className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                View All →
              </button>
            </div>
            
            {stats?.recentTasks?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTasks.map((task, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 + (i * 0.1) }}
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-surface-200 dark:hover:border-surface-700/50 bg-surface-50/50 dark:bg-surface-800/30 hover:bg-white dark:hover:bg-surface-900/80 hover:shadow-lg hover:shadow-surface-200/50 dark:hover:shadow-black/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                        task.status === "done" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                        task.status === "in-progress" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : 
                        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        <LuCircleCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-surface-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mt-1 truncate">
                          in <span className="font-bold text-surface-700 dark:text-surface-300">{task.project?.name}</span> • assigned to {task.assignee?.name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <Badge type="status" value={task.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl">
                <LuLayoutList className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">No recent activity.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Side panels */}
        <div className="space-y-8">

          {/* Task Distribution Ring */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card p-6">
            <h3 className="text-base font-bold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
              <LuZap className="w-5 h-5 text-amber-500" />
              Quick Stats
            </h3>
            
            {/* Completion Rate Ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" className="stroke-surface-100 dark:stroke-surface-800" strokeWidth="10" />
                  <motion.circle
                    cx="64" cy="64" r="56" fill="none"
                    className="stroke-brand-500"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - completionRate / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-surface-900 dark:text-white">
                    <AnimatedNumber value={completionRate} />%
                  </span>
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Complete</span>
                </div>
              </div>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-3">
              {[
                { label: "To Do", value: stats?.todoTasks || 0, color: "bg-surface-400", total: stats?.totalTasks },
                { label: "In Progress", value: stats?.inProgressTasks || 0, color: "bg-blue-500", total: stats?.totalTasks },
                { label: "Completed", value: stats?.completedTasks || 0, color: "bg-emerald-500", total: stats?.totalTasks },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-surface-600 dark:text-surface-300">{item.label}</span>
                    <span className="text-surface-500 dark:text-surface-400">
                      <AnimatedNumber value={item.value} />
                    </span>
                  </div>
                  <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`${item.color} h-1.5 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : "0%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuFolderOpen className="w-4 h-4 text-surface-400" />
                <span className="text-xs font-bold text-surface-500 dark:text-surface-400">Projects</span>
              </div>
              <span className="text-sm font-extrabold text-surface-900 dark:text-white">
                <AnimatedNumber value={stats?.totalProjects || 0} />
              </span>
            </div>
          </motion.div>

          {/* Action Required / Overdue */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="glass-card p-6 border-t-4 border-t-rose-500 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl z-0" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <LuCircleAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-surface-900 dark:text-white">Action Required</h3>
              </div>
              
              {stats?.overdueTasks > 0 ? (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl p-4">
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                    You have <span className="text-rose-600 dark:text-rose-400 text-lg mx-1">{stats.overdueTasks}</span> overdue tasks.
                  </p>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="mt-3 w-full py-2 bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    Review Tasks
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <LuCircleCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">All caught up!</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Task Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
      >
        {selectedTask && (
          <div className="space-y-5">
            {/* Title */}
            <div>
              <h3 className="text-xl font-bold text-surface-900 dark:text-white">{selectedTask.title}</h3>
              {selectedTask.description && (
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">{selectedTask.description}</p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge type="status" value={selectedTask.status} />
              <Badge type="priority" value={selectedTask.priority} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-100 dark:border-surface-800/50">
              <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Project</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">{selectedTask.project?.name || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Assignee</p>
                <div className="flex items-center gap-2">
                  {selectedTask.assignee ? (
                    <>
                      <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center text-white text-[10px] font-bold">
                        {getInitials(selectedTask.assignee.name)}
                      </div>
                      <span className="text-sm font-bold text-surface-900 dark:text-white">{selectedTask.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-surface-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Due Date</p>
                <p className={`text-sm font-bold flex items-center gap-1.5 ${isOverdue(selectedTask.dueDate, selectedTask.status) ? "text-rose-500" : "text-surface-900 dark:text-white"}`}>
                  <LuCalendar className="w-3.5 h-3.5" />
                  {formatDate(selectedTask.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">{formatDate(selectedTask.createdAt)}</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-surface-100 dark:border-surface-800/50">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  navigate(`/projects/${selectedTask.project?._id}`);
                }}
                className="btn-primary w-full"
              >
                Open in Project →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
