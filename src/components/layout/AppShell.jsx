import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* 1. Desktop Sidebar (Hamesha visible on large screens) */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar />
      </div>

      {/* 2. Mobile Sidebar (Slide-in Drawer) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={closeSidebar} 
          />
          {/* Sidebar Panel */}
          <div className="relative w-64 max-w-[80%] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar - Yahan humne onMenuClick prop pass kiya hai taake Topbar mein hamburger button kaam kare */}
        <Topbar onMenuClick={toggleSidebar} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Padding mobile par kam, desktop par zyada */}
          <div className="p-4 sm:p-6 max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}