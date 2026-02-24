'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { skillGapApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SkillGapPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyze = async (file: File) => {
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      const res = await skillGapApi.analyzePdf(form);
      setAnalysis(res.data.data.analysis);
      toast.success('Analysis complete! 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) analyze(file);
  };

  const importanceColors: Record<string, string> = {
    must: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    recommended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    nice_to_have: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="page-header">Skill Gap Analyzer</h2>
        <p className="page-subtitle">Upload your resume to find exactly what skills you need to reach your target role</p>
      </div>

      {/* Upload area */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-border hover:border-purple-400'}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && analyze(e.target.files[0])} />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                <p className="text-sm text-muted-foreground">Analyzing your resume with AI...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Drop your resume PDF here</p>
                  <p className="text-sm text-muted-foreground">or click to browse · Max 5MB</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Match Score */}
          <Card className="glass-card border-0">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#9333ea" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40 * analysis.matchScore / 100} ${2 * Math.PI * 40 * (1 - analysis.matchScore / 100)}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{analysis.matchScore}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Match Score</h3>
                <p className="text-muted-foreground text-sm">{analysis.estimatedTimeToReady} to be job-ready</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {analysis.strengths?.slice(0, 3).map((s: string, i: number) => (
                    <Badge key={i} className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" />Missing Skills ({analysis.missingSkills?.length || 0})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.missingSkills?.map((skill: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{skill.name}</p>
                      {skill.learningResources?.[0] && <a href={skill.learningResources[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Start learning →</a>}
                    </div>
                    <Badge className={`text-xs ${importanceColors[skill.importance]}`}>{skill.importance?.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Extracted Skills */}
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Your Current Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.extractedSkills?.map((skill: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{skill.name} · {skill.level}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <Card className="glass-card border-0">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" />Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
