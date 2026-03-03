'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { roadmapApi, progressApi, youtubeApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight,
  Loader2, RefreshCw, Zap, Youtube, ExternalLink, Clock, BarChart2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface VideoSuggestion {
  title: string;
  channel: string;
  description: string;
  duration: string;
  level: string;
  searchQuery: string;
  youtubeUrl: string;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openMonths, setOpenMonths] = useState<Record<number, boolean>>({ 0: true });

  // YouTube state per month index
  const [youtubeOpen, setYoutubeOpen] = useState<Record<number, boolean>>({});
  const [youtubeVideos, setYoutubeVideos] = useState<Record<number, VideoSuggestion[]>>({});
  const [youtubeLoading, setYoutubeLoading] = useState<Record<number, boolean>>({});
  const [youtubeLang, setYoutubeLang] = useState<Record<number, 'hindi' | 'english'>>({});

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
      setYoutubeVideos({});
      setYoutubeOpen({});
      toast.success('New roadmap generated! 🚀');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Generation failed');
    } finally { setGenerating(false); }
  };

  const fetchYouTubeVideos = async (mIdx: number, month: any, lang: 'hindi' | 'english') => {
    setYoutubeLoading((prev) => ({ ...prev, [mIdx]: true }));
    setYoutubeVideos((prev) => ({ ...prev, [mIdx]: [] }));
    try {
      const skills = month.skills || [];
      const res = await youtubeApi.suggest(month.title, skills, roadmap.targetRole, lang);
      setYoutubeVideos((prev) => ({ ...prev, [mIdx]: res.data.data.videos }));
    } catch {
      toast.error('Failed to load video suggestions');
      setYoutubeOpen((prev) => ({ ...prev, [mIdx]: false }));
    } finally {
      setYoutubeLoading((prev) => ({ ...prev, [mIdx]: false }));
    }
  };

  const toggleYouTube = async (mIdx: number, month: any) => {
    if (youtubeOpen[mIdx]) {
      setYoutubeOpen((prev) => ({ ...prev, [mIdx]: false }));
      return;
    }
    setYoutubeOpen((prev) => ({ ...prev, [mIdx]: true }));
    const lang = youtubeLang[mIdx] || 'english';
    if (!youtubeVideos[mIdx] || youtubeVideos[mIdx].length === 0) {
      await fetchYouTubeVideos(mIdx, month, lang);
    }
  };

  const switchLanguage = async (mIdx: number, month: any, lang: 'hindi' | 'english') => {
    if (youtubeLang[mIdx] === lang) return;
    setYoutubeLang((prev) => ({ ...prev, [mIdx]: lang }));
    await fetchYouTubeVideos(mIdx, month, lang);
  };


  const typeColors: Record<string, string> = {
    learn: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    build: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    practice: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    read: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    watch: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  };

  const levelColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
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
                    {/* Tasks by week */}
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
                              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                task.completed
                                  ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/40 shadow-sm'
                                  : 'hover:bg-muted/80 border-transparent hover:border-border/50'
                              }`}
                              onClick={() => {
                                const params = new URLSearchParams({
                                  title: task.title,
                                  type: task.type,
                                  taskId: task.id,
                                  roadmapId: roadmap._id,
                                  mIdx: mIdx.toString(),
                                  wIdx: wIdx.toString(),
                                  tIdx: tIdx.toString(),
                                  role: roadmap.targetRole,
                                  done: task.completed.toString(),
                                });
                                router.push(`/learn?${params.toString()}`);
                              }}
                            >
                              {task.completed
                                ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-medium ${task.completed ? 'text-green-800 dark:text-green-300' : ''}`}>
                                    {task.title}
                                  </p>
                                  {task.completed && (
                                    <Badge className="h-4 px-1.5 text-[10px] bg-green-500 text-white border-0">DONE</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${typeColors[task.type] || typeColors.learn}`}>
                                    {task.type}
                                  </span>
                                  <span className="text-[10px] font-medium text-muted-foreground uppercase opacity-70">~{task.estimatedHours}h</span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/30 self-center" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* ── YouTube Resources Button + Language Toggle ── */}
                    <div className="pt-1 space-y-2">
                      {/* Language toggle — only show when panel is open */}
                      {youtubeOpen[mIdx] && (
                        <div className="flex justify-end">
                          <select
                            value={youtubeLang[mIdx] || 'english'}
                            onChange={(e) => switchLanguage(mIdx, month, e.target.value as 'hindi' | 'english')}
                            disabled={youtubeLoading[mIdx]}
                            className="bg-transparent text-xs font-medium border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500/50 cursor-pointer disabled:opacity-50"
                          >
                            <option value="english" className="bg-white text-black dark:bg-slate-900 dark:text-white">🌐 English</option>
                            <option value="hindi" className="bg-white text-black dark:bg-slate-900 dark:text-white">🇮🇳 Hindi</option>
                          </select>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => toggleYouTube(mIdx, month)}
                        disabled={youtubeLoading[mIdx]}
                      >
                        {youtubeLoading[mIdx]
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Youtube className="w-4 h-4" />}
                        {youtubeOpen[mIdx] && !youtubeLoading[mIdx] ? 'Hide YouTube Resources' : 'Show YouTube Resources'}
                      </Button>
                    </div>

                    {/* ── YouTube Videos Panel ── */}
                    <AnimatePresence>
                      {youtubeOpen[mIdx] && !youtubeLoading[mIdx] && youtubeVideos[mIdx]?.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-1 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                              {(youtubeLang[mIdx] || 'english') === 'hindi' ? '🇮🇳 Hindi' : '🌐 English'} &nbsp;·&nbsp; 📺 Recommended for Month {month.month}
                            </p>

                            <div className="grid gap-3 sm:grid-cols-1">
                              {youtubeVideos[mIdx].map((video, vIdx) => (
                                <motion.div
                                  key={vIdx}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: vIdx * 0.06 }}
                                  className="flex gap-3 p-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors border border-border/50"
                                >
                                  {/* Red play icon */}
                                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                                    <Youtube className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold leading-snug line-clamp-2">{video.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{video.channel}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      {video.duration && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Clock className="w-3 h-3" /> {video.duration}
                                        </span>
                                      )}
                                      {video.level && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[video.level] || levelColors.Beginner}`}>
                                          <BarChart2 className="w-3 h-3 inline mr-1" />{video.level}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <a
                                    href={video.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4 text-white" />
                                  </a>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
