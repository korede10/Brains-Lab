import React, { useState } from 'react';
import { Sun, Moon, Bell, LogOut, BookOpen } from 'lucide-react';

interface NavbarProps {
  user: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export default function Navbar({ user, darkMode, setDarkMode, onLogout, onNavigate }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to EduExcel!', message: 'Start preparing for your WAEC & UTME exams.', isRead: false },
    { id: 2, title: 'Physics Practice Test Ready', message: 'Take the new Mechanics Practice Test to test your speed.', isRead: false }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('HOME')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-indigo-500/20">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gradient">Brains Lab</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">Academy</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-card">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-3">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                  <span className="font-semibold text-sm">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all as read
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs transition-colors ${
                        n.isRead ? 'bg-transparent text-muted-foreground' : 'bg-primary/5 text-foreground font-medium'
                      }`}
                    >
                      <div className="flex justify-between font-semibold">
                        <span>{n.title}</span>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-1 text-muted-foreground font-normal leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <div className="hidden text-right md:block">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider">{user.role}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <button
                onClick={() => onNavigate('LOGIN')}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('REGISTER')}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md shadow-indigo-500/20 transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
