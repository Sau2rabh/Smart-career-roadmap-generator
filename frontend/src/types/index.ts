export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  type: 'learn' | 'build' | 'practice' | 'read' | 'watch';
  description?: string;
  completed: boolean;
  estimatedHours: number;
}

export interface Week {
  week: number;
  title: string;
  tasks: Task[];
}

export interface MonthlyPlan {
  month: number;
  title: string;
  weeks: Week[];
  skills: string[];
}

export interface Roadmap {
  _id: string;
  title: string;
  summary: string;
  targetRole: string;
  totalDurationMonths: number;
  completionPercentage: number;
  monthlyPlan: MonthlyPlan[];
}

export interface Progress {
  xp: number;
  level: number;
  streak: number;
  totalTasksCompleted: number;
  activityLog: {
    date: string;
    xpEarned: number;
    tasksCompleted: number;
  }[];
  badges: {
    id: string;
    name: string;
    icon: string;
    description: string;
    dateEarned: string;
  }[];
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techStack: string[];
  estimatedHours: number;
}

export interface ProjectGuideStep {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

export interface ProjectGuide {
  overview: string;
  estimatedCompletionTime: string;
  steps: ProjectGuideStep[];
  resources: { name: string; url: string }[];
}
