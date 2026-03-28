'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface LoadingProgressProps {
  label: string;
  isComplete?: boolean;
}

export default function LoadingProgress({ label, isComplete = false }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (isComplete) {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(prev + 20, 100);
        }

        if (prev < 80) {
          return prev + (Math.random() * 4 + 1);
        } else if (prev < 98) {
          return prev + 0.3;
        }
        return prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6 w-full max-w-md mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-500/20 relative overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <Sparkles className="w-10 h-10 text-white relative z-10" />
      </div>
      
      <div className="w-full space-y-3">
        <div className="flex justify-between items-end">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs font-mono font-bold text-purple-500">{Math.round(progress)}%</p>
        </div>
        <Progress value={progress} className="h-2 bg-muted transition-all" />
        <p className="text-[10px] text-center text-muted-foreground animate-pulse">
          {progress < 40 ? "Initializing AI models..." : progress < 80 ? "Processing your data..." : "Finalizing results..."}
        </p>
      </div>
    </div>
  );
}
