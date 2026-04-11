'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { profileApi, roadmapApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, X, ChevronRight, ChevronLeft, Sparkles, Edit2, User, BookOpen, Clock, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = ['Education & Experience', 'Current Skills', 'Target Role & Goals', 'Review & Generate'];
const expLevels = [
  { value: 'student', label: 'Student', desc: 'Currently studying' },
  { value: 'entry', label: 'Entry Level', desc: '0–1 years' },
  { value: 'junior', label: 'Junior', desc: '1–2 years' },
  { value: 'mid', label: 'Mid-Level', desc: '2–5 years' },
  { value: 'senior', label: 'Senior', desc: '5+ years' },
  { value: 'lead', label: 'Lead/Manager', desc: 'Leadership role' },
];
const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'TypeScript', 'Java', 'Docker', 'AWS', 'Machine Learning', 'CSS', 'Git'];

export default function SetupPage() {
  const { refreshUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [form, setForm] = useState({
    targetRole: '',
    experienceLevel: 'entry',
    currentSkills: [] as { name: string; level: string }[],
    timeCommitmentHoursPerWeek: 10,
    yearsOfExperience: 0,
    preferredLearningStyle: 'mixed',
    education: { level: 'bachelor', field: '', institution: '' },
    bio: '',
  });

  const [eduOpen, setEduOpen] = useState(false);
  const eduRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eduRef.current && !eduRef.current.contains(event.target as Node)) {
        setEduOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileApi.get();
      if (res.data.data) {
        const p = res.data.data;
        setForm({
          targetRole: p.targetRole || '',
          experienceLevel: p.experienceLevel || 'entry',
          currentSkills: p.currentSkills || [],
          timeCommitmentHoursPerWeek: p.timeCommitmentHoursPerWeek || 10,
          yearsOfExperience: p.yearsOfExperience || 0,
          preferredLearningStyle: p.preferredLearningStyle || 'mixed',
          education: p.education || { level: 'bachelor', field: '', institution: '' },
          bio: p.bio || '',
        });
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      setIsEditing(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const addSkill = (name: string) => {
    if (!name.trim() || form.currentSkills.find((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setForm((prev) => ({ ...prev, currentSkills: [...prev.currentSkills, { name: name.trim(), level: 'beginner' }] }));
    setNewSkill('');
  };

  const removeSkill = (name: string) => {
    setForm((prev) => ({ ...prev, currentSkills: prev.currentSkills.filter((s) => s.name !== name) }));
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!form.targetRole) { toast.error('Please set a target role'); return; }
    if (form.currentSkills.length === 0) { toast.error('Add at least one skill'); return; }
    setLoading(true);
    try {
      await profileApi.upsert(form);
      toast.success('Profile saved!');
      await refreshUser();
      setIsEditing(false);
      if (step === 3) {
        toast.loading('Generating your personal roadmap...');
        await roadmapApi.generate();
        toast.dismiss();
        toast.success('Roadmap updated! 🚀');
        router.push('/roadmap');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
    </div>
  );

  // VIEW MODE
  if (!isEditing) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="page-header text-xl sm:text-2xl text-foreground">Your Career Profile</h2>
          <Button onClick={() => { setIsEditing(true); setStep(0); }} className="rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white shrink-0">
            <Edit2 className="w-4 h-4" /> <span className="hidden sm:inline">Edit Profile</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="md:col-span-2 glass-card border-0 overflow-hidden">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-foreground truncate">{form.targetRole}</h3>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm">
                    <Briefcase className="w-4 h-4 shrink-0" /> {form.experienceLevel.charAt(0).toUpperCase() + form.experienceLevel.slice(1)} • {form.yearsOfExperience}y Experience
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" /> Education
                </h4>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                  <p className="text-foreground font-medium">{form.education.level.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                  <p className="text-sm text-muted-foreground">{form.education.field || 'General Studies'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Current Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {form.currentSkills.map((s) => (
                    <Badge key={s.name} variant="secondary" className="px-3 py-1 bg-muted/50 border-0 text-foreground transition-colors hover:bg-muted font-medium">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side Info */}
          <div className="space-y-6">
            <Card className="glass-card border-0">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Weekly Commitment</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-lg font-bold">{form.timeCommitmentHoursPerWeek}h / week</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Learning Style</p>
                  <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
                    {form.preferredLearningStyle.charAt(0).toUpperCase() + form.preferredLearningStyle.slice(1)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => router.push('/roadmap')} variant="outline" className="w-full rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5">
              View Your Roadmap <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE (Original Form)
  return (
    <div className="max-w-2xl mx-auto px-4 py-2">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="page-header text-lg sm:text-xl truncate text-foreground">Update Profile</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-[10px] h-7 px-2 text-muted-foreground hover:text-foreground shrink-0">Cancel</Button>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{step + 1} / {steps.length}</span>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
        <div className="flex gap-4 mt-2 overflow-x-auto no-scrollbar pb-2">
          {steps.map((s, i) => (
            <span key={i} className={`text-[10px] whitespace-nowrap ${i <= step ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-muted-foreground'}`}>{s}</span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base sm:text-lg text-foreground">{steps[step]}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Experience Level</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {expLevels.map(({ value, label, desc }) => (
                        <button key={value} onClick={() => setForm({ ...form, experienceLevel: value })}
                          className={`p-3 rounded-xl text-left transition-all border ${
                            form.experienceLevel === value 
                              ? `border-purple-500 ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100/80 text-purple-950'} ring-1 ring-purple-500/20` 
                              : 'border-border hover:border-purple-300'
                          }`}>
                          <p className="font-bold text-sm">{label}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Years of Experience</Label>
                      <Input type="number" min={0} max={50} value={form.yearsOfExperience || ''}
                        onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value === '' ? 0 : Number(e.target.value) })} className="h-10 text-foreground bg-muted/30" />
                    </div>
                    <div className="space-y-1.5" ref={eduRef}>
                      <Label className="text-xs">Education Level</Label>
                      <div className={`relative transition-all duration-300 ${eduOpen ? 'mb-52 sm:mb-0' : 'mb-0'}`}>
                        <button
                          type="button"
                          onClick={() => setEduOpen(!eduOpen)}
                          className="w-full h-10 px-3 flex items-center justify-between rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left"
                        >
                          <span className="truncate">
                            {form.education.level.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${eduOpen ? '-rotate-90' : 'rotate-90'} text-muted-foreground`} />
                        </button>

                        <AnimatePresence>
                          {eduOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className={`absolute z-50 top-full left-0 w-full mt-2 py-2 rounded-xl border border-border shadow-2xl ring-1 max-h-48 overflow-y-auto custom-scrollbar transition-colors duration-200 ${
                                isDark ? 'bg-[#0a0a0f] text-foreground ring-white/10' : 'bg-white text-black ring-black/5'
                              }`}
                            >
                              {['high_school', 'associate', 'bachelor', 'master', 'phd', 'self_taught', 'bootcamp'].map((l) => (
                                <button
                                  key={l}
                                  type="button"
                                  onClick={() => {
                                    setForm({ ...form, education: { ...form.education, level: l } });
                                    setEduOpen(false);
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm transition-all ${
                                    form.education.level === l 
                                      ? 'bg-purple-600 text-white font-bold shadow-sm' 
                                      : `${isDark ? 'text-gray-300 hover:bg-purple-500/10 hover:text-purple-400' : 'text-black hover:bg-purple-50 hover:text-purple-600'}`
                                  }`}
                                >
                                  {l.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Field of Study</Label>
                    <Input placeholder="e.g. Computer Science" value={form.education.field}
                      onChange={(e) => setForm({ ...form, education: { ...form.education, field: e.target.value } })} className="h-10 text-foreground bg-muted/30" />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Add Skills</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Type a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill(newSkill)} className="h-10 text-foreground bg-muted/30" />
                      <Button onClick={() => addSkill(newSkill)} variant="outline" size="icon" className="h-10 w-10 rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">Quick add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {commonSkills.filter((s) => !form.currentSkills.find((cs) => cs.name === s)).map((s) => (
                        <button key={s} onClick={() => addSkill(s)} className="text-[10px] px-2.5 py-1 bg-muted rounded-full hover:bg-purple-500/10 hover:text-purple-500 border border-transparent hover:border-purple-500/20 transition-all font-medium">{s}</button>
                      ))}
                    </div>
                  </div>
                  {form.currentSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {form.currentSkills.map(({ name, level }) => (
                        <Badge key={name} variant="secondary" className="gap-2 pl-3 pr-1.5 py-1.5 rounded-2xl text-foreground bg-muted hover:bg-muted/80 border-0 shadow-sm items-start">
                          <span className="leading-relaxed">{name}</span>
                          <button 
                            onClick={() => removeSkill(name)} 
                            className="mt-0.5 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Target Role *</Label>
                    <Input placeholder="e.g. Full Stack Developer, ML Engineer..." value={form.targetRole}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="h-11 text-foreground bg-muted/30" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs flex justify-between items-center text-muted-foreground">
                      <span>Weekly Hours Commitment</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-base">{form.timeCommitmentHoursPerWeek}h</span>
                    </Label>
                    <input type="range" min={1} max={60} value={form.timeCommitmentHoursPerWeek}
                      onChange={(e) => setForm({ ...form, timeCommitmentHoursPerWeek: +e.target.value })}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600" />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold italic"><span>1 HOUR</span><span>60 HOURS</span></div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Preferred Learning Style</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[{ v: 'video', l: '🎥 Video' }, { v: 'reading', l: '📚 Reading' }, { v: 'hands_on', l: '🛠 Hands-On' }, { v: 'mixed', l: '🔀 Mixed' }].map(({ v, l }) => (
                        <button key={v} onClick={() => setForm({ ...form, preferredLearningStyle: v })}
                          className={`py-2 px-3 rounded-xl text-[10px] sm:text-xs font-bold border transition-all ${form.preferredLearningStyle === v ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/20' : 'border-border hover:border-purple-300 text-muted-foreground'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 shadow-inner">
                    <p className="text-sm flex justify-between"><span className="text-muted-foreground">Target Role:</span> <span className="font-bold text-foreground">{form.targetRole || '—'}</span></p>
                    <p className="text-sm flex justify-between"><span className="text-muted-foreground">Experience:</span> <span className="font-bold text-foreground">{form.experienceLevel} · {form.yearsOfExperience}y</span></p>
                    <p className="text-sm flex justify-between"><span className="text-muted-foreground">Commitment:</span> <span className="font-bold text-foreground">{form.timeCommitmentHoursPerWeek}h / week</span></p>
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                      {form.currentSkills.map((s) => (
                        <Badge key={s.name} variant="secondary" className="text-[10px] py-0.5 px-2 max-w-full">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-sm shadow-purple-500/5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-1" />
                      <div className="text-sm">
                        <p className="font-bold text-purple-700 dark:text-purple-300">Ready to update your roadmap!</p>
                        <p className="text-muted-foreground text-xs mt-1 leading-relaxed">Changes will be used to intelligently personalize your career journey.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex justify-between mt-6 gap-4">
        <Button variant="outline" onClick={prev} disabled={step === 0} className="rounded-xl gap-2 flex-1 sm:flex-none h-11 border-primary/20 hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={next} className="rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none h-11 shadow-lg shadow-purple-600/20 active:scale-95 transition-transform">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={loading} className="rounded-xl gap-2 bg-linear-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white flex-1 sm:flex-none h-11 shadow-lg shadow-purple-600/20 active:scale-95 transition-transform">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save & Update'}
          </Button>
        )}
      </div>
    </div>
  );
}
