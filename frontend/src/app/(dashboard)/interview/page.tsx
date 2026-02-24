'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { interviewApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mic, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const difficultyOptions = ['easy', 'medium', 'hard'];
const typeColors: Record<string, string> = {
  behavioral: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  technical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  situational: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  coding: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function InterviewPage() {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [interview, setInterview] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generate = async () => {
    if (!role.trim()) { toast.error('Please enter a target role'); return; }
    setLoading(true);
    try {
      const res = await interviewApi.generate({ targetRole: role, difficulty });
      setInterview(res.data.data.interview);
      setCurrentQ(0);
      setFeedback({});
      toast.success('Interview ready! 🎤');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Generation failed');
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error('Please enter your answer'); return; }
    const question = interview.questions[currentQ];
    setSubmitting(true);
    try {
      const res = await interviewApi.submitAnswer({ interviewId: interview._id, questionId: question.id, answer });
      setFeedback((prev) => ({ ...prev, [question.id]: res.data.data.feedback }));
      toast.success('Answer submitted!');
    } catch { toast.error('Submission failed'); } finally { setSubmitting(false); }
  };

  const totalAnswered = Object.keys(feedback).length;
  const avgScore = totalAnswered > 0 ? Object.values(feedback).reduce((s: number, f: any) => s + (f.score || 0), 0) / totalAnswered : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="page-header">Mock Interview</h2>
        <p className="page-subtitle">Practice with AI-generated interview questions and get instant feedback</p>
      </div>

      {/* Setup */}
      {!interview && (
        <Card className="glass-card border-0">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role">Target Role</Label>
              <Input id="role" placeholder="e.g. Full Stack Developer, Data Scientist..." value={role}
                onChange={(e) => setRole(e.target.value)} className="h-11" onKeyDown={(e) => e.key === 'Enter' && generate()} />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <div className="flex gap-2">
                {difficultyOptions.map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-sm capitalize font-medium transition-all ${difficulty === d ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {loading ? 'Generating questions...' : 'Start Interview'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interview */}
      {interview && (
        <div className="space-y-4">
          {/* Progress */}
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Question {currentQ + 1} of {interview.questions.length}</span>
                {avgScore > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-sm">{avgScore.toFixed(1)}/10</span>
                  </div>
                )}
              </div>
              <Progress value={((currentQ + 1) / interview.questions.length) * 100} className="h-2" />
              <div className="flex gap-1 mt-2">
                {interview.questions.map((_: any, i: number) => (
                  <button key={i} onClick={() => { setCurrentQ(i); setAnswer(''); }}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${i === currentQ ? 'bg-purple-500' : feedback[interview.questions[i].id] ? 'bg-green-500' : 'bg-muted'}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="glass-card border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-xs ${typeColors[interview.questions[currentQ]?.type]}`}>{interview.questions[currentQ]?.type}</Badge>
                  </div>
                  <CardTitle className="text-base leading-relaxed">{interview.questions[currentQ]?.question}</CardTitle>
                  {interview.questions[currentQ]?.hint && (
                    <p className="text-xs text-muted-foreground italic">💡 Hint: {interview.questions[currentQ].hint}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    className="w-full h-36 p-3 text-sm bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={!!feedback[interview.questions[currentQ]?.id]}
                  />
                  {!feedback[interview.questions[currentQ]?.id] ? (
                    <Button onClick={submitAnswer} disabled={submitting} className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-2">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Submit Answer
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      {/* Feedback */}
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">AI Feedback</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                            <span className="font-bold">{feedback[interview.questions[currentQ].id]?.score}/10</span>
                          </div>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">{feedback[interview.questions[currentQ].id]?.feedback}</p>
                      </div>
                      {currentQ < interview.questions.length - 1 && (
                        <Button onClick={() => { setCurrentQ(currentQ + 1); setAnswer(''); }} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white gap-2">
                          Next Question <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <Button variant="outline" onClick={() => { setInterview(null); setRole(''); }} className="rounded-xl text-sm">← New Interview</Button>
        </div>
      )}
    </div>
  );
}
