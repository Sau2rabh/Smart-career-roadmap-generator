'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Map, Zap, MessageSquare, TrendingUp, FileText, Mic, ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const features = [
  { icon: Map, title: 'AI Roadmap Generator', desc: 'Personalized month-by-month career plans powered by GPT-4o', color: 'text-purple-500' },
  { icon: Zap, title: 'Skill Gap Analyzer', desc: 'Upload your resume and discover exactly what you\'re missing', color: 'text-yellow-500' },
  { icon: MessageSquare, title: 'Career Mentor Chat', desc: 'Context-aware AI mentor that knows your goals and skills', color: 'text-blue-500' },
  { icon: TrendingUp, title: 'Progress Tracker', desc: 'XP system, streaks, badges, and activity heatmap', color: 'text-green-500' },
  { icon: Sparkles, title: 'Resume Optimization', desc: 'AI-optimized resumes with ATS scoring', color: 'text-orange-500' },
  { icon: FileText, title: 'Resume Builder', desc: 'Build professional resumes from scratch', color: 'text-purple-500' },
  { icon: Mic, title: 'Mock Interviews', desc: 'AI-powered Q&A with instant graded feedback', color: 'text-pink-500' },
];

const stats = [
  { value: '10+', label: 'Career Features' },
  { value: 'GPT-4o', label: 'AI Model' },
  { value: '100%', label: 'Personalized' },
  { value: '∞', label: 'Career Paths' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen grad-bg relative overflow-hidden">
      {/* Animated Background Light Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-[-10%] w-[40rem] h-[40rem] bg-purple-400/20 dark:bg-purple-500/25 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 dark:opacity-100"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-40 right-[-10%] w-[35rem] h-[35rem] bg-blue-400/20 dark:bg-cyan-500/25 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 dark:opacity-100"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0], y: [0, -100, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-20 left-[20%] w-[45rem] h-[45rem] bg-pink-400/20 dark:bg-fuchsia-500/25 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 dark:opacity-100"
        />
      </div>

      <div className="relative z-10">
      {/* Nav */}
      <nav className="flex items-center justify-between px-3 md:px-6 py-4 mx-auto max-w-6xl">
        <div className="flex items-center gap-2 group cursor-pointer">
          <motion.div 
            animate={{ 
              y: [0, -4, 0],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Compass className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
          <span className="font-bold text-base sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Smart Career <span className="hidden xs:inline sm:inline">Roadmap</span></span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/login"><Button variant="ghost" className="rounded-xl px-2 sm:px-4 text-xs sm:text-sm">Login</Button></Link>
          <Link href="/signup"><Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl shadow-lg shadow-purple-500/20 text-xs sm:text-sm px-3 sm:px-6 mr-1 sm:mr-0">Get Started Free</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white dark:bg-purple-500/20 dark:text-purple-300 dark:border dark:border-purple-500/30 text-sm px-4 py-1.5 rounded-full mb-6 font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-white dark:text-purple-400" /> Powered by GPT-4o Mini
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Your AI-Powered<br />
            <span className="gradient-text">Career Co-Pilot</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Generate personalized career roadmaps, analyze skill gaps, chat with an AI mentor, and track your progress — all in one platform built for ambitious developers.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl text-base px-8 h-12 shadow-xl shadow-purple-500/25 gap-2">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-xl text-base px-8 h-12">Sign In</Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            {['No credit card', 'Free to start', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />{t}</span>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {stats.map(({ value, label }) => (
            <motion.div key={label} whileHover={{ y: -4, scale: 1.05 }} className="glass-card rounded-2xl p-4 text-center transition-all duration-300 hover:shadow-lg dark:hover:shadow-purple-500/10 hover:bg-white/60 dark:hover:bg-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              <p className="text-3xl font-black gradient-text transition-transform duration-300 group-hover:scale-110">{value}</p>
              <p className="text-sm text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-foreground">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need to <span className="gradient-text">level up</span></h2>
          <p className="text-muted-foreground">A complete career development platform, powered by AI</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} 
              whileHover={{ y: -8, scale: 1.02 }} className="group">
              <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 group-hover:bg-white/60 dark:group-hover:bg-white/10 group-hover:shadow-xl dark:group-hover:shadow-purple-500/10 relative overflow-hidden group-hover:border-purple-500/30">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                <Icon className={`w-8 h-8 ${color} mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`} />
                <h3 className="font-bold text-base mb-1 transition-colors duration-300">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto rounded-3xl p-10 bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl shadow-purple-500/20 text-white relative overflow-hidden">
          {/* Subtle background pattern/overlay for visual interest */}
          <div className="absolute inset-0 bg-white/5 opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-black mb-3 text-white">Ready to accelerate your career?</h2>
            <p className="text-purple-100 mb-6">Join thousands of developers building their dream careers with AI</p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 dark:bg-white dark:text-purple-600 dark:hover:bg-purple-50 rounded-xl font-bold text-base px-10 h-12 shadow-lg transition-all hover:scale-105">
                Get Started Free → 
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
