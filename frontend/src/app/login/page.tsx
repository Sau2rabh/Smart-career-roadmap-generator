'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Sparkles, Eye, EyeOff, Loader2, Mail, Shield, ArrowLeft, KeyRound, Compass } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

type Step = 'credentials' | 'otp';

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'credentials', label: 'Login', icon: <KeyRound className="w-3.5 h-3.5" /> },
  { id: 'otp', label: 'Verify', icon: <Shield className="w-3.5 h-3.5" /> },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const iv = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // Step 1: Initialize Login (Email + Password)
  const handleLoginInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { 
      toast.error('Please enter both email and password'); 
      return; 
    }
    setLoading(true);
    try {
      await authApi.loginInit({ email, password });
      toast.success('Credentials verified! Sending OTP... 📬');
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP and Complete Login
  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      // 1. Verify OTP (marks loginOtpVerifiedAt in DB)
      await authApi.verifyOtp({ email, otp, purpose: 'login' as any });
      
      // 2. Complete Login (checks password and loginOtpVerifiedAt)
      const res = await authApi.login({ email, password });
      const { accessToken, user } = res.data.data;
      
      login(accessToken, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🎉`);
      router.push(user.profileCompleted ? '/dashboard' : '/setup');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await authApi.loginInit({ email, password });
      toast.success('OTP resent!');
      startResendTimer();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP');
    } finally { setLoading(false); }
  };

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen grad-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8 group">
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/25 mb-4 group-hover:scale-110 transition-transform duration-500"
          >
            <motion.div
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Compass className="w-9 h-9 text-white" />
            </motion.div>
          </motion.div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Smart Career Roadmap</h1>
          <p className="text-muted-foreground text-sm mt-2">Your AI-powered career co-pilot</p>
        </div>

        <Card className="glass-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to continue your journey</CardDescription>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-4">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${i <= currentStepIndex ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-muted/50 text-muted-foreground border border-border/40'}`}>
                    {s.icon}
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px transition-colors ${i < currentStepIndex ? 'bg-purple-500/50' : 'bg-border/30'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">

              {/* STEP 1: Credentials */}
              {step === 'credentials' && (
                <motion.form key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleLoginInit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPwd ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPwd(!showPwd)}
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end -mt-1">
                    <Link href="/forgot-password" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                    {loading ? 'Verifying...' : 'Continue →'}
                  </Button>
                </motion.form>
              )}

              {/* STEP 2: OTP */}
              {step === 'otp' && (
                <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyAndLogin} className="space-y-5">
                  <div className="flex flex-col items-center py-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">We sent a login code to</p>
                    <p className="font-semibold text-sm mt-0.5">{email}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="● ● ● ● ● ●"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-14 text-center text-2xl tracking-[0.5em] font-bold"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading || otp.length !== 6} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold rounded-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                    {loading ? 'Verifying...' : 'Complete Login'}
                  </Button>
                  <div className="flex items-center justify-between">
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => setStep('credentials')}>
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </button>
                    <button type="button" className={`text-xs ${resendTimer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-purple-500 hover:underline'}`} onClick={handleResendOtp} disabled={resendTimer > 0 || loading}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.form>
              )}

            </AnimatePresence>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                Create one →
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
