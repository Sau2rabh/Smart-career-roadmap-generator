'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { progressApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap, Calendar, Loader2, Star } from 'lucide-react';

export default function ProgressPage() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.get().then((r) => setProgress(r.data.data.progress)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>;
  if (!progress) return null;

  const xpInLevel = (progress.xp || 0) % 500;
  const xpToNext = 500 - xpInLevel;

  // Build last 30 days activity grid
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    const entry = progress.activityLog?.find((a: any) => {
      const ad = new Date(a.date);
      ad.setHours(0, 0, 0, 0);
      return ad.getTime() === d.getTime();
    });
    return { date: d, tasks: entry?.tasksCompleted || 0, xp: entry?.xpEarned || 0 };
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="page-header">Progress Tracker</h2>
        <p className="page-subtitle">Your learning journey at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: progress.xp?.toLocaleString(), icon: Star, color: 'text-amber-400' },
          { label: 'Current Streak', value: `${progress.streak} days`, icon: Flame, color: 'text-orange-500' },
          { label: 'Best Streak', value: `${progress.longestStreak} days`, icon: Trophy, color: 'text-purple-500' },
          { label: 'Tasks Done', value: progress.totalTasksCompleted, icon: Zap, color: 'text-blue-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Progress */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {progress.level}
            </div>
            <div className="flex-1">
              <p className="font-semibold">Level {progress.level}</p>
              <p className="text-sm text-muted-foreground">{xpInLevel} / 500 XP · {xpToNext} XP to Level {progress.level + 1}</p>
              <Progress value={(xpInLevel / 500) * 100} className="h-3 mt-2 xp-bar" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Grid */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-500" />Activity (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1.5">
            {last30.map((day, i) => {
              const intensity = day.tasks === 0 ? 0 : day.tasks < 2 ? 1 : day.tasks < 4 ? 2 : 3;
              const colors = ['bg-muted', 'bg-purple-200 dark:bg-purple-900', 'bg-purple-400 dark:bg-purple-700', 'bg-purple-600'];
              return (
                <motion.div key={i} whileHover={{ scale: 1.3 }} title={`${day.date.toLocaleDateString()}: ${day.tasks} tasks, ${day.xp} XP`}
                  className={`w-6 h-6 rounded-sm ${colors[intensity]} cursor-pointer transition-colors`} />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            {['bg-muted', 'bg-purple-200 dark:bg-purple-900', 'bg-purple-400 dark:bg-purple-700', 'bg-purple-600'].map((c, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-sm font-semibold">Badges Earned ({progress.badges?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {progress.badges?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete tasks to unlock badges!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {progress.badges?.map((badge: any) => (
                <motion.div key={badge.id} whileHover={{ scale: 1.03 }} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-100 dark:border-purple-800">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
