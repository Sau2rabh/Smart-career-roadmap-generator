'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Map, Zap, MessageSquare, TrendingUp, FileText, Mic, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const features = [
  { icon: Map, title: 'AI Roadmap Generator', desc: 'Personalized month-by-month career plans powered by GPT-4o', color: 'text-purple-500' },
  { icon: Zap, title: 'Skill Gap Analyzer', desc: 'Upload your resume and discover exactly what you\'re missing', color: 'text-yellow-500' },
  { icon: MessageSquare, title: 'Career Mentor Chat', desc: 'Context-aware AI mentor that knows your goals and skills', color: 'text-blue-500' },
  { icon: TrendingUp, title: 'Progress Tracker', desc: 'XP system, streaks, badges, and activity heatmap', color: 'text-green-500' },
  { icon: FileText, title: 'Resume Builder', desc: 'AI-optimized resumes with ATS scoring', color: 'text-orange-500' },
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
    <div className="min-h-screen grad-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">Career Roadmap AI</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login"><Button variant="ghost" className="rounded-xl">Login</Button></Link>
          <Link href="/signup"><Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl shadow-lg shadow-purple-500/20">Get Started Free</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm px-4 py-1.5 rounded-full mb-6 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Powered by GPT-4o Mini
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
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-3xl font-black gradient-text">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
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
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} whileHover={{ y: -6 }}>
              <div className="glass-card rounded-2xl p-6 h-full">
                <Icon className={`w-8 h-8 ${color} mb-3`} />
                <h3 className="font-bold text-base mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card rounded-3xl p-10 bg-gradient-to-br from-purple-600 to-blue-600 border-0 text-white">
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-black mb-3">Ready to accelerate your career?</h2>
          <p className="text-purple-200 mb-6">Join thousands of developers building their dream careers with AI</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-bold text-base px-10 h-12">
              Get Started Free → 
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
