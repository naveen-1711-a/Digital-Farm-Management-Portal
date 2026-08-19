# Digital Farm Management Portal

A comprehensive, AI-driven digital platform designed to optimize farm operations, track biosecurity, and monitor animal health. This platform leverages a modern web stack alongside autonomous AI agents and machine learning models to provide real-time insights, anomaly detection, and farm orchestration.

## ✅ Features Implemented

### Overall Admin
- Full dashboard with system-wide statistics
- Create / Edit / Delete Farm Admins, Managers, and Workers
- Manage master data (Breeds, Diseases, Vaccines, Feed Categories, Medicine Categories)
- View all farms and monitor overall system health
- Toggle user active/inactive status

### Farm Administrator (Farm Admin)
- Dashboard with farm-specific stats (Animals, Sheds, Workers)
- Add and manage sheds and livestock inventory
- Add, Edit, and Manage Farm Workers and Veterinarians
- Manage Biosecurity protocols and audit logs
- Monitor feed and medicine inventory levels
- **FarmGuard Dashboard**: View autonomous agent insights and ML predictions (e.g., Chicken Feed Prediction)
- **Integrity Overview**: Monitor real-time sensor anomaly alerts and risk signals

### Farm Manager
- Login (Account created by Admin or Farm Admin only)
- Task and Calendar event management
- Record daily attendance for farm workers
- Log visitor entry/exit and vehicle tracking
- Update feed consumption and medicine usage
- Log vaccination drives and health treatments
- **Integrity Center**: Investigate correlation engine reports and agent actions

### Farm Worker
- Login (Account created by Admin or Farm Admin)
- View assigned daily tasks and calendar schedules
- Mark daily attendance and shift timings
- Report on-ground animal health observations and feed levels
- Receive notifications for critical tasks (e.g., vaccination drives)

### Autonomous AI & ML Agents
- **FarmGuard Agent**: Continuously monitors farm integrity and detects anomalies without human intervention.
- **Biosecurity & Audit Detectors**: Automatically identifies breaches in protocols based on log patterns.
- **Groq Reasoning Engine**: Investigates root causes by correlating multiple sensor and log data points via LLaMA 3.
- **ML Predictions**: Forecasts chicken feed requirements and detects abnormal livestock behavior using Scikit-Learn (Isolation Forest).

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling & Animation**: Framer Motion, Spline (3D), React Icons
- **Data Visualization**: Recharts, Chart.js
- **Utilities**: Axios, DOMPurify, jsPDF (for report generation)

### Backend (Node.js)
- **Server**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Task Scheduling**: node-cron

### ML Microservice (Python)
- **API Framework**: FastAPI & Uvicorn
- **Data Science**: Scikit-Learn, Pandas, NumPy, Joblib
- **Validation**: Pydantic

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.9+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/naveen-1711-a/Digital-Farm-Management-Portal.git
cd Digital-Farm-Management-Portal
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Copy the `.env.example` file and rename it to `.env`.
- Fill in your `MONGODB_URI`, `JWT_SECRET`, and `GROQ_API_KEY`.
- Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

### 4. ML Microservice Setup
```bash
# In a new terminal
cd backend/agents/ml_service
python -m venv env
# On Windows: env\Scripts\activate
# On Mac/Linux: source env/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5001
```

## 📁 Full Project Structure

```text
Digital-Farm-Management-Portal/
├── ai/                                   # Standalone AI Models, Plots & Saved Datasets
│   ├── models/
│   ├── plots/
│   └── saved_model/
├── Chicken_Feed_Prediction/              # Feed optimization ML sub-project
│   ├── data/
│   ├── encoders/
│   └── models/
├── backend/                              # Express.js Core Server
│   ├── agents/                           # FarmGuard Autonomous Agent System
│   │   ├── actions/                      # Automated response triggers
│   │   ├── autonomous/                   # Agent scheduler & sensor simulator
│   │   ├── detectors/                    # Anomaly detectors (Feed, Animals, Biosecurity, etc)
│   │   ├── groq/                         # Groq LLM integration and reasoning
│   │   ├── investigation/                # Correlation engine & evidence collector
│   │   ├── memory/                       # Agent context memory
│   │   ├── orchestrator/                 # Event bus and agent orchestration
│   │   ├── risk/                         # Risk scoring and rule engine
│   │   └── ml_service/                   # FastAPI Python ML Microservice (Isolation Forest)
│   ├── config/                           # Database & App configuration
│   ├── controllers/                      # API route handlers (Attendance, Visitors, etc)
│   ├── middleware/                       # Authentication and error handling
│   ├── models/                           # MongoDB Mongoose schemas
│   ├── routes/                           # Express REST endpoints
│   ├── services/                         # Business logic and external API integrations
│   ├── utils/                            # Helper functions
│   ├── validators/                       # Request payload validation
│   ├── .env.example                      # Environment template
│   └── server.js                         # Application entry point
└── frontend/                             # React + Vite Frontend
    ├── public/
    └── src/
        ├── assets/                       # Static images and icons
        ├── components/                   # Reusable UI components & layouts
        ├── pages/                        # Route pages
        │   ├── admin/                    # System administrator pages
        │   ├── auth/                     # Login & Registration flows
        │   ├── farmAdmin/                # Farm Administrator Dashboard
        │   └── manager/                  # Farm Manager Dashboard (Integrity Center)
        ├── services/                     # Axios API clients
        ├── styles/                       # Global CSS & Tailwind configuration
        ├── App.jsx                       # Main React App & Router
        └── main.jsx                      # Vite entry point
```

## 🔒 Security & Environment Variables
**Never commit your `.env` file to version control.** 
Always use `.env.example` as a template for new developers. The repository is configured to automatically ignore all `.env` files via `.gitignore`.

### Required Environment Variables (Backend)
To run the backend and AI agents properly, you must configure the following variables in your `backend/.env` file:

#### Core Server & Database
- `PORT`: Port for the Node.js server (Default: `5000`)
- `MONGODB_URI`: Connection string for your MongoDB instance or MongoDB Atlas cluster.
- `JWT_SECRET`: A secure, random string used to sign authentication tokens.
- `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Default credentials used to seed the initial system administrator.

#### FarmGuard AI / Groq API
- `GROQ_API_KEY`: Your private API key from Groq to power the AI reasoning agents.
- `GROQ_MODEL`: The LLM model to use (e.g., `llama-3.1-8b-instant`).

#### Microservices Integration
- `ML_SERVICE_URL`: URL where the Python ML service is running (Default: `http://localhost:5001`).
- `FRONTEND_URL`: URL where the React frontend is running (Default: `http://localhost:5173`) to configure CORS properly.
