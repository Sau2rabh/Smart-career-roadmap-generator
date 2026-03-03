'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { learnApi, roadmapApi, progressApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, BookOpen, Clock, CheckCircle2, XCircle,
  Loader2, ChevronRight, Trophy, Zap, Code2, Lightbulb,
  Youtube, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StudyContent {
  title: string;
  overview: string;
  estimatedReadTime: string;
  featuredVideo?: { title: string; url: string } | null;
  sections: { heading: string; content: string; keyPoints: string[] }[];
  codeExample: { language: string | null; code: string | null; explanation: string | null } | null;
  summary: string[];
  practiceIdeas: string[];
}

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type Phase = 'loading' | 'reading' | 'completing' | 'quiz' | 'result';

function LearnPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const taskTitle = params.get('title') || '';
  const taskType = params.get('type') || 'learn';
  const taskId = params.get('taskId') || '';
  const roadmapId = params.get('roadmapId') || '';
  const monthIndex = Number(params.get('mIdx') || 0);
  const weekIndex = Number(params.get('wIdx') || 0);
  const taskIndex = Number(params.get('tIdx') || 0);
  const role = params.get('role') || 'Software Developer';
  const alreadyDone = params.get('done') === 'true';

  const typeColors: Record<string, string> = {
    learn: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    build: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    practice: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    read: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    watch: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  };

  const [phase, setPhase] = useState<Phase>('loading');
  const [content, setContent] = useState<StudyContent | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await learnApi.getContent(taskTitle, taskType, role);
        setContent(res.data.data.content);
        setPhase('reading');
      } catch {
        toast.error('Failed to load study content');
        router.back();
      }
    };
    if (taskTitle) load();
  }, [taskTitle, taskType, role, router]);

  const handleMarkComplete = async () => {
    setPhase('completing');
    try {
      const res = await learnApi.getQuiz(taskTitle, role);
      setQuestions(res.data.data.questions);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setPhase('quiz');
    } catch {
      toast.error('Failed to generate quiz');
      setPhase('reading');
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions first!');
      return;
    }

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const xp = correct * 20;
    setScore(correct);
    setXpEarned(xp);
    setSubmitted(true);

    if (!alreadyDone) {
      try {
        await roadmapApi.completeTask(roadmapId, taskId, {
          monthIndex, weekIndex, taskIndex,
        });
      } catch { }
    }

    if (xp > 0) {
      try {
        await progressApi.claimXP({ taskId, roadmapId, xpAmount: xp });
      } catch { }
    }

    setPhase('result');
  };

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-muted-foreground font-medium">Generating your study guide…</p>
        <p className="text-xs text-muted-foreground">This takes about 5–10 seconds</p>
      </div>
    );
  }

  if (phase === 'completing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-muted-foreground font-medium">Generating your quiz…</p>
      </div>
    );
  }

  if (phase === 'quiz') {
    const allAnswered = Object.keys(answers).length === questions.length;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setPhase('reading')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Knowledge Check</h2>
            <p className="text-sm text-muted-foreground">{taskTitle}</p>
          </div>
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{Object.keys(answers).length}/{questions.length} answered</span>
          <span className="font-medium text-purple-500">Max: 100 XP (20 per question)</span>
        </div>

        <div className="space-y-5">
          {questions.map((q, qIdx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.07 }}
              className="rounded-2xl border border-border bg-card p-5 space-y-3"
            >
              <p className="font-semibold text-sm leading-relaxed">
                <span className="text-purple-500 font-bold mr-2">Q{qIdx + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const selected = answers[q.id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border ${
                        selected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
                          : 'border-border hover:border-purple-300 hover:bg-muted/50'
                      }`}
                    >
                      <span className="font-semibold mr-2 text-muted-foreground">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 text-base font-semibold"
          disabled={!allAnswered}
          onClick={handleSubmitQuiz}
        >
          Submit Quiz & Earn XP ⚡
        </Button>
      </div>
    );
  }

  if (phase === 'result') {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage === 100 ? '🏆' : percentage >= 60 ? '🎯' : '📚';
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center rounded-3xl border border-border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-8 space-y-3"
        >
          <div className="text-6xl">{emoji}</div>
          <h2 className="text-2xl font-black">
            {score}/{questions.length} Correct!
          </h2>
          <p className="text-muted-foreground">{percentage}% Score</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white font-bold text-lg">
            <Zap className="w-5 h-5" /> +{xpEarned} XP Earned!
          </div>
          {xpEarned === 0 && (
            <p className="text-sm text-muted-foreground">Study more and try again to earn XP!</p>
          )}
        </motion.div>

        <div className="space-y-4">
          <h3 className="font-bold text-base">Answer Review</h3>
          {questions.map((q, qIdx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div key={q.id} className={`rounded-2xl border p-4 space-y-2 ${
                isCorrect
                  ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
              }`}>
                <div className="flex items-start gap-2">
                  {isCorrect
                    ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm font-semibold">{q.question}</p>
                </div>
                {!isCorrect && (
                  <p className="text-xs text-muted-foreground pl-7">
                    Your answer: <span className="text-red-500 font-medium">{q.options[userAnswer]}</span>
                    {' · '}Correct: <span className="text-green-600 font-medium">{q.options[q.correctIndex]}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground pl-7 italic">💡 {q.explanation}</p>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 text-base font-semibold"
          onClick={() => router.push('/roadmap')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roadmap
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/roadmap')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Roadmap
        </button>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-sm font-medium truncate">{content?.title}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border-0 ${typeColors[taskType] || typeColors.learn}`}>
            {taskType}
          </Badge>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> {content?.estimatedReadTime}
          </span>
          {alreadyDone && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black leading-snug">{content?.title}</h1>
        <p className="text-base text-muted-foreground leading-relaxed">{content?.overview}</p>
      </motion.div>

      {content?.featuredVideo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Tutorial Video</p>
              <h3 className="text-sm font-bold truncate max-w-[250px] sm:max-w-md">{content.featuredVideo.title}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            As this is a tutorial-based task, we've picked a highly-rated video to help you visualize the concepts.
          </p>
          <Button
            asChild
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold gap-2"
          >
            <a href={content.featuredVideo.url} target="_blank" rel="noopener noreferrer">
              Watch on YouTube <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </motion.div>
      )}

      <div className="rounded-[2.5rem] border border-border bg-card/40 p-6 sm:p-10 space-y-10 shadow-xl shadow-purple-500/5">
        {content?.sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {idx + 1}
              </span>
              {section.heading}
            </h2>
            <p className="text-sm text-muted-foreground leading-[1.9] whitespace-pre-line">{section.content}</p>
            {section.keyPoints && section.keyPoints.length > 0 && (
              <ul className="space-y-1.5 pl-1">
                {section.keyPoints.map((kp, kpIdx) => (
                  <li key={kpIdx} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                    {kp}
                  </li>
                ))}
              </ul>
            )}
            {idx < (content?.sections.length ?? 0) - 1 && (
              <div className="border-t border-border/50 pt-2" />
            )}
          </motion.div>
        ))}

        {content?.codeExample?.code && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
              <Code2 className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {content.codeExample.language || 'Code'} Example
              </span>
            </div>
            <pre className="p-4 text-sm overflow-x-auto bg-zinc-950 text-zinc-100 leading-relaxed">
              <code>{content.codeExample.code}</code>
            </pre>
            {content.codeExample.explanation && (
              <p className="px-4 py-3 text-xs text-muted-foreground bg-muted/30 border-t border-border">
                {content.codeExample.explanation}
              </p>
            )}
          </motion.div>
        )}

        {content?.summary && content.summary.length > 0 && (
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <BookOpen className="w-4 h-4" /> Key Takeaways
            </h3>
            <ul className="space-y-2">
              {content.summary.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {content?.practiceIdeas && content.practiceIdeas.length > 0 && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Lightbulb className="w-4 h-4" /> Practice Ideas
            </h3>
            <ul className="space-y-2">
              {content.practiceIdeas.map((idea, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-bold text-amber-500 flex-shrink-0">{idx + 1}.</span>
                  {idea}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {!alreadyDone ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-6 pt-4"
        >
          <Button
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-base shadow-lg shadow-purple-500/25 gap-2"
            onClick={handleMarkComplete}
          >
            <Trophy className="w-5 h-5" />
            Mark as Completed & Take Quiz ⚡
          </Button>
        </motion.div>
      ) : (
        <div className="flex justify-between gap-3 pt-4">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => router.push('/roadmap')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roadmap
          </Button>
          <Button
            className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2"
            onClick={handleMarkComplete}
          >
            <Zap className="w-4 h-4" /> Retake Quiz
          </Button>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
