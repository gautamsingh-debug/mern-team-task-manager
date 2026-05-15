import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuFolderOpen, LuPlus, LuEllipsisVertical, LuUsers, LuCalendar } from "react-icons/lu";
import toast from "react-hot-toast";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import Modal from "../components/ui/Modal";
import Loader from "../components/ui/Loader";
import { formatDate, getInitials } from "../utils/helpers";

// Static gradient array — Tailwind purges dynamic classes, so we must use real static strings
const cardGradients = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-sky-500 to-blue-600",
];

// Deterministic pseudo-random from string — avoids Math.random() re-render flicker
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects");
      setProjects(data);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/projects", {
        name: newProjectName,
        description: newProjectDesc,
      });
      setProjects([...projects, data]);
      setNewProjectName("");
      setNewProjectDesc("");
      setIsModalOpen(false);
      toast.success("Project created successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight flex items-center gap-3">
            <LuFolderOpen className="text-brand-500 w-8 h-8" /> {isAdmin ? "Projects Workspace" : "My Projects"}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 font-medium">
            {isAdmin 
              ? `Manage your teams and task workflows across ${projects.length} active projects.`
              : `View and access the ${projects.length} projects you are currently assigned to.`}
          </p>
        </motion.div>
        {isAdmin && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => setIsModalOpen(true)}
            className="btn-primary shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_10px_25px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <LuPlus className="w-5 h-5" /> Create Project
          </motion.button>
        )}
      </div>

      {projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center py-24 glass-card border-dashed">
          <LuFolderOpen className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">No projects yet</h2>
          <p className="text-surface-500 dark:text-surface-400 mt-2">Get started by creating your first project.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project, i) => {
            const gradient = cardGradients[hashCode(project._id) % cardGradients.length];
            const memberCount = project.members?.length || 0;
            // Deterministic progress based on project ID — stable across re-renders
            const progress = (hashCode(project._id + "progress") % 60) + 20;

            return (
              <motion.div variants={itemVariants} key={project._id} className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-brand-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                
                <Link
                  to={`/projects/${project._id}`}
                  className="block h-full bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-xl hover:border-brand-500/50 dark:hover:border-brand-500/30 transition-all duration-300 group-hover:-translate-y-1.5 overflow-hidden flex flex-col"
                >
                  {/* Cover Gradient — uses static classes */}
                  <div className={`h-24 w-full bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-surface-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {project.name}
                      </h3>
                      <button className="text-surface-400 hover:text-surface-900 dark:hover:text-white p-1 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors shrink-0" onClick={(e) => e.preventDefault()}>
                        <LuEllipsisVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-6 line-clamp-2 flex-1">
                      {project.description || "No description provided."}
                    </p>

                    {/* Progress Bar — deterministic from project ID */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-surface-600 dark:text-surface-300">Progress</span>
                        <span className="text-brand-600 dark:text-brand-400">{progress}%</span>
                      </div>
                      <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-800/50">
                      <div className="flex items-center text-xs font-bold text-surface-500 dark:text-surface-400 gap-1">
                        <LuCalendar className="w-4 h-4" />
                        {formatDate(project.createdAt)}
                      </div>
                      
                      {/* Real Member Avatars */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 relative z-10">
                          {(project.members || []).slice(0, 3).map((member, index) => (
                            <div key={member._id || index} className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-900 bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-[8px] font-bold text-brand-700 dark:text-brand-400" title={member.name}>
                              {getInitials(member.name)}
                            </div>
                          ))}
                        </div>
                        {memberCount > 3 && (
                          <span className="text-[10px] font-bold text-surface-400">+{memberCount - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="label-text">Project Name</label>
            <input
              type="text"
              required
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="input-field"
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="What is this project about?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
