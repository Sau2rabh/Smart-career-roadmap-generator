'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { resumeApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Save, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [optimized, setOptimized] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    resumeApi.get().then((r) => setResumeText(r.data.data.resumeText || '')).finally(() => setInitialLoad(false));
  }, []);

  const optimize = async () => {
    if (!resumeText.trim()) { toast.error('Please paste your resume text'); return; }
    setLoading(true);
    try {
      const res = await resumeApi.optimize({ resumeText });
      setOptimized(res.data.data.result);
      toast.success('Resume optimized! 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Optimization failed');
    } finally { setLoading(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimized?.optimizedResume || '');
    toast.success('Copied to clipboard!');
  };

  if (initialLoad) return <div className="flex justify-center items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="page-header">Resume Builder</h2>
        <p className="page-subtitle">Paste your resume, and AI will optimize it for your target role</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              className="w-full h-96 p-3 text-sm bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <Button onClick={optimize} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Optimizing with AI...' : 'Optimize with AI'}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Optimized Resume</CardTitle>
              {optimized && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">ATS Score: {optimized.atsScore}%</Badge>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} className="rounded-xl h-8 w-8"><Copy className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!optimized ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">AI-optimized version will appear here</p>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <textarea
                  className="w-full h-72 p-3 text-sm bg-muted/50 border border-border rounded-xl resize-none focus:outline-none font-mono"
                  value={optimized.optimizedResume}
                  readOnly
                />
                {optimized.keywordsAdded?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Keywords Added</p>
                    <div className="flex flex-wrap gap-1.5">
                      {optimized.keywordsAdded.map((kw: string) => (
                        <Badge key={kw} className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {optimized.suggestions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Suggestions</p>
                    <ul className="space-y-1">
                      {optimized.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-purple-500 mt-0.5">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
