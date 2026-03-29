'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Sparkles, Eye, EyeOff, Loader2, CheckCircle2, Mail, Shield, ArrowLeft, KeyRound, Compass } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.sendOtp({ email, purpose: 'forgot_password' });
      toast.success('OTP sent! Check your inbox 📬');
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Email not found');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp, purpose: 'forgot_password' });
      toast.success('OTP verified! ✅');
      setStep('reset');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, password });
      toast.success('Password reset successfully! 🎉');
      setStep('done');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await authApi.sendOtp({ email, purpose: 'forgot_password' });
      toast.success('OTP resent!');
      startResendTimer();
    } catch (err: any) {
      toast.error('Failed to resend OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grad-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        {/* Logo */}
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
          <p className="text-muted-foreground text-sm mt-2">We'll get you back in</p>
        </div>

        <Card className="glass-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-500" /> Forgot Password
            </CardTitle>
            <CardDescription>
              {step === 'email' && 'Enter your registered email to receive an OTP.'}
              {step === 'otp' && 'Enter the 6-digit OTP sent to your email.'}
              {step === 'reset' && 'Choose a new secure password.'}
              {step === 'done' && 'Your password has been reset successfully!'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">

              {/* STEP 1: Email */}
              {step === 'email' && (
                <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Registered Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                    {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Remembered it?{' '}
                    <Link href="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Sign in</Link>
                  </p>
                </motion.form>
              )}

              {/* STEP 2: OTP */}
              {step === 'otp' && (
                <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex flex-col items-center py-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">OTP sent to</p>
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
                  <Button type="submit" disabled={loading || otp.length !== 6} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  <div className="flex items-center justify-between">
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => setStep('email')}>
                      <ArrowLeft className="w-3 h-3" /> Change email
                    </button>
                    <button type="button" className={`text-xs ${resendTimer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-purple-500 hover:underline'}`} onClick={handleResendOtp} disabled={resendTimer > 0 || loading}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: New Password */}
              {step === 'reset' && (
                <motion.form key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword} className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-xs text-green-600 dark:text-green-400">Identity verified! Set your new password.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input id="newPassword" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPwd(!showPwd)}>
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input id="confirmNewPassword" type={showConfirmPwd ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11 pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                        {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                  <Button type="submit" disabled={loading || password !== confirmPassword || password.length < 8} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </motion.form>
              )}

              {/* STEP 4: Done */}
              {step === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-green-500/25">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Password Reset!</h3>
                    <p className="text-sm text-muted-foreground mt-1">You can now sign in with your new password.</p>
                  </div>
                  <Button onClick={() => router.push('/login')} className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl">
                    Go to Sign In →
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
