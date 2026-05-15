import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  LuSettings,
  LuUser,
  LuMail,
  LuShieldCheck,
  LuCamera,
  LuSave,
  LuLock,
  LuEye,
  LuEyeOff,
  LuCalendar,
  LuTrash2,
} from "react-icons/lu";
import toast from "react-hot-toast";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import { getInitials } from "../utils/helpers";

export default function Settings() {
  const { user, updateUser } = useAuth();

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    // Validate file size (200KB max)
    if (file.size > 200 * 1024) {
      toast.error("Image is too large. Please use an image under 200KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setProfileSaving(true);
    try {
      const { data } = await API.put("/auth/profile", {
        name: name.trim(),
        avatar: avatarPreview,
      });
      updateUser(data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight flex items-center gap-3">
          <LuSettings className="text-brand-500 w-8 h-8" />
          Settings
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-2 font-medium">
          Manage your profile, avatar, and account security.
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800/50 bg-surface-50/50 dark:bg-surface-900/50">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <LuUser className="w-5 h-5 text-brand-500" />
            Profile Information
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Update your personal details and profile picture.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-surface-800 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl gradient-brand flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-surface-800 shadow-lg">
                  {getInitials(user?.name)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 transition-colors"
              >
                <LuCamera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-surface-900 dark:text-white">Profile Picture</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">JPG, PNG or GIF. Max 200KB.</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                >
                  Upload new
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-1"
                  >
                    <LuTrash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label-text flex items-center gap-1.5">
              <LuUser className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email — read-only */}
          <div>
            <label className="label-text flex items-center gap-1.5">
              <LuMail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              className="input-field opacity-60 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-surface-400 mt-1 ml-1">Email cannot be changed.</p>
          </div>

          {/* Role — read-only */}
          <div>
            <label className="label-text flex items-center gap-1.5">
              <LuShieldCheck className="w-3.5 h-3.5" /> Role
            </label>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border ${
                user?.role === "admin"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
              }`}>
                <LuShieldCheck className="w-4 h-4" />
                {user?.role === "admin" ? "Workspace Admin" : "Team Member"}
              </span>
            </div>
            <p className="text-xs text-surface-400 mt-1 ml-1">Role is managed by workspace admins.</p>
          </div>

          {/* Account created date */}
          <div className="flex items-center gap-2 text-xs font-medium text-surface-400 pt-2 border-t border-surface-100 dark:border-surface-800/50">
            <LuCalendar className="w-3.5 h-3.5" />
            Account created {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "recently"}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="btn-primary flex items-center gap-2"
            >
              <LuSave className="w-4 h-4" />
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Change Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800/50 bg-surface-50/50 dark:bg-surface-900/50">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <LuLock className="w-5 h-5 text-brand-500" />
            Change Password
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handleChangePassword} className="p-6 space-y-5">
          {/* Current Password */}
          <div>
            <label className="label-text">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
              >
                {showCurrentPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label-text">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
              >
                {showNewPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="label-text">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm new password"
              required
              minLength={6}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">Passwords don't match.</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving || (confirmPassword && newPassword !== confirmPassword)}
              className="btn-primary flex items-center gap-2"
            >
              <LuLock className="w-4 h-4" />
              {passwordSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
