import { getStatusColor, getPriorityColor, getStatusLabel } from "../../utils/helpers";

export default function Badge({ type, value }) {
  const baseClasses = "px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 shadow-sm";
  
  if (type === "status") {
    const colorClass = getStatusColor(value);
    return (
      <span className={`${baseClasses} ${colorClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {getStatusLabel(value)}
      </span>
    );
  }

  if (type === "priority") {
    const colorClass = getPriorityColor(value);
    return (
      <span className={`${baseClasses} ${colorClass}`}>
        {value.toUpperCase()}
      </span>
    );
  }

  return null;
}
