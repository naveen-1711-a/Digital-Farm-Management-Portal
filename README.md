# Digital Farm Management Portal

A comprehensive, AI-driven digital platform designed to optimize farm operations, track biosecurity, and monitor animal health. This platform leverages a modern web stack alongside autonomous AI agents and machine learning models to provide real-time insights, anomaly detection, and farm orchestration.

## 🌟 Key Features

- **FarmGuard AI Agents**: Autonomous agents that monitor farm integrity, analyze sensor data, and detect risks in real-time.
- **Machine Learning Integration**: Built-in ML microservices using Scikit-Learn (Isolation Forest) for predictive behavior modeling and anomaly detection (e.g., Chicken Feed Prediction).
- **Interactive Dashboards**: Real-time visualization of farm analytics, feed inventory, and attendance records using Recharts and Chart.js.
- **Biosecurity & Audit Tracking**: Dedicated modules to log visitors, track vaccinations, and maintain strict biosecurity protocols.
- **Groq Reasoning Engine**: Uses advanced LLMs (like LLaMA 3) via the Groq API for intelligent decision making and investigations.

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

## 📁 Project Structure

```text
├── backend/
│   ├── agents/          # Autonomous agents & ML service integration
│   ├── controllers/     # API route logic (Feed, Animals, Biosecurity)
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # Express API endpoints
│   ├── .env.example     # Environment variable template
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/       # React components (Dashboards, Integrity Center)
│   │   └── ...
│   └── package.json
├── ai/                  # AI Models & Datasets
└── Chicken_Feed_Prediction/ # Specific ML sub-project for feed optimization
```

## 🔒 Security & Environment Variables
**Never commit your `.env` file to version control.** 
Always use `.env.example` as a template for new developers. The repository is configured to automatically ignore all `.env` files via `.gitignore`.
