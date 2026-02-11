# PARE - Personalized Academic Recovery Engine

A stress-aware academic recovery planning system that helps students get back on track with intelligent, adaptive scheduling.

## Features

- 🎯 **Priority Scoring**: Automatically calculates task urgency using a custom AI formula
- 😰 **Stress-Aware Planning**: Adjusts daily workload based on real-time stress levels
- 📅 **Smart Scheduling**: Generates realistic study sessions with breaks
- 🔄 **Adaptive Re-planning**: AI-powered adjustments based on completion trends
- 📊 **Risk Assessment**: Real-time prediction of failure/burnout risk using ML
- 📉 **Visual Analytics**: Interactive dashboard to monitor your recovery path

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI Engine**: Python, FastAPI, Scikit-learn, Pandas
- **Authentication**: JWT
- **Charts**: Recharts

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 6.0+
- npm

### Installation

1. **Clone and navigate**:
```bash
cd Lets_Plot
```

2. **Install dependencies**:
```bash
# Backend (Node.js)
cd backend && npm install

# AI Engine (Python)
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Frontend
cd ../frontend && npm install
```

3. **Configure environment**:
```bash
# Backend: backend/.env already configured
# Frontend: frontend/.env.local already configured
```

4. **Start MongoDB**:
```bash
sudo systemctl start mongod
```

5. **Run the application**:
```bash
# Terminal 1: Node.js Backend
cd backend && npm run dev

# Terminal 2: Python AI Engine
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 3: Next.js Frontend
cd frontend && npm run dev
```

6. **Open your browser**:
```
http://localhost:3000
```

## Usage

1. **Register**: Create an account with your stress level (1-10) and daily available hours
2. **Add Subjects**: Enter your subjects with topics, deadlines, and difficulty ratings
3. **Generate Plan**: Click "Generate Plan" to create your personalized recovery schedule
4. **Track Progress**: Mark sessions as complete as you study
5. **Adapt**: Click "Regenerate Plan" to adjust for missed sessions or changes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Plans
- `POST /api/plans/generate` - Generate recovery plan
- `POST /api/plans/regenerate` - Regenerate plan
- `GET /api/plans/active` - Get active plan
- `PUT /api/plans/:planId/sessions/:sessionId/complete` - Mark session complete

## Deployment

### Backend (Render/Railway)
1. Create Web Service
2. Set environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Random secure string
   - `NODE_ENV`: production
3. Deploy from `backend` directory

### Frontend (Vercel/Netlify)
1. Create new project
2. Set root directory: `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Update `MONGODB_URI` in backend

## How It Works

### Priority Calculation
```
Priority = UrgencyScore × (1 + AvgDifficulty / 10)
```

### Stress-Aware Scheduling
```
EffectiveDailyHours = DailyHours × (1 - (StressLevel - 1) / 20)
```

Example: Stress level 7 reduces 6 hours to 4.2 effective hours.

## Project Structure

```
Lets_Plot/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.js        # Express app
└── frontend/
    └── src/
        ├── app/         # Next.js pages
        ├── contexts/    # React contexts
        └── lib/         # API client
```

## License

MIT

## Author

Built with ❤️ for students everywhere
