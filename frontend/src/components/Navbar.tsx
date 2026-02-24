'use client';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/roadmap': 'My Roadmap',
  '/skill-gap': 'Skill Gap Analyzer',
  '/mentor': 'AI Career Mentor',
  '/projects': 'Project Recommendations',
  '/progress': 'Progress Tracker',
  '/resume': 'Resume Builder',
  '/interview': 'Mock Interview',
  '/setup': 'Profile Setup',
};

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = routeLabels[pathname] || 'Smart Career Roadmap';

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]} 👋` : ''}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
        </Button>
        <div className="flex items-center gap-2 ml-1">
          <Avatar className="w-8 h-8 ring-2 ring-purple-500/30">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="rounded-xl text-muted-foreground hover:text-destructive"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
