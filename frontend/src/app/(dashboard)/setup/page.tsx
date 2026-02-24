'use client';
import { useState } from 'react';
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
import { Loader2, Plus, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
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
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
      toast.success('Profile saved! Generating your roadmap...');
      await roadmapApi.generate();
      await refreshUser();
      toast.success('Roadmap generated! 🚀');
      router.push('/roadmap');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Setup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="page-header">Profile Setup</h2>
          <span className="text-sm text-muted-foreground">{step + 1} / {steps.length}</span>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((s, i) => (
            <span key={i} className={`text-xs ${i <= step ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-muted-foreground'}`}>{s}</span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">{steps[step]}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {step === 0 && (
                <>
                  <div className="space-y-1.5">
                    <Label>Experience Level</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {expLevels.map(({ value, label, desc }) => (
                        <button key={value} onClick={() => setForm({ ...form, experienceLevel: value })}
                          className={`p-3 rounded-xl text-left text-sm transition-all border ${form.experienceLevel === value ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'border-border hover:border-purple-300'}`}>
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Years of Experience</Label>
                      <Input type="number" min={0} max={50} value={form.yearsOfExperience}
                        onChange={(e) => setForm({ ...form, yearsOfExperience: +e.target.value })} className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Education Level</Label>
                      <select value={form.education.level} onChange={(e) => setForm({ ...form, education: { ...form.education, level: e.target.value } })}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        {['high_school', 'associate', 'bachelor', 'master', 'phd', 'self_taught', 'bootcamp'].map((l) => (
                          <option key={l} value={l}>{l.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Field of Study</Label>
                    <Input placeholder="e.g. Computer Science" value={form.education.field}
                      onChange={(e) => setForm({ ...form, education: { ...form.education, field: e.target.value } })} className="h-10" />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <Label>Add Skills</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Type a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill(newSkill)} className="h-10" />
                      <Button onClick={() => addSkill(newSkill)} variant="outline" size="icon" className="h-10 w-10 rounded-xl"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Quick add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {commonSkills.filter((s) => !form.currentSkills.find((cs) => cs.name === s)).map((s) => (
                        <button key={s} onClick={() => addSkill(s)} className="text-xs px-2.5 py-1 bg-muted rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors">{s}</button>
                      ))}
                    </div>
                  </div>
                  {form.currentSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.currentSkills.map(({ name, level }) => (
                        <Badge key={name} variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                          {name}
                          <button onClick={() => removeSkill(name)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-1.5">
                    <Label>Target Role *</Label>
                    <Input placeholder="e.g. Full Stack Developer, ML Engineer..." value={form.targetRole}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Hours per week you can dedicate: <span className="text-purple-600 font-bold">{form.timeCommitmentHoursPerWeek}h</span></Label>
                    <input type="range" min={1} max={60} value={form.timeCommitmentHoursPerWeek}
                      onChange={(e) => setForm({ ...form, timeCommitmentHoursPerWeek: +e.target.value })}
                      className="w-full accent-purple-600" />
                    <div className="flex justify-between text-xs text-muted-foreground"><span>1h</span><span>60h</span></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preferred Learning Style</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[{ v: 'video', l: '🎥 Video' }, { v: 'reading', l: '📚 Reading' }, { v: 'hands_on', l: '🛠 Hands-On' }, { v: 'mixed', l: '🔀 Mixed' }].map(({ v, l }) => (
                        <button key={v} onClick={() => setForm({ ...form, preferredLearningStyle: v })}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${form.preferredLearningStyle === v ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'border-border hover:border-purple-300'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                    <p className="text-sm"><span className="font-medium">Target Role:</span> {form.targetRole || '—'}</p>
                    <p className="text-sm"><span className="font-medium">Experience:</span> {form.experienceLevel} · {form.yearsOfExperience} years</p>
                    <p className="text-sm"><span className="font-medium">Weekly commitment:</span> {form.timeCommitmentHoursPerWeek} hours</p>
                    <p className="text-sm"><span className="font-medium">Learning style:</span> {form.preferredLearningStyle}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.currentSkills.map((s) => <Badge key={s.name} variant="secondary" className="text-xs">{s.name}</Badge>)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-purple-700 dark:text-purple-300">Ready to generate your roadmap!</p>
                        <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">AI will analyze your profile and create a personalized {form.timeCommitmentHoursPerWeek >= 20 ? '3-6' : '6-12'} month career roadmap.</p>
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
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prev} disabled={step === 0} className="rounded-xl gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={next} className="rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={loading} className="rounded-xl gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating roadmap...' : 'Generate My Roadmap'}
          </Button>
        )}
      </div>
    </div>
  );
}
