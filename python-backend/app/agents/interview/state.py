from __future__ import annotations

from typing import TypedDict, List, Dict, Any, Optional, Literal
from datetime import datetime


# ---------- Sub-structures ----------

class UserProfile(TypedDict, total=False):
    """Loaded from Prisma / CarrerForge resume data."""
    user_id: str
    name: str
    field: str                  # e.g., "Tech", "Finance", "Marketing"
    sub_field: Optional[str]    # e.g., "Python", "Banking"
    target_role: Optional[str]  # e.g., "Backend Engineer"
    experience_level: Literal["fresher", "mid", "senior", "lead"]
    years_of_experience: float
    skills: List[str]
    resume_summary: Optional[str]


class QuestionRecord(TypedDict, total=False):
    """A single question issued by the bot."""
    question_id: Optional[str]   # from question_bank if retrieved; None if LLM-generated
    field: str
    sub_field: Optional[str]
    level: str
    type: Literal["technical", "behavioral", "situational", "hr", "case_study"]
    difficulty: int              # 1-5
    question_text: str
    model_answer: Optional[str]  # ideal answer for evaluator reference
    asked_at: str                # ISO timestamp


class AnswerRecord(TypedDict, total=False):
    """User's answer + evaluation result."""
    question_id: Optional[str]
    answer_text: str
    answered_at: str
    evaluation: Optional["Evaluation"]


class Evaluation(TypedDict, total=False):
    """Structured judge output for an answer."""
    score: float                 # 0-10
    clarity: float               # 0-10
    correctness: float           # 0-10
    depth: float                 # 0-10
    strengths: List[str]
    weaknesses: List[str]
    suggestion: str
    follow_up_topic: Optional[str]


class TurnMessage(TypedDict, total=False):
    """Compact conversation turn for bounded history."""
    role: Literal["user", "bot", "system"]
    content: str
    timestamp: str


# ---------- Main State ----------

# Intents understood by the interview bot
Intent = Literal[
    "start_interview",      # begin a new mock session
    "answer_question",      # user is answering current question
    "next_question",        # user wants the next question
    "ask_hint",             # user wants a hint
    "ask_clarification",    # user asks bot a clarifying question
    "static_info",          # FAQ-ish: "how does this work?", "what fields are supported"
    "end_interview",        # finish session & get report
    "unknown",              # fallback -> clarification node
]

# Route taken after intent classification
Route = Literal[
    "question_generator",
    "answer_evaluator",
    "follow_up",
    "hint_provider",
    "static_info",
    "clarification",
    "summary",
    "end",
]


class InterviewState(TypedDict, total=False):
    """
    Canonical state for the Interview LangGraph.
    Every node reads and writes specific fields -- keep this contract stable.
    """

    # -------- Identity / scoping (MANDATORY) --------
    user_id: str
    thread_id: str
    session_id: str

    # -------- Raw user turn --------
    raw_input: str
    normalized_input: str

    # -------- Profile (loaded once per session, refreshed if user_id changes) --------
    profile: UserProfile
    profile_loaded: bool

    # -------- Intent & routing --------
    intent: Intent
    intent_confidence: float
    route: Route
    routing_reason: str

    # -------- Active interview context --------
    current_question: Optional[QuestionRecord]
    current_answer: Optional[AnswerRecord]
    asked_question_ids: List[str]           # to avoid repeats in same session
    questions_asked_count: int
    target_question_count: int              # session length, default 10
    selected_topic: Optional[str]           # user-chosen focus (e.g., "Python OOP")

    # -------- Conversation memory (bounded) --------
    history: List[TurnMessage]              # last N turns (bounded by HISTORY_WINDOW)
    summary_so_far: Optional[str]           # rolling summary of older turns

    # -------- Outputs --------
    bot_reply: str                          # final text shown to user
    streaming_tokens: Optional[List[str]]   # for SSE streaming (optional)

    # -------- Evaluation & judge --------
    last_evaluation: Optional[Evaluation]
    session_score_running: float            # average so far
    session_evaluations: List[Evaluation]   # full list for end-of-session report

    # -------- Meta --------
    error: Optional[str]
    error_node: Optional[str]
    needs_clarification: bool
    clarification_question: Optional[str]
    model_used: Optional[str]               # which LLM handled this turn (for analytics)
    latency_ms: Optional[float]
    created_at: str
    updated_at: str


# ---------- Defaults / Factory ----------

DEFAULT_TARGET_QUESTIONS = 10
HISTORY_WINDOW = 12  # keep last 12 turns in raw form; older -> summary_so_far


def new_state(user_id: str, session_id: str, raw_input: str = "") -> InterviewState:
    """Factory to create a fresh state for a new turn."""
    now = datetime.utcnow().isoformat()
    return InterviewState(
        user_id=user_id,
        thread_id=user_id,               # 1 thread per user; change if you want per-session threads
        session_id=session_id,
        raw_input=raw_input,
        normalized_input="",
        profile={},
        profile_loaded=False,
        intent="unknown",
        intent_confidence=0.0,
        route="clarification",
        routing_reason="",
        current_question=None,
        current_answer=None,
        asked_question_ids=[],
        questions_asked_count=0,
        target_question_count=DEFAULT_TARGET_QUESTIONS,
        selected_topic=None,
        history=[],
        summary_so_far=None,
        bot_reply="",
        streaming_tokens=None,
        last_evaluation=None,
        session_score_running=0.0,
        session_evaluations=[],
        error=None,
        error_node=None,
        needs_clarification=False,
        clarification_question=None,
        model_used=None,
        latency_ms=None,
        created_at=now,
        updated_at=now,
    )