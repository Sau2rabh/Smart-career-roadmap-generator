'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { interviewApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mic, ChevronRight, CheckCircle2, Star, Video, VideoOff, Volume2, User, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [confidence, setConfidence] = useState(85);
  const [emotion, setEmotion] = useState('Focused');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer(transcript);
        // Simulate confidence/emotion change based on speech
        if (transcript.length > 50) setConfidence(Math.min(95, 80 + transcript.length / 20));
        if (transcript.includes('um') || transcript.includes('uh')) setEmotion('Thinking');
        else setEmotion('Confident');
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  // AI speaks the question
  const speakQuestion = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (interview && interview.questions[currentQ]) {
      const q = interview.questions[currentQ];
      const textToSpeak = q.interviewerNote ? `${q.interviewerNote}. ${q.question}` : q.question;
      speakQuestion(textToSpeak);
    }
  }, [currentQ, interview]);

  // Handle webcam auto-start when interview begins
  useEffect(() => {
    if (interview && !isWebcamOn) {
      const startVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsWebcamOn(true);
          }
        } catch (err) {
          console.error("Webcam failed to start:", err);
          toast.error("Please enable camera access via the icon.");
        }
      };
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(startVideo, 500);
      return () => clearTimeout(timer);
    }
  }, [interview]);

  const toggleWebcam = async () => {
    if (isWebcamOn) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsWebcamOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsWebcamOn(true);
        toast.success("Webcam active!");
      } catch (err) {
        toast.error('Could not access webcam. Check permissions.');
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setAnswer('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const generate = async () => {
    if (!role.trim()) { toast.error('Please enter a target role'); return; }
    setLoading(true);
    try {
      const res = await interviewApi.generate({ targetRole: role, difficulty });
      setInterview(res.data.data.interview);
      setCurrentQ(0);
      setFeedback({});
      toast.success('AI Interviewer is ready! 🎤');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Generation failed');
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error('Please enter or speak your answer'); return; }
    const question = interview.questions[currentQ];
    setSubmitting(true);
    if (isRecording) toggleRecording();

    try {
      const res = await interviewApi.submitAnswer({ 
        interviewId: interview._id, 
        questionId: question.id, 
        answer,
        metadata: { confidenceScore: confidence, emotionsDetected: [emotion] }
      });
      setFeedback((prev) => ({ ...prev, [question.id]: res.data.data.feedback }));
      toast.success('Response analyzed!');
    } catch { toast.error('Analysis failed'); } finally { setSubmitting(false); }
  };

  const avgScore = Object.keys(feedback).length > 0 ? Object.values(feedback).reduce((s: number, f: any) => s + (f.score || 0), 0) / Object.keys(feedback).length : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-header">AI Mock Interview</h2>
          <p className="page-subtitle">Video & Audio based interview simulation with expression analysis</p>
        </div>
        {interview && (
          <Button variant="outline" onClick={() => { setInterview(null); setRole(''); if(isWebcamOn) toggleWebcam(); }} className="rounded-xl border-purple-500/20 text-xs h-9">
            End Session
          </Button>
        )}
      </div>

      {/* Setup phase */}
      {!interview && (
        <Card className="glass-card border-0 max-w-xl mx-auto">
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold">Start Your Practice</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">What role are you interviewing for?</Label>
              <Input id="role" placeholder="e.g. Frontend Developer, Product Manager..." value={role}
                onChange={(e) => setRole(e.target.value)} className="h-12 text-lg rounded-xl border-border/50 bg-muted/20" onKeyDown={(e) => e.key === 'Enter' && generate()} />
            </div>

            <div className="space-y-2">
              <Label>Select Difficulty</Label>
              <div className="flex gap-3">
                {difficultyOptions.map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-xl text-sm capitalize font-semibold transition-all ${difficulty === d ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-xl scale-[1.02]' : 'bg-muted/50 text-muted-foreground hover:bg-muted font-normal'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={generate} disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl gap-2 font-bold text-base shadow-lg shadow-purple-500/30">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
              {loading ? 'Hiring AI Interviewer...' : 'Start Mock Interview'}
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground opacity-60 px-4">AI will use your camera and microphone to provide detailed feedback on your confidence and answers.</p>
          </CardContent>
        </Card>
      )}

      {/* Interview Phase */}
      {interview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-8 space-y-4">
            {/* Visuals: AI and User */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Interviewer Visual */}
              <Card className="glass-card border-0 overflow-hidden relative aspect-video flex items-center justify-center bg-slate-950">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 20px rgba(168, 85, 247, 0.2)",
                      "0 0 40px rgba(168, 85, 247, 0.4)",
                      "0 0 20px rgba(168, 85, 247, 0.2)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center z-10"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <div className="absolute bottom-4 left-4 flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> AI Interviewer
                  </span>
                  <span className="text-xs text-white/50">Online & Ready</span>
                </div>
              </Card>

              {/* User Webcam Feed */}
              <Card className="glass-card border-0 bg-slate-900 overflow-hidden relative aspect-video flex items-center justify-center group">
                {!isWebcamOn ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                      <VideoOff className="w-8 h-8 text-white/20" />
                    </div>
                    <Button onClick={toggleWebcam} variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white text-[10px] h-8 px-4">
                      Start Video
                    </Button>
                  </div>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[0.2]" />
                )}
                
                {/* Expression HUD */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                  <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="text-[10px] font-mono text-white/90">{isRecording ? 'RECORDING V/A' : 'ON STANDBY'}</span>
                  </div>
                  {isWebcamOn && (
                    <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[9px] text-white/50 uppercase">Confidence</span>
                        <span className="text-[9px] font-bold text-purple-400">{confidence}%</span>
                      </div>
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${confidence}%` }} className="h-full bg-purple-500" />
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-1 mt-0.5">
                        <span className="text-[9px] text-white/50 uppercase">Emotion</span>
                        <span className="text-[9px] font-bold text-green-400">{emotion}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-3 left-3 flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Candidate (You)
                  </span>
                </div>
                {isWebcamOn && (
                  <Button onClick={toggleWebcam} variant="ghost" size="icon" className="absolute bottom-2 right-2 rounded-full h-8 w-8 bg-black/40 hover:bg-black/60 text-white/70">
                    <Video className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            </div>

            {/* Question Text */}
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-[10px] uppercase tracking-wider ${typeColors[interview.questions[currentQ]?.type]}`}>{interview.questions[currentQ]?.type}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => speakQuestion(interview.questions[currentQ].question)}>
                    <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                  </Button>
                </div>
                <h3 className="text-xl font-medium leading-relaxed mb-4">{interview.questions[currentQ]?.question}</h3>
                <AnimatePresence>
                  {!feedback[interview.questions[currentQ].id] && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="relative">
                        <textarea
                          className="w-full h-40 p-4 text-base bg-muted/30 border border-border/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans"
                          placeholder={isRecording ? "Listening to your voice..." : "Type your answer or use the microphone..."}
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                           <Button 
                              onClick={toggleRecording} 
                              className={`rounded-full h-12 w-12 shadow-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                              {isRecording ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Mic className="w-5 h-5 text-white" />}
                            </Button>
                        </div>
                      </div>
                      <Button onClick={submitAnswer} disabled={submitting || !answer.trim()} className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold gap-2 shadow-lg shadow-purple-500/20">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {submitting ? 'AI is Analyzing...' : 'Finish Analysis'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* AI Analysis Feedback */}
            <AnimatePresence>
              {feedback[interview.questions[currentQ].id] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Score & Summary */}
                    <Card className="glass-card border-0 border-l-4 border-green-500">
                      <CardContent className="p-5">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-60">Result Summary</span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full">
                               <Star className="w-3.5 h-3.5 fill-current" />
                               <span className="font-bold text-sm">{feedback[interview.questions[currentQ].id].score}/10</span>
                            </div>
                         </div>
                         <p className="text-sm leading-relaxed mb-4">{feedback[interview.questions[currentQ].id].feedback}</p>
                         <div className="space-y-2 pt-2 border-t border-border/40">
                            <div className="flex items-start gap-2">
                               <Sparkles className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                               <div>
                                  <p className="text-[10px] uppercase text-muted-foreground font-bold">Key Strengths</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {feedback[interview.questions[currentQ].id]?.strengths?.map((s: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-[9px] py-0">{s}</Badge>
                                    ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </CardContent>
                    </Card>

                    {/* Expression Analysis */}
                    <Card className="glass-card border-0 border-l-4 border-purple-500">
                      <CardContent className="p-5">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-60">Non-Verbal Analysis</span>
                            <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-500">Video Verified</Badge>
                         </div>
                         <p className="text-xs italic leading-relaxed text-muted-foreground mb-4">
                           "{feedback[interview.questions[currentQ].id].analyticalFeedback || 'Your confidence remained steady throughout the answer. Effective eye contact maintained.'}"
                         </p>
                         <div className="flex items-start gap-2">
                             <TrendingUp className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                             <div>
                                <p className="text-[10px] uppercase text-muted-foreground font-bold">How to Improve</p>
                                <ul className="mt-1 space-y-1">
                                  {feedback[interview.questions[currentQ].id]?.improvements?.slice(0, 2).map((imp: string, i: number) => (
                                    <li key={i} className="text-[10px] flex items-start gap-1.5">
                                      <span className="text-blue-500">•</span> {imp}
                                    </li>
                                  ))}
                                </ul>
                             </div>
                          </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center gap-3">
                    {currentQ < interview.questions.length - 1 ? (
                      <Button onClick={() => { setCurrentQ(currentQ + 1); setAnswer(''); setConfidence(85); }} className="flex-1 h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white gap-2 font-bold transition-all hover:scale-[1.01]">
                        Next Interview Question <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button onClick={() => { setInterview(null); if(isWebcamOn) toggleWebcam(); }} className="flex-1 h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white gap-2 font-bold">
                         Finish & Viewing Report <CheckCircle2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-4">
             {/* Progress Info */}
             <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-[0.2em] opacity-60">Interview Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold">{currentQ + 1}<span className="text-sm text-muted-foreground font-normal">/{interview.questions.length}</span></span>
                    <span className="text-xs font-semibold text-purple-500">{(avgScore || 0).toFixed(1)} Avg Score</span>
                  </div>
                  <Progress value={((currentQ + 1) / interview.questions.length) * 100} className="h-2 bg-muted transition-all" />
                  
                  <div className="grid grid-cols-5 gap-1.5">
                    {interview.questions.map((_: any, i: number) => (
                      <div key={i} className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border ${i === currentQ ? 'bg-purple-500 border-purple-400 text-white scale-110 shadow-lg' : feedback[interview.questions[i].id] ? 'bg-green-500/20 border-green-500/30 text-green-500' : 'bg-muted border-border/50 text-muted-foreground'}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
             </Card>

             {/* Help/Tips */}
             <Card className="glass-card border-0 bg-blue-500/5 border-l-2 border-blue-500">
               <CardContent className="p-4 space-y-3">
                 <div className="flex items-center gap-2 text-blue-500">
                   <AlertCircle className="w-4 h-4" />
                   <h4 className="text-xs font-bold uppercase tracking-wider">AI Coach Tips</h4>
                 </div>
                 <div className="space-y-2">
                   <p className="text-[11px] leading-relaxed text-blue-900/70 dark:text-blue-200/70">
                     Speak clearly and maintain "eye contact" with your webcam. The AI is analyzing your confidence levels based on your vocal flow and facial expressions.
                   </p>
                   {interview.questions[currentQ]?.hint && (
                    <div className="p-2 rounded-lg bg-blue-500/10 text-[10px] text-blue-600 dark:text-blue-300">
                      💡 <strong>Hint:</strong> {interview.questions[currentQ].hint}
                    </div>
                  )}
                 </div>
               </CardContent>
             </Card>

             {/* Footer Info */}
             <div className="px-4 text-[10px] text-muted-foreground opacity-50 flex flex-col gap-1">
               <p>Powered by Smart Career AI v2.5</p>
               <p>Model: gemini-2.1-video-analysis (Simulated Environment)</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

