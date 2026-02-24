'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { roadmapApi, progressApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Loader2, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openMonths, setOpenMonths] = useState<Record<number, boolean>>({ 0: true });

  const loadRoadmap = async () => {
    try {
      const res = await roadmapApi.getActive();
      setRoadmap(res.data.data.roadmap);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadRoadmap(); }, []);

  const toggleTask = async (monthIdx: number, weekIdx: number, taskIdx: number, task: any) => {
    if (!roadmap) return;
    try {
      const res = await roadmapApi.completeTask(roadmap._id, task.id, { monthIndex: monthIdx, weekIndex: weekIdx, taskIndex: taskIdx });
      const updated = { ...roadmap };
      updated.monthlyPlan[monthIdx].weeks[weekIdx].tasks[taskIdx].completed = res.data.data.task.completed;
      updated.completionPercentage = res.data.data.completionPercentage;
      setRoadmap(updated);
      if (res.data.data.task.completed) {
        await progressApi.claimXP({ taskId: task.id, roadmapId: roadmap._id });
        toast.success('+50 XP earned! 🎯');
      }
    } catch { toast.error('Failed to update task'); }
  };

  const generateRoadmap = async () => {
    setGenerating(true);
    try {
      const res = await roadmapApi.generate();
      setRoadmap(res.data.data.roadmap);
      toast.success('New roadmap generated! 🚀');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Generation failed');
    } finally { setGenerating(false); }
  };

  const typeColors: Record<string, string> = {
    learn: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    build: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    practice: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    read: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    watch: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>;

  if (!roadmap) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <p className="text-muted-foreground">No roadmap found. Generate one from your profile!</p>
      <Link href="/setup"><Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">Set Up Profile</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="page-header">{roadmap.title}</h2>
          <p className="page-subtitle">{roadmap.summary}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{roadmap.targetRole}</Badge>
            <Badge variant="outline">{roadmap.totalDurationMonths} months</Badge>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{roadmap.completionPercentage}% complete</Badge>
          </div>
        </div>
        <Button onClick={generateRoadmap} disabled={generating} variant="outline" className="rounded-xl gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Regenerate
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">{roadmap.completionPercentage}%</span>
          </div>
          <Progress value={roadmap.completionPercentage} className="h-3 rounded-full" />
        </CardContent>
      </Card>

      {/* Monthly Plan */}
      {roadmap.monthlyPlan?.map((month: any, mIdx: number) => {
        const totalTasks = month.weeks?.reduce((s: number, w: any) => s + w.tasks.length, 0) || 0;
        const doneTasks = month.weeks?.reduce((s: number, w: any) => s + w.tasks.filter((t: any) => t.completed).length, 0) || 0;
        const monthPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

        return (
          <Card key={mIdx} className="glass-card border-0 overflow-hidden">
            <button
              onClick={() => setOpenMonths((prev) => ({ ...prev, [mIdx]: !prev[mIdx] }))}
              className="w-full text-left"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold">{month.month}</div>
                    <div>
                      <CardTitle className="text-base">{month.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{doneTasks}/{totalTasks} tasks · {monthPct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={monthPct} className="w-24 h-1.5 hidden sm:block" />
                    {openMonths[mIdx] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </button>
            <AnimatePresence>
              {openMonths[mIdx] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <CardContent className="pt-0 space-y-3">
                    {month.weeks?.map((week: any, wIdx: number) => (
                      <div key={wIdx} className="bg-muted/50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-purple-500" />
                          Week {week.week}: {week.title}
                        </h4>
                        <div className="space-y-2">
                          {week.tasks?.map((task: any, tIdx: number) => (
                            <motion.div
                              key={task.id}
                              whileHover={{ x: 2 }}
                              className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${task.completed ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-background'}`}
                              onClick={() => toggleTask(mIdx, wIdx, tIdx, task)}
                            >
                              {task.completed
                                ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[task.type] || typeColors.learn}`}>{task.type}</span>
                                  <span className="text-xs text-muted-foreground">~{task.estimatedHours}h</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
