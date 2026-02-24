const { z } = require('zod');
const { AppError } = require('./errorHandler');

// Middleware factory: validates req.body against a Zod schema
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return next(new AppError(message, 400));
    }
    next(error);
  }
};

// ─── Auth Schemas ────────────────────────────────────────────────────────────
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Profile Schema ──────────────────────────────────────────────────────────
const profileSchema = z.object({
  targetRole: z.string().min(2, 'Target role must be at least 2 characters'),
  experienceLevel: z.enum(['student', 'entry', 'junior', 'mid', 'senior', 'lead']),
  currentSkills: z.array(
    z.object({
      name: z.string().min(1),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
    })
  ).min(1, 'At least one skill is required'),
  timeCommitmentHoursPerWeek: z.number().min(1).max(80),
  education: z.object({
    level: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'self_taught', 'bootcamp']).optional(),
    field: z.string().optional(),
    institution: z.string().optional(),
    graduationYear: z.number().nullable().optional(),
  }).optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  preferredLearningStyle: z.enum(['video', 'reading', 'hands_on', 'mixed']).optional(),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
});

// ─── Chat Schema ─────────────────────────────────────────────────────────────
const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
});

// ─── Interview Schema ────────────────────────────────────────────────────────
const interviewGenerateSchema = z.object({
  targetRole: z.string().min(2),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

const interviewAnswerSchema = z.object({
  interviewId: z.string(),
  questionId: z.string(),
  answer: z.string().min(1).max(5000),
});

module.exports = {
  validate,
  schemas: {
    signup: signupSchema,
    login: loginSchema,
    profile: profileSchema,
    chat: chatSchema,
    interviewGenerate: interviewGenerateSchema,
    interviewAnswer: interviewAnswerSchema,
  },
};
