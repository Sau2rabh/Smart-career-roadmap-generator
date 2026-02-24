# Smart Career Roadmap Generator — Backend

## Setup

```bash
cd backend
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, OPENAI_API_KEY
npm install
npm run dev
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/signup | ❌ | Register |
| POST | /api/auth/login | ❌ | Login |
| POST | /api/auth/refresh | ❌ | Refresh tokens |
| GET  | /api/auth/me | ✅ | Current user |
| POST | /api/auth/logout | ✅ | Logout |
| GET  | /api/profile | ✅ | Get profile |
| POST | /api/profile | ✅ | Create/update profile |
| POST | /api/roadmap/generate | ✅ | AI roadmap generation |
| GET  | /api/roadmap | ✅ | Active roadmap |
| GET  | /api/roadmap/all | ✅ | All roadmaps |
| PUT  | /api/roadmap/:id/task/:tid/complete | ✅ | Toggle task |
| POST | /api/skill-gap/analyze | ✅ | PDF skill gap |
| POST | /api/skill-gap/analyze-text | ✅ | Text skill gap |
| POST | /api/chat/message | ✅ | AI mentor chat |
| GET  | /api/chat/history | ✅ | Chat history |
| DELETE | /api/chat/history | ✅ | Clear history |
| GET  | /api/progress | ✅ | Progress/XP |
| POST | /api/progress/claim-xp | ✅ | Claim XP |
| GET  | /api/projects/recommendations | ✅ | AI projects |
| GET  | /api/resume | ✅ | Get resume |
| POST | /api/resume/optimize | ✅ | AI optimize |
| POST | /api/interview/generate | ✅ | Generate Q's |
| POST | /api/interview/answer | ✅ | Submit answer |
| GET  | /api/interview/history | ✅ | Interview history |
