# JalSetuAI (जलसेतू) — Maharashtra AI Flood Prediction & Early Warning System

An AI-powered flood risk intelligence and early warning decision-support system monitoring all **36 districts of Maharashtra, India**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)
![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)
![XGBoost](https://img.shields.io/badge/XGBoost-TreeExplainer-red.svg)

---

## 🌟 Key Highlights & Architecture

- **Statewide 36-District Spatial Monitoring**: Real-time interactive Leaflet map rendering all 36 Maharashtra district zones with geographic centroids, topographic attributes, and GeoJSON polygon boundary support.
- **Multi-Horizon Flood Forecasting**: Predicts flood probability and risk classification across **+24h, +48h, and +72h** lead times.
- **Explainable AI (SHAP TreeExplainer)**: Every forecast provides clear, human-readable explanations of contributing factors (precipitation volume, antecedent soil saturation, river stage, terrain slope).
- **Interactive "What-If" Precipitation Simulator**: Dynamic hydrological simulation testing risk sensitivity under +0 to +100 mm additional rainfall with monotonic responsiveness.
- **Role-Based Access Control**:
  - **Citizen View**: District monitoring, nearest district geolocation, personal home zone subscriptions.
  - **Disaster Official / Admin View**: Ranked risk analysis across all 36 districts, instant statewide forecast recalculation, emergency alert broadcasting.
- **Automated Background Forecasting**: Periodic weather ingestion and automated forecast pipeline via APScheduler.

---

## 🔬 Model Evaluation Metrics (Out-of-Time Test Set: 2023 - 2024)

| Model | ROC-AUC | Precision | Recall | F1-Score | Optimal Threshold |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest Baseline** | 0.9973 | 0.7993 | 0.9834 | 0.8818 | 0.50 |
| **XGBoost Classifier** | **0.9979** | **0.8417** | **0.9783** | **0.9049** | **0.58** |

*See [`ml/models/model_card.md`](ml/models/model_card.md) for full intended use, regulatory disclaimers, and confusion matrix.*

---

## 🚀 Quickstart (Local Development)

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# 1. Create and activate virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements_core.txt click email-validator "bcrypt<4.1.0" "uvicorn[standard]" starlette --no-deps xgboost

# 3. Seed database (36 districts & demo users)
python -m backend.app.data.seed_zones

# 4. Run tests
pytest backend/tests/ -v

# 5. Start API server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Disaster Official (Admin)** | `admin@floodwatch.test` | `Admin@123` | Ranked analytics, alert broadcasting, manual forecast triggers |
| **Citizen** | `citizen@floodwatch.test` | `Citizen@123` | Zone monitoring, alert subscription preferences |

---

## ☁️ Free Cloud Deployment Guide

### Option A: Render (Free Blueprint / IaC)
1. Fork or push this repository to your GitHub account.
2. Sign up / Log in to [Render](https://render.com).
3. Click **New +** > **Blueprint** and select this repository.
4. Render will automatically detect [`render.yaml`](render.yaml) and deploy:
   - **`jalsetu-backend`**: Free web service running FastAPI on Python 3.11.
   - **`jalsetu-frontend`**: Free static site with client-side SPA routing.

### Option B: Vercel (Frontend) + Render (Backend)
1. **Deploy Backend on Render**:
   - New **Web Service** > Connect GitHub repo.
   - Build Command: `pip install --upgrade pip && pip install -r backend/requirements_core.txt click email-validator "bcrypt<4.1.0" "uvicorn[standard]" starlette --no-deps xgboost && python -m backend.app.data.seed_zones`
   - Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
2. **Deploy Frontend on Vercel**:
   - Import repository on [Vercel](https://vercel.com).
   - Set Root Directory to `frontend`.
   - Add Environment Variable: `VITE_API_BASE_URL=https://your-backend-service.onrender.com`.
   - Deploy!

---

## 📄 License & Regulatory Disclaimer
This project is licensed under the MIT License. **Notice**: JalSetuAI is an operational decision-support prototype. It does not replace official meteorological bulletins and flood warnings issued by the India Meteorological Department (IMD), the Central Water Commission (CWC), or the Maharashtra State Disaster Management Authority (SDMA).
