# Capitalize — AI-powered Credit Intelligence for MSMEs

Capitalize is a cutting-edge financial intelligence platform built specifically for Indian Micro, Small, and Medium Enterprises (MSMEs). It transforms raw financial data (bank statements, ledgers, CSVs) into an AI-driven credit scoring engine, generating actionable insights, an interactive dashboard, and tailored loan matches.

## Core Features
- **Dynamic AI CFO Dashboard:** Live tracking of cash runway, net margins, revenue, and expenditures with an embedded, context-aware AI chatbot.
- **Credit Readiness Score:** Proprietary 100-point scoring algorithm assessing four pillars: Cash Flow Consistency, Revenue Growth, Debt-to-Income, and Payment Regularity.
- **Loan Marketplace Gating:** A dynamic marketplace where lending partners (NBFCs) are automatically locked or unlocked based on the MSME's live credit score.
- **Transaction Explorer:** Filter, search, and analyse complete financial histories with rapid DuckDB-powered SQL aggregations.
- **Weekly Intelligence Digest:** Automated weekly summary tracking metric deltas against the prior week, including AI-driven recommendations.

## Technical Architecture
- **Backend:** 
  - **FastAPI (Python):** Robust and rapid API routing.
  - **DuckDB & Pandas:** For heavy numerical aggregations, data normalisation, and SQL query routing.
  - **FAISS & Gemini AI:** For semantic search, prompt context retrieval, and natural language AI CFO capabilities.
- **Frontend:** 
  - **React 18 & Vite:** High-performance, lazy-loaded Single Page Application.
  - **React Router v6:** Seamless page navigation and route guarding.
  - **Chart.js:** Beautiful, interactive financial data visualization.
- **Design System:** Custom vanilla CSS architecture utilizing CSS variables, utilizing a premium Razorpay-inspired Trust Blue (`#2B84EA`) and Deep Navy (`#02042B`) aesthetic.

## Getting Started

### 1. Backend Setup
Navigate to the backend directory, set up your virtual environment, and start the FastAPI server:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The backend API will be available at `http://localhost:8000`. You can view the interactive API docs at `http://localhost:8000/docs`.

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

## File Uploads & Data
To process financial data, upload a standard bank statement CSV through the frontend Onboarding flow or File Upload modal. The backend will index the document, calculate the live credit score, and update your global dashboard context instantly.

## Legal Disclaimer
Capitalize is currently in private beta. The data and insights shown are for financial awareness and informational purposes only, and do not constitute official financial or legal advice. Loan matching parameters are indicative. Capitalize is not a SEBI/RBI regulated lending institution.
