import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuUsers,
  LuSearch,
  LuShieldCheck,
  LuUser,
  LuCalendar,
  LuFolderOpen,
  LuMail,
  LuFilter,
  LuTrash2,
  LuArrowUpDown,
} from "react-icons/lu";
import toast from "react-hot-toast";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import Modal from "../components/ui/Modal";
import { getInitials, cn } from "../utils/helpers";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// Avatar colors — deterministic from name
const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-sky-500 to-indigo-600",
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Team() {
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Role change modal
  const [roleTarget, setRoleTarget] = useState(null);
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }

    fetchMembers();
  }, [isAdmin, navigate]);

  const fetchMembers = async () => {
    try {
      const { data } = await API.get("/team");
      setMembers(data);
    } catch (err) {
      toast.error("Failed to load team data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/auth/users/${deleteTarget._id}`);
      setMembers((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      toast.success(`${deleteTarget.name} has been removed from the team.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user.");
    } finally {
      setDeleting(false);
    }
  };

  // Change user role
  const handleChangeRole = async () => {
    if (!roleTarget) return;
    const newRole = roleTarget.role === "admin" ? "member" : "admin";
    setChangingRole(true);
    try {
      const { data } = await API.put(`/auth/users/${roleTarget._id}/role`, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m._id === roleTarget._id ? { ...m, role: data.role } : m))
      );
      toast.success(`${roleTarget.name} is now a${newRole === "admin" ? "n admin" : " member"}.`);
      setRoleTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change role.");
    } finally {
      setChangingRole(false);
    }
  };

  if (loading) return <Loader />;

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = members.filter((m) => m.role === "admin").length;
  const memberCount = members.filter((m) => m.role === "member").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight flex items-center gap-3">
            <LuUsers className="text-brand-500 w-8 h-8" />
            Team Management
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 font-medium max-w-xl">
            Manage your workspace team. View all members, their roles, and project assignments.
          </p>
        </motion.div>

        {/* Stats Pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3 flex-wrap"
        >
          <div className="flex items-center gap-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 px-4 py-2 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="text-sm font-bold text-surface-700 dark:text-surface-300">{members.length} Total</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 px-4 py-2 rounded-full shadow-sm">
            <LuShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-sm font-bold text-surface-700 dark:text-surface-300">{adminCount} Admins</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 px-4 py-2 rounded-full shadow-sm">
            <LuUser className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-sm font-bold text-surface-700 dark:text-surface-300">{memberCount} Members</span>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full sm:max-w-md">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm bg-white dark:bg-surface-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <LuFilter className="w-4 h-4 text-surface-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-field w-auto py-2.5 text-sm bg-white dark:bg-surface-900"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="member">Members Only</option>
          </select>
        </div>
      </motion.div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-24 glass-card border-dashed"
        >
          <LuUsers className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">No members found</h2>
          <p className="text-surface-500 dark:text-surface-400 mt-2">
            {searchQuery || roleFilter !== "all"
              ? "Try adjusting your search or filter."
              : "No team members have joined yet."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredMembers.map((member) => {
            const gradient = avatarGradients[hashCode(member.name || member.email) % avatarGradients.length];
            const joinDate = new Date(member.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const isSelf = member._id === currentUser?._id;

            return (
              <motion.div
                key={member._id}
                variants={cardVariants}
                className="relative group"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-brand-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-xl hover:border-brand-500/30 dark:hover:border-brand-500/20 transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                  {/* Top accent */}
                  <div className={`h-16 w-full bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/5 rounded-full blur-lg transform -translate-x-1/3 translate-y-1/3" />

                    {/* Action buttons — top right */}
                    {!isSelf && (
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => setRoleTarget(member)}
                          className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                          title={`Change role to ${member.role === "admin" ? "member" : "admin"}`}
                        >
                          <LuArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="w-7 h-7 rounded-lg bg-red-500/30 backdrop-blur-sm hover:bg-red-500/60 flex items-center justify-center text-white transition-colors"
                          title="Remove from team"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Avatar — overlaps the gradient */}
                  <div className="px-5 -mt-8 relative z-10">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-surface-900"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg border-4 border-white dark:border-surface-900`}>
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>

                  <div className="p-5 pt-3">
                    {/* Name & Role Badge */}
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-base font-bold text-surface-900 dark:text-white truncate pr-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {member.name}
                        {isSelf && <span className="text-xs text-surface-400 font-medium ml-1">(You)</span>}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0",
                          member.role === "admin"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                        )}
                      >
                        {member.role === "admin" ? (
                          <span className="flex items-center gap-1">
                            <LuShieldCheck className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          "Member"
                        )}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <LuMail className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                      <span className="text-xs font-medium text-surface-500 dark:text-surface-400 truncate">
                        {member.email}
                      </span>
                    </div>

                    {/* Projects */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <LuFolderOpen className="w-3.5 h-3.5 text-surface-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                          Projects ({member.projects?.length || 0})
                        </span>
                      </div>
                      {member.projects && member.projects.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.projects.slice(0, 3).map((proj) => (
                            <span
                              key={proj._id}
                              className="text-[10px] font-bold px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 truncate max-w-[120px]"
                              title={proj.name}
                            >
                              {proj.name}
                            </span>
                          ))}
                          {member.projects.length > 3 && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                              +{member.projects.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-surface-400 dark:text-surface-500 italic">
                          No projects assigned
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-surface-100 dark:border-surface-800/50">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-surface-400">
                        <LuCalendar className="w-3.5 h-3.5" />
                        Joined {joinDate}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Team Member"
      >
        {deleteTarget && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl">
              <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white text-lg font-bold shrink-0">
                {getInitials(deleteTarget.name)}
              </div>
              <div>
                <p className="font-bold text-surface-900 dark:text-white">{deleteTarget.name}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{deleteTarget.email}</p>
              </div>
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
              Are you sure you want to remove <span className="font-bold">{deleteTarget.name}</span> from the team?
              This will also remove them from all project memberships. This action <span className="font-bold text-rose-600 dark:text-rose-400">cannot be undone</span>.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
              >
                <LuTrash2 className="w-4 h-4" />
                {deleting ? "Removing..." : "Remove User"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Role Change Confirmation Modal */}
      <Modal
        isOpen={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        title="Change User Role"
      >
        {roleTarget && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl">
              <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white text-lg font-bold shrink-0">
                {getInitials(roleTarget.name)}
              </div>
              <div>
                <p className="font-bold text-surface-900 dark:text-white">{roleTarget.name}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{roleTarget.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-4">
              <div className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold border",
                roleTarget.role === "admin"
                  ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                  : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50"
              )}>
                {roleTarget.role === "admin" ? "Admin" : "Member"}
              </div>
              <span className="text-surface-400 text-lg">→</span>
              <div className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold border",
                roleTarget.role === "admin"
                  ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50"
                  : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
              )}>
                {roleTarget.role === "admin" ? "Member" : "Admin"}
              </div>
            </div>

            <p className="text-sm text-surface-600 dark:text-surface-300 text-center">
              {roleTarget.role === "admin"
                ? `${roleTarget.name} will lose admin privileges and become a regular team member.`
                : `${roleTarget.name} will gain admin privileges and can manage projects, tasks, and team members.`}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setRoleTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={changingRole}
                className="btn-primary flex items-center gap-2"
              >
                <LuArrowUpDown className="w-4 h-4" />
                {changingRole ? "Changing..." : "Change Role"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
