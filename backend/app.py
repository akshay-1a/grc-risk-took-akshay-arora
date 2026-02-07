import sqlite3
import csv
import io
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, PlainTextResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field


# Config
DB_PATH = Path(__file__).parent / "risks.db"
app = FastAPI(title="GRC Risk Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://grc-risk-took-akshay-arora.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Risk level mapping
SCORE_LEVELS = [
    (1, 5, "Low"),
    (6, 12, "Medium"),
    (13, 18, "High"),
    (19, 25, "Critical"),
]

MITIGATION_HINTS = {
    "Low": "Accept / Monitor",
    "Medium": "Plan mitigation within 6 months",
    "High": "Prioritize action + compensating controls (NIST PR.AC)",
    "Critical": "Immediate mitigation required + executive reporting",
}


def score_to_level(score: int) -> str:
    for low, high, level in SCORE_LEVELS:
        if low <= score <= high:
            return level
    return "Low"


def get_mitigation_hint(level: str) -> str:
    return MITIGATION_HINTS.get(level, "Accept / Monitor")


# DB
def get_conn():
    return sqlite3.connect(DB_PATH)


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS risks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset TEXT,
                threat TEXT,
                likelihood INTEGER,
                impact INTEGER,
                score INTEGER,
                level TEXT
            )
        """)
        conn.commit()


@app.on_event("startup")
def startup():
    init_db()


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request, exc: RequestValidationError):
    """Return HTTP 400 with a clear message when likelihood/impact are invalid."""
    for err in exc.errors():
        loc = err.get("loc", ())
        if "body" in loc and loc[-1] in ("likelihood", "impact"):
            return JSONResponse(
                status_code=400,
                content={"detail": "Likelihood and impact must be integers between 1 and 5 (inclusive)."},
            )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


# Schemas
class AssessRiskRequest(BaseModel):
    asset: str = Field(..., min_length=1)
    threat: str = Field(..., min_length=1)
    likelihood: int = Field(..., ge=1, le=5)
    impact: int = Field(..., ge=1, le=5)


class RiskResponse(BaseModel):
    id: int
    asset: str
    threat: str
    likelihood: int
    impact: int
    score: int
    level: str


# Routes
@app.post("/assess-risk", response_model=RiskResponse)
def assess_risk(body: AssessRiskRequest):
    likelihood = body.likelihood
    impact = body.impact
    score = likelihood * impact
    level = score_to_level(score)

    with get_conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO risks (asset, threat, likelihood, impact, score, level)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (body.asset, body.threat, likelihood, impact, score, level),
        )
        conn.commit()
        rid = cur.lastrowid

    return RiskResponse(
        id=rid,
        asset=body.asset,
        threat=body.threat,
        likelihood=likelihood,
        impact=impact,
        score=score,
        level=level,
    )


@app.get("/risks")
def get_risks(level: str | None = Query(None, description="Filter by level (e.g. High)")):
    with get_conn() as conn:
        conn.row_factory = sqlite3.Row
        if level:
            cur = conn.execute(
                "SELECT id, asset, threat, likelihood, impact, score, level FROM risks WHERE level = ? ORDER BY id",
                (level,),
            )
        else:
            cur = conn.execute(
                "SELECT id, asset, threat, likelihood, impact, score, level FROM risks ORDER BY id",
            )
        rows = cur.fetchall()

    out = []
    for r in rows:
        hint = get_mitigation_hint(r["level"])
        out.append({
            "id": r["id"],
            "asset": r["asset"],
            "threat": r["threat"],
            "likelihood": r["likelihood"],
            "impact": r["impact"],
            "score": r["score"],
            "level": r["level"],
            "mitigation_hint": hint,
        })
    return out


@app.delete("/risks/{risk_id}")
def delete_risk(risk_id: int):
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM risks WHERE id = ?", (risk_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Risk not found")
    return {"ok": True, "id": risk_id}


@app.delete("/risks")
def delete_all_risks():
    """Delete all risks."""
    with get_conn() as conn:
        conn.execute("DELETE FROM risks")
        conn.commit()
    return {"ok": True, "deleted": "all"}


@app.get("/risks/export/csv")
def export_risks_csv():
    with get_conn() as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            "SELECT id, asset, threat, likelihood, impact, score, level FROM risks ORDER BY id",
        )
        rows = cur.fetchall()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "asset", "threat", "likelihood", "impact", "score", "level", "mitigation_hint"])
    for r in rows:
        hint = get_mitigation_hint(r["level"])
        writer.writerow([
            r["id"], r["asset"], r["threat"], r["likelihood"], r["impact"],
            r["score"], r["level"], hint,
        ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=risks.csv"},
    )


@app.get("/health")
def health():
    return {"status": "ok"}
