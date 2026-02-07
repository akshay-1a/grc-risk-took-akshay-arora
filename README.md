# GRC Risk Assessment & Heatmap Dashboard

A small full-stack **Governance, Risk, and Compliance (GRC)** risk assessment tool aligned with **NIST SP 800-30** and **ISO 27001** style risk matrices. It uses a **Likelihood x Impact** matrix, persists risks in SQLite, and provides a dashboard with a 5x5 heatmap.

## Structure

```
grc-risk-took-akshay-arora/
├── backend/
│   ├── app.py           # FastAPI app, SQLite, risk scoring
│   ├── risks.db         # Created on first run
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── RiskForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Heatmap.jsx
│   │   └── utils/
│   │       └── riskLevel.js
│   ├── package.json
│   └── tailwind.config.js
├── grc_risk_assessment_context.md
└── README.md
```

## Quick start (< 5 minutes)

**Backend:** Python 3.11 or 3.12 is recommended. If you use Python 3.14 and see a `pydantic-core` / Rust build error, use 3.11 or 3.12, or install [Rust](https://rustup.rs/) and retry.

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
# If you see "uvicorn not found" (Scripts not on PATH), use:
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Leave this running. The API will be at `http://127.0.0.1:8000`. SQLite DB `risks.db` is created automatically.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**. The Vite dev server proxies `/assess-risk`, `/risks`, and `/risks/export/csv` to the backend.

## Features

- **Risk input:** Asset, threat, likelihood (1–5), impact (1–5) with real-time **Score | Level** preview.
- **Backend:** Validates 1–5 for L/I, computes `score = likelihood x impact`, maps to Low / Medium / High / Critical, stores in SQLite.
- **Dashboard:** Table (ID, Asset, Threat, L, I, Score, Level, Mitigation Hint), sort by score, filter by level.
- **5x5 heatmap:** Rows = Likelihood 1–5, Columns = Impact 1–5; cell = count of risks; color by score level; hover shows asset names.
- **Stats:** Total risks, High + Critical count, average score.
- **CSV export:** Download all risks via **Export CSV** (GET `/risks/export/csv`).
- **UX:** Loading and empty states, responsive layout, duplicates allowed.

## Risk levels

| Score | Level   | Mitigation hint                          |
|-------|--------|------------------------------------------|
| 1–5   | Low    | Accept / Monitor                         |
| 6–12  | Medium | Plan mitigation                          |
| 13–18 | High   | Prioritize action (NIST PR.AC)            |
| 19–25 | Critical | Immediate mitigation + escalation      |

## API

- **POST /assess-risk** — Body: `{ "asset", "threat", "likelihood", "impact" }`. Returns created risk with `score` and `level`.
- **GET /risks** — List all risks. Optional query: `?level=High`.
- **GET /risks/export/csv** — CSV download of all risks.
- **GET /health** — `{ "status": "ok" }`.

## Tech stack

- **Backend:** FastAPI, SQLite, Pydantic, Uvicorn.
- **Frontend:** React 18, Vite, Tailwind CSS, fetch.

No cloud services; runs entirely locally.

## Deployment (Vercel + Render)

- **Backend:** Deploy the `backend/` app to [Render](https://render.com) (or similar). Example URL: `https://grc-risk-took-akshay-arora.onrender.com`.
- **Frontend:** Deploy the `frontend/` app to [Vercel](https://vercel.com). In the Vercel project, add an **Environment Variable**:
  - **Name:** `VITE_API_URL`
  - **Value:** `https://grc-risk-took-akshay-arora.onrender.com` (your backend URL, no trailing slash)
  Then **redeploy** so the build includes the API base URL. Without this, the frontend will request `/risks` on Vercel and get 404.

## Troubleshooting

- **`pydantic-core` / "Rust not found" when running `pip install -r requirements.txt`**  
  You're likely on Python 3.14. Pre-built wheels for Pydantic aren’t available for every 3.14 build, so pip tries to compile from source and needs Rust. **Fix:** Use **Python 3.11 or 3.12** (create a venv with that interpreter), or install [Rust](https://rustup.rs/) and ensure `cargo` is on your PATH, then run `pip install -r requirements.txt` again.

- **"Scripts not on PATH" / `uvicorn` not found**  
  If you installed with `pip install` (user install) and the Scripts folder isn’t on PATH, run the server with the module form:  
  `python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000`
