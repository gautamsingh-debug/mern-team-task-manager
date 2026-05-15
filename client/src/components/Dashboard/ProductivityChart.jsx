import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../../context/ThemeContext";

export default function ProductivityChart({ data = [] }) {
  const { isDarkMode } = useTheme();

  const colors = useMemo(() => {
    return isDarkMode
      ? { grid: "#1e293b", text: "#64748b", line: "#8b5cf6", fill: "url(#colorTasksDark)" }
      : { grid: "#f1f5f9", text: "#94a3b8", line: "#6366f1", fill: "url(#colorTasksLight)" };
  }, [isDarkMode]);

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl">
        <p className="text-surface-500 dark:text-surface-400 font-medium">No activity data available.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTasksLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTasksDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: colors.text, fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: colors.text, fontSize: 12 }} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
              borderRadius: "12px",
              border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              color: isDarkMode ? "#f8fafc" : "#0f172a",
            }}
            itemStyle={{ color: isDarkMode ? "#f8fafc" : "#0f172a", fontWeight: "bold" }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke={colors.line}
            strokeWidth={3}
            fillOpacity={1}
            fill={colors.fill}
            activeDot={{ r: 6, strokeWidth: 0, fill: colors.line }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
