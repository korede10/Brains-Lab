import React from 'react';
import { Home, LayoutDashboard, Brain, Award, ShieldAlert, GraduationCap } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  user: any;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ currentView, user, onNavigate }: SidebarProps) {
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const menuItems = [
    { id: 'HOME', label: 'All Courses', icon: Home },
    { id: 'AI_SOLVER', label: 'AI Solver', icon: Brain },
  ];

  if (user) {
    if (isAdmin) {
      menuItems.splice(1, 0, { id: 'ADMIN_DASHBOARD', label: 'Admin Panel', icon: ShieldAlert });
    } else {
      menuItems.splice(1, 0, { id: 'STUDENT_DASHBOARD', label: 'My Dashboard', icon: LayoutDashboard });
    }
  }

  return (
    <aside className="hidden w-64 border-r border-border bg-card/50 md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <div className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-indigo-500/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {user && !isAdmin && (
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/10">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <GraduationCap size={16} />
            <span>WAEC / UTME Mode</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Practice tests are fully pre-cached for offline access. Make sure to download modules before traveling!
          </p>
        </div>
      )}
    </aside>
  );
}
