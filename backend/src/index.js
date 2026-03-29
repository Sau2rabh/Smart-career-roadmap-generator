require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const roadmapRoutes = require('./routes/roadmap.routes');
const skillGapRoutes = require('./routes/skillGap.routes');
const chatRoutes = require('./routes/chat.routes');
const progressRoutes = require('./routes/progress.routes');
const projectsRoutes = require('./routes/projects.routes');
const resumeRoutes = require('./routes/resume.routes');
const interviewRoutes = require('./routes/interview.routes');
const youtubeRoutes = require('./routes/youtube.routes');
const learnRoutes = require('./routes/learn.routes');

const app = express();

// ─── Security & Initial Middleware ────────────────────────────────────────────
app.use(
  cors({
    // Reflect the requesting origin to ensure credentials work without strict string matching issues.
    origin: function(origin, callback) {
      callback(null, origin || true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Bypass-Tunnel-Reminder'],
    optionsSuccessStatus: 200,
  })
);

// Other security headers and rate limiting
app.use(helmet());
app.use(globalLimiter);

// ─── Connect to Database ──────────────────────────────────────────────────────
connectDB();

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Career Roadmap API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/learn', learnRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // ─── Self-Pinger for Free Tier Hosting ──────────────────────────────────────
  // Render and similar free tiers sleep after 15 minutes of inactivity.
  // This interval pings the server every 14 minutes to keep it awake.
  const backendUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  if (backendUrl) {
    const protocol = backendUrl.startsWith('https') ? require('https') : require('http');
    console.log(`🕒 Starting self-ping service for: ${backendUrl}`);
    
    // Ping every 14 minutes (14 * 60 * 1000 milliseconds)
    setInterval(() => {
      protocol.get(`${backendUrl}/api/health`, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ [Self-Ping] Server kept alive at ${new Date().toLocaleString()}`);
        } else {
          console.error(`⚠️ [Self-Ping] Failed with status code: ${res.statusCode}`);
        }
      }).on('error', (err) => {
        console.error(`❌ [Self-Ping] Error: ${err.message}`);
      });
    }, 14 * 60 * 1000);
    } else if (process.env.NODE_ENV !== 'development') {
      console.log(`ℹ️ [Self-Ping] Not started. To enable, set SERVER_URL env variable (Render sets RENDER_EXTERNAL_URL automatically).`);
    }
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
