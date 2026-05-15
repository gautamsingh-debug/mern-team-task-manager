export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-surface-200 dark:border-surface-800"></div>
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin absolute"></div>
        <div className="w-6 h-6 rounded-full bg-brand-500/20 dark:bg-brand-500/10 absolute animate-pulse"></div>
      </div>
      <span className="text-sm font-medium text-surface-500 dark:text-surface-400 animate-pulse">Loading...</span>
    </div>
  );
}
