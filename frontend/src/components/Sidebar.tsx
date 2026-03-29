'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Zap, MessageSquare, FolderGit2,
  TrendingUp, FileText, Mic, User, ChevronLeft, Sparkles, Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative hidden md:flex flex-col h-screen sidebar-glass flex-shrink-0"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-inherit">
        {/* Decorative Blur Blobs */}
        <div className="absolute -top-24 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-32 w-56 h-56 bg-indigo-600/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-pink-600/15 rounded-full blur-[100px]" />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50 group cursor-pointer relative z-10 backdrop-blur-sm">
        <motion.div 
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Compass className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-xs leading-tight tracking-tight flex flex-col"
            >
              <span className="text-foreground/90">Smart Career</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 font-black text-sm uppercase tracking-wider">Roadmap</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto relative z-10 scrollbar-hide">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2, backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'sidebar-item group relative',
                  isActive && 'sidebar-item-active',
                  collapsed && 'justify-center px-0 w-12 mx-auto'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-purple-500" : "text-muted-foreground group-hover:text-purple-400")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="font-medium"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-purple-500/5 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors z-10"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.div>
      </button>
    </motion.aside>
  );
}
