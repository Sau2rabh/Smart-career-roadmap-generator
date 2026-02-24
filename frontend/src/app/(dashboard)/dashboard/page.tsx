'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { roadmapApi, progressApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Map, Zap, Trophy, Flame, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p] = await Promise.all([roadmapApi.getActive(), progressApi.get()]);
        setRoadmap(r.data.data.roadmap);
        setProgress(p.data.data.progress);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const xpToNextLevel = (progress?.level || 1) * 500;
  const xpProgress = ((progress?.xp || 0) % 500) / 5;
  const activityData = (progress?.activityLog || []).slice(-7).map((a: any) => ({
    date: new Date(a.date).toLocaleDateString('en', { weekday: 'short' }),
    xp: a.xpEarned,
    tasks: a.tasksCompleted,
  }));

  const stats = [
    { label: 'Total XP', value: (progress?.xp || 0).toLocaleString(), icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Current Streak', value: `${progress?.streak || 0} days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Tasks Done', value: progress?.totalTasksCompleted || 0, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Level', value: `LVL ${progress?.level || 1}`, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 p-6 text-white shadow-xl shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-purple-200 mt-1">
            {roadmap ? `Working on: ${roadmap.targetRole} · ${roadmap.completionPercentage}% complete` : 'Set up your profile to generate your personalized roadmap'}
          </p>
          {!roadmap && (
            <Link href="/setup">
              <Button className="mt-4 bg-white text-purple-600 hover:bg-purple-50 font-semibold rounded-xl">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="glass-card border-0 hover:scale-105 transition-transform">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* XP Progress */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Level Progress — Level {progress?.level || 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{(progress?.xp || 0) % 500} XP</span>
              <span>{xpToNextLevel} XP to next level</span>
            </div>
            <div className="relative">
              <Progress value={xpProgress} className="h-3 xp-bar rounded-full" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts + Roadmap row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card border-0 h-full">
            <CardHeader><CardTitle className="text-sm font-semibold">Weekly Activity (XP)</CardTitle></CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="xp" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Complete tasks to see activity here
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Roadmap Preview */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Map className="w-4 h-4 text-purple-500" /> Active Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roadmap ? (
                <div className="space-y-3">
                  <p className="font-semibold text-sm">{roadmap.title}</p>
                  <Badge variant="secondary">{roadmap.targetRole}</Badge>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span><span>{roadmap.completionPercentage}%</span>
                    </div>
                    <Progress value={roadmap.completionPercentage} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground">{roadmap.totalDurationMonths} month plan · {roadmap.monthlyPlan?.length} phases</p>
                  <Link href="/roadmap">
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                      Continue Learning <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Map className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No active roadmap</p>
                  <Link href="/setup"><Button size="sm" className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs">Generate Roadmap</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badges */}
      {progress?.badges?.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-sm font-semibold">Your Badges</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {progress.badges.map((badge: any) => (
                  <div key={badge.id} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl px-3 py-2">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
