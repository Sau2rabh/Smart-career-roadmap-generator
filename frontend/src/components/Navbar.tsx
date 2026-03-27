'use client';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, LogOut, Menu, X, LayoutDashboard, Map, Zap, MessageSquare, FolderGit2, TrendingUp, FileText, Mic, User, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/roadmap': 'My Roadmap',
  '/skill-gap': 'Skill Gap Analyzer',
  '/mentor': 'AI Career Mentor',
  '/projects': 'Project Recommendations',
  '/progress': 'Progress Tracker',
  '/resume': 'Resume Optimization',
  '/resume-builder': 'Resume Builder',
  '/interview': 'Mock Interview',
  '/setup': 'Profile Setup',
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roadmap', label: 'My Roadmap', icon: Map },
  { href: '/skill-gap', label: 'Skill Gap', icon: Zap },
  { href: '/mentor', label: 'AI Mentor', icon: MessageSquare },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/resume', label: 'Resume Optimization', icon: Sparkles },
  { href: '/resume-builder', label: 'Resume Builder', icon: FileText },
  { href: '/interview', label: 'Mock Interview', icon: Mic },
  { href: '/setup', label: 'Profile Setup', icon: User },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = routeLabels[pathname] || 'Smart Career Roadmap';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-background/80 backdrop-blur-md border-b border-border">
        {/* Title */}
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-muted text-foreground transition-colors" 
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-foreground truncate">{title}</h1>
            <p className="text-[10px] text-muted-foreground hidden sm:block truncate">
              {user?.name ? `Welcome back, ${user.name.split(' ')[0]} 👋` : ''}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-xl relative h-9 w-9 text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-purple-500 rounded-full ring-2 ring-background" />
          </Button>
          <div className="flex items-center gap-2 ml-1">
            <Avatar className="w-8 h-8 ring-2 ring-purple-500/20">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-foreground hidden md:block">{user?.name?.split(' ')[0]}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="rounded-xl h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-card border-r border-border z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-black text-sm text-foreground uppercase tracking-tight">Navigation</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="rounded-full h-8 w-8 hover:bg-muted">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1 py-6">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                  return (
                    <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                        isActive 
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20 shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}>
                        <Icon className={cn("w-5 h-5", isActive ? "text-purple-500" : "opacity-70")} />
                        {label}
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                  <Avatar className="w-10 h-10 ring-2 ring-purple-500/10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-foreground truncate">{user?.name || 'User'}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} className="ml-auto text-muted-foreground hover:text-destructive h-8 w-8">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
