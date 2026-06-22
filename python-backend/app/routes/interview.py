"""
FastAPI routes for the Interview LangGraph Agent.

Endpoints:
  POST /api/interview/chat       - Single-turn chat (async)
  POST /api/interview/start      - Create a new session
  GET  /api/interview/state      - Get current thread state for user
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.agents.interview.graph import arun_graph, get_thread_state

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/interview", tags=["interview"])


# ---------- Request / Response models ----------

class ChatRequest(BaseModel):
    message: str
    session_id: str
    target_question_count: Optional[int] = None
    selected_topic: Optional[str] = None


class StartRequest(BaseModel):
    field: Optional[str] = "Tech"
    level: Optional[str] = "fresher"
    target_question_count: Optional[int] = 10
    selected_topic: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    intent: str
    evaluation: Optional[dict] = None
    questions_asked: int
    questions_total: int
    session_score: float
    is_complete: bool
    latency_ms: float


class StartResponse(BaseModel):
    session_id: str
    reply: str
    questions_asked: int
    questions_total: int


class StateResponse(BaseModel):
    user_id: str
    session_id: str
    profile_loaded: bool
    questions_asked: int
    questions_total: int
    session_score: float
    evaluation_count: int
    is_active: bool


# ---------- Helper to extract user ID ----------

def _get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    """Extract user ID from header (set by Next.js API proxy after auth)."""
    if x_user_id:
        return x_user_id
    return "anonymous"


# ---------- Endpoints ----------

@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    x_user_id: Optional[str] = Header(None),
):
    """
    Process a single user turn in an interview session.
    The LangGraph handles intent classification, routing, and response generation.
    """
    user_id = _get_user_id(x_user_id)

    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message is required")
    if not req.session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    result = await arun_graph(
        user_id=user_id,
        session_id=req.session_id,
        user_message=req.message.strip(),
        target_question_count=req.target_question_count,
        selected_topic=req.selected_topic,
    )

    if result.get("error"):
        logger.error(f"Graph error for user={user_id}: {result['error']}")
        raise HTTPException(status_code=500, detail=result["error"])

    is_complete = result.get("route") == "end" or (
        result.get("questions_asked_count", 0) >= result.get("target_question_count", 10) and
        result.get("route") == "summary"
    )

    return ChatResponse(
        reply=result.get("bot_reply", ""),
        session_id=req.session_id,
        intent=result.get("intent", "unknown"),
        evaluation=result.get("last_evaluation"),
        questions_asked=result.get("questions_asked_count", 0),
        questions_total=result.get("target_question_count", 10),
        session_score=result.get("session_score_running", 0.0),
        is_complete=is_complete,
        latency_ms=result.get("latency_ms", 0.0),
    )


@router.post("/start", response_model=StartResponse)
async def start_session(
    req: StartRequest,
    x_user_id: Optional[str] = Header(None),
):
    """
    Start a new interview session.
    This sends the initial 'start' message to the graph, which generates the first question.
    """
    user_id = _get_user_id(x_user_id)
    session_id = f"{user_id}_{req.field.lower()}_{req.level.lower()}"

    result = await arun_graph(
        user_id=user_id,
        session_id=session_id,
        user_message="start",
        target_question_count=req.target_question_count,
        selected_topic=req.selected_topic,
    )

    if result.get("error"):
        logger.error(f"Start session error: {result['error']}")
        raise HTTPException(status_code=500, detail=result["error"])

    return StartResponse(
        session_id=session_id,
        reply=result.get("bot_reply", ""),
        questions_asked=result.get("questions_asked_count", 0),
        questions_total=result.get("target_question_count", 10),
    )


@router.get("/state", response_model=StateResponse)
async def get_state(
    x_user_id: Optional[str] = Header(None),
):
    """
    Get the current interview state for the authenticated user.
    """
    user_id = _get_user_id(x_user_id)

    state = get_thread_state(user_id)
    if not state:
        return StateResponse(
            user_id=user_id,
            session_id="",
            profile_loaded=False,
            questions_asked=0,
            questions_total=10,
            session_score=0.0,
            evaluation_count=0,
            is_active=False,
        )

    return StateResponse(
        user_id=user_id,
        session_id=state.get("session_id", ""),
        profile_loaded=state.get("profile_loaded", False),
        questions_asked=state.get("questions_asked_count", 0),
        questions_total=state.get("target_question_count", 10),
        session_score=state.get("session_score_running", 0.0),
        evaluation_count=len(state.get("session_evaluations", [])),
        is_active=state.get("route") != "end",
    )
