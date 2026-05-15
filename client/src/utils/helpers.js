import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Ensure other helpers remain intact
export function getStatusColor(status) {
  switch (status) {
    case "todo":
      return "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300 border border-surface-200 dark:border-surface-700";
    case "in-progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50";
    case "done":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50";
    default:
      return "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400";
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case "todo":
      return "To Do";
    case "in-progress":
      return "In Progress";
    case "done":
      return "Done";
    default:
      return status;
  }
}

export function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50";
    case "medium":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50";
    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50";
    default:
      return "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400";
  }
}

export function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
}

export function getInitials(name) {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}
