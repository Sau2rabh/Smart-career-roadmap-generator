'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { projectsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, RefreshCw, FolderGit2, Code2 } from 'lucide-react';
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getRecommendations();
      setProjects(res.data.data.projects || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load recommendations');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="page-header">Project Recommendations</h2>
          <p className="page-subtitle">AI-curated projects tailored to your skills and goals</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="rounded-xl gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((project, i) => (
          <motion.div key={project.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
            <Card className="glass-card border-0 h-full flex flex-col group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <Badge className={`text-xs ${difficultyColors[project.difficulty]}`}>{project.difficulty}</Badge>
                    <Badge className={`text-xs ${categoryColors[project.category] || categoryColors.fullstack}`}>{project.category}</Badge>
                  </div>
                </div>
                <CardTitle className="text-base mt-3">{project.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.techStack?.map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{project.estimatedHours}h</span>
                  <span className="flex items-center gap-1"><FolderGit2 className="w-3.5 h-3.5" /> {project.keyLearnings?.length || 0} key learnings</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
