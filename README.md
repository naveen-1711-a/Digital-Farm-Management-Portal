# Digital Farm Management Portal

A comprehensive, AI-driven digital platform designed to optimize farm operations, track biosecurity, and monitor animal health. This platform leverages a modern web stack alongside autonomous AI agents and machine learning models to provide real-time insights, anomaly detection, and farm orchestration.

## 🌟 Comprehensive Features

### 1. FarmGuard Autonomous Agents
- **Orchestration & Reasoning Engine**: Built using Groq LLM API to interpret sensor alerts and farm anomalies.
- **Investigation Agent**: Correlates different events (e.g., biosecurity breaches with animal health decline) to identify root causes.
- **Detectors**: Specialized agent modules for detecting anomalies in Animal Health, Attendance, Audits, Biosecurity, Feed, Inventory, Medicine, and Vaccinations.
- **Agent Memory**: Preserves context and historical actions for continuous autonomous learning and alerting.

### 2. Machine Learning & Predictive Analytics
- **Chicken Feed Prediction**: Dedicated sub-project with Python-based models for predicting and optimizing chicken feed consumption.
- **Behavior Profiling**: ML microservice utilizing Isolation Forest to track livestock behaviors and detect unusual activity (illness, distress).
- **Sensor Simulation**: Simulates IoT farm sensors for temperature, humidity, and animal activity to feed the ML models.

### 3. Farm Operations Management
- **Biosecurity Logging**: Maintain strict biosecurity logs for farm access and sanitation compliance.
- **Vaccination Tracking**: Schedule, track, and record vaccination batches for livestock.
- **Feed & Inventory Control**: Track feed consumption rates, monitor stock levels, and alert on low inventory.
- **Staff Attendance & Roles**: Manage farm staff, track attendance, and assign specific operational roles.

### 4. Interactive Dashboards & UX
- **Role-Based Access**: Dedicated dashboard interfaces for Admin, Farm Managers, and Farm Admins.
- **Integrity Center**: A central hub to review FarmGuard agent actions, risk signals, and correlation engine reports.
- **Visual Analytics**: Interactive data visualization powered by Recharts and Chart.js, enhanced with Framer Motion animations.

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
