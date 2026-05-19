import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageWrapper from "../ui/PageWrapper";

const pageTitles = {
  "/": "Overview",
  "/projects": "Projects Workspace",
  "/tasks": "Task Management",
  "/team": "Team Management",
  "/settings": "Settings",
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith("/projects/")) return "Project Details";
    return pageTitles[location.pathname] || "TaskFlow";
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-[#05050a] text-surface-900 dark:text-surface-50 transition-colors duration-500 font-sans selection:bg-brand-500/30 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 dark:bg-brand-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex w-full h-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="lg:pl-[256px] flex flex-col min-h-screen transition-all duration-500 ease-in-out w-full">
          {/* Floating Navbar Container */}
          <div className="sticky top-0 z-30 pt-4 px-4 sm:px-6 lg:px-8">
            <Navbar onMenuClick={() => setSidebarOpen(true)} title={getTitle()} />
          </div>
          
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-[1600px] mx-auto relative">
            <PageWrapper key={location.pathname}>
              <Outlet />
            </PageWrapper>
          </main>
        </div>
      </div>
    </div>
  );
}
