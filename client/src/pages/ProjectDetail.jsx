import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuArrowLeft, LuPlus, LuTrash2, LuCalendar, LuSearch, LuFilter, LuUsers, LuUserPlus, LuUserMinus } from "react-icons/lu";
import toast from "react-hot-toast";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import Modal from "../components/ui/Modal";
import Loader from "../components/ui/Loader";
import Badge from "../components/ui/Badge";
import { formatDate, isOverdue, getInitials, cn } from "../utils/helpers";

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignee: "",
  });

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/project/${id}`),
        API.get("/auth/users"),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error("Failed to load project details");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/tasks", { ...newTask, project: id });
      setTasks([...tasks, data]);
      setIsTaskModalOpen(false);
      setNewTask({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", assignee: "" });
      toast.success("Task created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this entire project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await API.post(`/projects/${id}/members`, { userId: selectedUserId });
      toast.success("Member added to project");
      // refresh project
      const { data } = await API.get(`/projects/${id}`);
      setProject(data);
      setSelectedUserId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await API.delete(`/projects/${id}/members/${userId}`);
      toast.success("Member removed");
      const { data } = await API.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  if (loading) return <Loader />;

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Back & Breadcrumb */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
        <button
          onClick={() => navigate("/projects")}
          className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <LuArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-surface-400">Projects / <span className="text-surface-900 dark:text-white">{project?.name}</span></span>
      </motion.div>

      {/* Project Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative rounded-3xl overflow-hidden border border-surface-200 dark:border-surface-800 shadow-sm bg-white dark:bg-surface-900">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-600 to-purple-600">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>
        <div className="relative pt-20 px-6 sm:px-10 pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-950 border-4 border-white dark:border-surface-900 shadow-md flex items-center justify-center text-2xl font-bold text-brand-600 mb-4">
              {project?.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">{project?.name}</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-2xl font-medium">{project?.description || "No description provided."}</p>
            
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <LuUsers className="w-4 h-4 text-surface-400" />
                <span className="text-sm font-bold text-surface-600 dark:text-surface-300">{project?.members?.length || 0} Members</span>
              </div>
              {isAdmin && (
                <button onClick={() => setIsMemberModalOpen(true)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors flex items-center gap-1.5">
                  <LuUserPlus className="w-3.5 h-3.5" /> Manage Team
                </button>
              )}
            </div>
          </div>
          {isAdmin && (
            <button onClick={handleDeleteProject} className="shrink-0 px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-rose-100 dark:border-rose-800/50">
              <LuTrash2 className="w-4 h-4" /> Delete Project
            </button>
          )}
        </div>
      </motion.div>

      {/* Task Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
          Project Tasks <span className="text-xs px-2 py-1 bg-surface-200 dark:bg-surface-800 rounded-full text-surface-500 dark:text-surface-400">{filteredTasks.length}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-sm bg-white dark:bg-surface-900"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <LuFilter className="w-4 h-4 text-surface-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field w-auto py-2 text-sm bg-white dark:bg-surface-900"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {isAdmin && (
            <button onClick={() => setIsTaskModalOpen(true)} className="btn-primary py-2 shadow-brand-500/30 flex items-center gap-2 text-sm">
              <LuPlus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="glass-card overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-surface-500 dark:text-surface-400 font-medium">No tasks match your criteria.</p>
          </div>
        ) : (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="divide-y divide-surface-100 dark:divide-surface-800/50">
            {filteredTasks.map((task) => (
              <motion.div variants={itemVariants} key={task._id} className="p-4 sm:p-5 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-surface-900 dark:text-white truncate">{task.title}</h4>
                    {task.description && <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mt-1 line-clamp-1">{task.description}</p>}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Badge type="status" value={task.status} />
                      <Badge type="priority" value={task.priority} />
                      <span className={cn("text-xs font-bold flex items-center gap-1", isOverdue(task.dueDate, task.status) ? "text-rose-500" : "text-surface-400")}>
                        <LuCalendar className="w-3.5 h-3.5" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 sm:pl-4 sm:border-l border-surface-200 dark:border-surface-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-surface-400 hidden sm:block">Assignee:</span>
                      {task.assignee ? (
                        <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm" title={task.assignee.name}>
                          {getInitials(task.assignee.name)}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-800 border border-dashed border-surface-300 flex items-center justify-center" title="Unassigned">
                          <span className="text-[10px] text-surface-400 font-bold">?</span>
                        </div>
                      )}
                    </div>
                    
                    {(isAdmin || task.assignee?._id === user?._id) && (
                      <button onClick={() => handleDeleteTask(task._id)} className="text-surface-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="label-text">Title</label>
            <input type="text" required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="input-field" placeholder="Task title..." />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="input-field min-h-[80px]" placeholder="Optional description..." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Status</label>
              <select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })} className="select-field">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label-text">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="select-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Due Date</label>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-text">Assign To</label>
              <select value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} className="select-field">
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Task</button>
          </div>
        </form>
      </Modal>

      {/* Manage Members Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Manage Project Team">
        <div className="space-y-6">
          <form onSubmit={handleAddMember} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="label-text">Add New Member</label>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="select-field">
                <option value="">Select a user...</option>
                {users.filter(u => !project?.members?.some(m => m._id === u._id)).map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={!selectedUserId} className="btn-primary py-2.5 px-4 h-[42px] disabled:opacity-50">
              Add
            </button>
          </form>

          <div>
            <h4 className="text-sm font-bold text-surface-900 dark:text-white mb-3">Current Members</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {project?.members?.length === 0 ? (
                <p className="text-sm text-surface-500 dark:text-surface-400">No members in this project yet.</p>
              ) : (
                project?.members?.map(member => (
                  <div key={member._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-surface-900 dark:text-white leading-tight">{member.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{member.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleRemoveMember(member._id)} className="p-1.5 text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors" title="Remove member">
                        <LuUserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
