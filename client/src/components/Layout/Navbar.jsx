import { useState, useRef, useEffect, useCallback } from "react";
import { LuMenu, LuSun, LuMoon, LuSearch, LuBell, LuCommand, LuCircleCheck, LuClock, LuFolderOpen, LuLayoutList, LuX } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import API from "../../api/axios";

export default function Navbar({ onMenuClick, title }) {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  // Search / Command Palette State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchModalRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K opens search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (!showSearch) {
      setSearchQuery("");
      setSearchResults({ tasks: [], projects: [] });
    }
  }, [showSearch]);

  // Debounced search
  const searchTimeout = useRef(null);
  const handleSearchInput = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setSearchResults({ tasks: [], projects: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          API.get("/tasks"),
          API.get("/projects"),
        ]);

        const query = value.toLowerCase();
        const filteredTasks = tasksRes.data
          .filter((t) => t.title.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query))
          .slice(0, 5);
        const filteredProjects = projectsRes.data
          .filter((p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query))
          .slice(0, 5);

        setSearchResults({ tasks: filteredTasks, projects: filteredProjects });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasResults = searchResults.tasks.length > 0 || searchResults.projects.length > 0;

  return (
    <>
      <header className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-xl border border-surface-200/50 dark:border-surface-700/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <LuMenu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100 truncate">
                {title}
              </h2>
            </div>

            {/* Search / Command Palette Trigger */}
            <div className="hidden md:flex flex-1 max-w-md ml-4">
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center justify-between w-full px-4 py-2 bg-surface-100/50 dark:bg-surface-950/50 hover:bg-surface-100 dark:hover:bg-surface-800 border border-transparent hover:border-surface-200 dark:hover:border-surface-700 rounded-xl text-sm text-surface-500 dark:text-surface-400 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <LuSearch className="w-4 h-4 text-surface-400 group-hover:text-brand-500 transition-colors" />
                  <span>Search tasks, projects...</span>
                </div>
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-[10px] font-medium text-surface-500 dark:text-surface-400 shadow-sm">
                    <LuCommand className="w-3 h-3 mr-0.5" /> K
                  </kbd>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile search button */}
            <button
              onClick={() => setShowSearch(true)}
              className="md:hidden p-2.5 rounded-xl text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              <LuSearch className="w-5 h-5" />
            </button>

            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors relative group"
              >
                <LuBell className="w-5 h-5 group-hover:animate-wiggle" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-surface-900 shadow-sm animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between bg-surface-50/50 dark:bg-surface-950/50">
                      <h3 className="font-bold text-surface-900 dark:text-white">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <LuBell className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                          <p className="text-sm text-surface-500">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification._id} 
                            onClick={() => markAsRead(notification._id)}
                            className={`p-4 border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-0.5 shrink-0 ${!notification.read ? 'text-brand-500' : 'text-surface-400'}`}>
                                {!notification.read ? <LuBell className="w-4 h-4" /> : <LuCircleCheck className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{notification.message}</p>
                                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 flex items-center gap-1">
                                  <LuClock className="w-3 h-3" /> {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50 text-center">
                      <button className="text-sm font-bold text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white transition-colors">Clear all</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-surface-500 hover:text-amber-500 dark:text-surface-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <LuSun className="w-5 h-5" /> : <LuMoon className="w-5 h-5" />}
            </button>

            <div className="h-8 w-px bg-surface-200 dark:bg-surface-800 mx-1"></div>

            {/* User Profile */}
            <button onClick={() => navigate("/settings")} className="flex items-center gap-2 pl-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <div className="hidden sm:block text-right mr-1">
                <p className="text-sm font-bold text-surface-900 dark:text-surface-100 leading-none">{user?.name}</p>
                <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shadow-md shadow-brand-500/20 border-2 border-white dark:border-surface-800" />
              ) : (
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20 border-2 border-white dark:border-surface-800">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search / Command Palette Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-surface-900/50 dark:bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSearch(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              ref={searchModalRef}
              className="w-full max-w-xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-100 dark:border-surface-800">
                <LuSearch className="w-5 h-5 text-surface-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search tasks, projects..."
                  className="flex-1 bg-transparent text-surface-900 dark:text-white placeholder-surface-400 text-base font-medium outline-none"
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                {isSearching && (
                  <div className="p-6 text-center">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-surface-500">Searching...</p>
                  </div>
                )}

                {!isSearching && searchQuery && !hasResults && (
                  <div className="p-8 text-center">
                    <LuSearch className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-surface-900 dark:text-white">No results found</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Try a different search term.</p>
                  </div>
                )}

                {!isSearching && hasResults && (
                  <div>
                    {/* Projects */}
                    {searchResults.projects.length > 0 && (
                      <div>
                        <div className="px-5 py-2 text-[10px] font-bold text-surface-400 uppercase tracking-widest bg-surface-50 dark:bg-surface-950/50">
                          Projects
                        </div>
                        {searchResults.projects.map((project) => (
                          <button
                            key={project._id}
                            onClick={() => {
                              navigate(`/projects/${project._id}`);
                              setShowSearch(false);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                              <LuFolderOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-surface-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">{project.name}</p>
                              <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{project.description || "No description"}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tasks */}
                    {searchResults.tasks.length > 0 && (
                      <div>
                        <div className="px-5 py-2 text-[10px] font-bold text-surface-400 uppercase tracking-widest bg-surface-50 dark:bg-surface-950/50">
                          Tasks
                        </div>
                        {searchResults.tasks.map((task) => (
                          <button
                            key={task._id}
                            onClick={() => {
                              navigate(`/projects/${task.project?._id || task.project}`);
                              setShowSearch(false);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left group"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              task.status === "done" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                              task.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/30" :
                              "bg-amber-100 dark:bg-amber-900/30"
                            }`}>
                              <LuLayoutList className={`w-4 h-4 ${
                                task.status === "done" ? "text-emerald-600 dark:text-emerald-400" :
                                task.status === "in-progress" ? "text-blue-600 dark:text-blue-400" :
                                "text-amber-600 dark:text-amber-400"
                              }`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-surface-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">{task.title}</p>
                              <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                                {task.project?.name || "Project"} • {task.status}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!searchQuery && (
                  <div className="p-8 text-center">
                    <LuCommand className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Start typing to search tasks and projects.</p>
                    <p className="text-xs text-surface-400 mt-1">Press <kbd className="px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-[10px] font-bold">ESC</kbd> to close</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
