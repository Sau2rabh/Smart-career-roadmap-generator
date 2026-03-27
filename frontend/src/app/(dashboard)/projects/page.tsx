'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, RefreshCw, FolderGit2, Code2, Sparkles, X, ChevronRight, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  backend: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  fullstack: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  mobile: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  ml: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  devops: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
};

const ProjectLoader = ({ onComplete, label, isComplete = false }: { onComplete: () => void, label: string, isComplete?: boolean }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (isComplete) {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return Math.min(prev + 10, 100); // Fast fill once data is back
        }

        if (prev < 85) {
          // Normal but steady climb
          return prev + (Math.random() * 2 + 0.5);
        } else if (prev < 98) {
          // "Wait Zone" - slow crawl while AI is processing
          return prev + 0.2;
        }
        return prev; // Stay at 98% until isComplete is true
      });
    }, 300);
    return () => clearInterval(interval);
  }, [onComplete, isComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8 min-h-[400px] w-full max-w-lg mx-auto">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h4 className="text-xl font-black text-foreground uppercase tracking-tighter">Analyzing...</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">{label}</p>
          </div>
          <span className="text-3xl font-black text-purple-600 tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-purple-500/10 border border-purple-500/10 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/30 border border-border/50 animate-pulse">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">AI is crafting your projects</p>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjects, setShowProjects] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [apiReady, setApiReady] = useState(false);
  const [guideApiReady, setGuideApiReady] = useState(false);
  const [guide, setGuide] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setShowProjects(false);
    setApiReady(false);
    try {
      const res = await projectsApi.getRecommendations();
      setProjects(res.data.data.projects || []);
      setApiReady(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load recommendations');
      setLoading(false);
    }
  };

  const loadGuide = async (project: any) => {
    setSelectedProject(project);
    setGuideLoading(true);
    setShowGuide(false);
    setGuide(null);
    setGuideApiReady(false);
    try {
      const res = await projectsApi.getGuide({
        projectTitle: project.title,
        projectDescription: project.description
      });
      setGuide(res.data.data.guide);
      setGuideApiReady(true);
    } catch (err: any) {
      toast.error('Failed to generate project guide');
      setSelectedProject(null);
      setGuideLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !showProjects) return (
    <ProjectLoader 
      label="Fetching customized project recommendations" 
      isComplete={apiReady}
      onComplete={() => {
        setShowProjects(true);
        setLoading(false);
      }} 
    />
  );

  return (
    <div className="space-y-6 px-1 sm:px-0">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="page-header text-2xl sm:text-3xl">Project Recommendations</h2>
          <p className="page-subtitle">AI-curated projects tailored to your skills and goals</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="rounded-xl gap-2 border-primary/20 hover:bg-muted transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((project, i) => (
          <motion.div
            key={project.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="cursor-pointer"
            onClick={() => loadGuide(project)}
          >
            <Card className="glass-card border-0 h-full flex flex-col group hover:ring-2 ring-purple-500/20 transition-all shadow-lg active:scale-95">
              <CardHeader className="pb-3 px-5 sm:px-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10 shrink-0">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end min-w-0">
                    <Badge className={`text-[10px] px-2 py-0 h-5 border-0 ${difficultyColors[project.difficulty]}`}>{project.difficulty}</Badge>
                    <Badge className={`text-[10px] px-2 py-0 h-5 border-0 ${categoryColors[project.category] || categoryColors.fullstack}`}>{project.category}</Badge>
                  </div>
                </div>
                <CardTitle className="text-base sm:text-lg mt-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed line-clamp-3 min-h-[4.5em]">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-auto px-5 sm:px-6">
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.techStack?.slice(0, 4).map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="text-[10px] bg-muted/50 text-foreground border-0 hover:bg-muted">{tech}</Badge>
                  ))}
                  {(project.techStack?.length || 0) > 4 && <Badge variant="secondary" className="text-[10px] bg-muted/50 border-0">+{project.techStack!.length - 4}</Badge>}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-4 pb-2">
                  <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5" /> ~{project.estimatedHours}h</span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-tight">Guide <ChevronRight className="w-3 h-3" /></span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
            <FolderGit2 className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-foreground">No projects discovered yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">We need to analyze your profile to suggest the best projects. Click refresh to start!</p>
          <Button onClick={load} disabled={loading} className="rounded-2xl h-12 px-8 gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:scale-105 transition-all text-white shadow-xl shadow-purple-500/20">
            <RefreshCw className="w-5 h-5" /> Generate Projects
          </Button>
        </div>
      )}

      {/* Project Guide Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col relative"
            >
              <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-sm z-20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/10">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-foreground leading-none mb-1 truncate">{selectedProject.title}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Project Implementation Guide</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)} className="rounded-full hover:bg-muted shrink-0 h-9 w-9">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-10 custom-scrollbar pb-12">
                {guideLoading && !showGuide ? (
                  <ProjectLoader 
                    label="Architecting your custom build plan" 
                    isComplete={guideApiReady}
                    onComplete={() => {
                      setShowGuide(true);
                      setGuideLoading(false);
                    }} 
                  />
                ) : guide ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Code2 className="w-5 h-5" />
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Overview</h4>
                      </div>
                      <div className="p-5 rounded-3xl bg-muted/30 border border-border relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                          <Lightbulb className="w-10 h-10 text-purple-500" />
                        </div>
                        <p className="text-foreground text-sm leading-relaxed relative z-10">
                          {guide.overview}
                        </p>
                      </div>
                      <div className="flex gap-3 sm:gap-4 flex-wrap">
                        <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-muted/30 border border-border flex items-center gap-3">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <div className="flex flex-col">
                             <span className="text-[10px] text-muted-foreground uppercase font-bold">Estimate</span>
                             <span className="text-sm font-black text-foreground">{guide.estimatedCompletionTime}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-[140px] p-4 rounded-2xl bg-muted/30 border border-border flex items-center gap-3">
                           <div className={`w-2 h-8 rounded-full ${difficultyColors[selectedProject.difficulty].split(' ')[0]}`}></div>
                           <div className="flex flex-col">
                             <span className="text-[10px] text-muted-foreground uppercase font-bold">Difficulty</span>
                             <span className="text-sm font-black text-foreground uppercase tracking-tight">{selectedProject.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <RefreshCw className="w-5 h-5" />
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Roadmap Steps</h4>
                      </div>
                      <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-purple-500/50 before:via-blue-500/50 before:to-transparent">
                        {guide.steps.map((step: any, idx: number) => (
                          <div key={idx} className="relative pl-12 sm:pl-16">
                            <div className="absolute left-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center z-10 shadow-lg shadow-purple-500/20 text-white font-black text-sm">
                              {step.step}
                            </div>
                            <div className="p-5 sm:p-6 rounded-3xl bg-muted/20 border border-border/50 hover:bg-muted/40 hover:border-purple-500/30 transition-all group overflow-hidden">
                              <h5 className="font-black text-foreground mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors uppercase tracking-tight text-sm sm:text-base">{step.title}</h5>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">{step.description}</p>
                              {step.tips && step.tips.length > 0 && (
                                <div className="space-y-3 mt-5 pt-5 border-t border-border/50">
                                  {step.tips.map((tip: string, tIdx: number) => (
                                    <div key={tIdx} className="flex items-start gap-2.5 text-xs text-purple-700 dark:text-purple-300 bg-purple-500/5 p-2 rounded-xl">
                                      <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                                      <span className="font-medium">{tip}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {guide.resources && guide.resources.length > 0 && (
                      <div className="space-y-4 pb-4">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                          <FolderGit2 className="w-5 h-5" />
                          <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Learning Hub</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {guide.resources.map((res: any, idx: number) => (
                            <a
                              key={idx}
                              href={`https://www.google.com/search?q=${encodeURIComponent(res.url)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-4 rounded-2xl bg-muted/20 border border-border hover:border-purple-500/40 hover:bg-muted/40 transition-all flex items-center justify-between group shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors">
                                  <FolderGit2 className="w-4 h-4 text-purple-500" />
                                </div>
                                <span className="text-xs font-black text-foreground transition-colors">{res.name}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
