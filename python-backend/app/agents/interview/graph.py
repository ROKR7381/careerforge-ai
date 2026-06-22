"""
LangGraph StateGraph for the CarrerForge Interview Agent.

Pipeline: normalizer -> profile_loader -> intent -> router ->
    { question_generator | answer_evaluator | follow_up |
      hint_provider | static_info | clarification | summary } ->
    judge -> END

- MemorySaver checkpointer for per-user thread isolation
- Sync + async run_graph() helpers
- Streaming support via .astream() (for SSE)
"""

from __future__ import annotations

import logging
import time
from typing import AsyncIterator, Dict, Any, Optional

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.agents.interview.state import (
    InterviewState,
    new_state,
    Intent,
    Route,
)
from app.agents.interview.nodes import (
    normalizer_node,
    profile_loader_node,
    intent_node,
    router_node,
    question_generator_node,
    answer_evaluator_node,
    follow_up_node,
    hint_provider_node,
    static_info_node,
    clarification_node,
    summary_node,
    judge_node,
)

logger = logging.getLogger(__name__)


def _route_decider(state: InterviewState) -> str:
    route: Route = state.get("route", "clarification")
    mapping = {
        "question_generator": "question_generator",
        "answer_evaluator": "answer_evaluator",
        "follow_up": "follow_up",
        "hint_provider": "hint_provider",
        "static_info": "static_info",
        "clarification": "clarification",
        "summary": "summary",
        "end": END,
    }
    target = mapping.get(route, "clarification")
    logger.debug(f"[router] route={route} -> target={target}")
    return target


def build_interview_graph() -> StateGraph:
    g = StateGraph(InterviewState)

    g.add_node("normalizer", normalizer_node)
    g.add_node("profile_loader", profile_loader_node)
    g.add_node("intent", intent_node)
    g.add_node("router", router_node)

    g.add_node("question_generator", question_generator_node)
    g.add_node("answer_evaluator", answer_evaluator_node)
    g.add_node("follow_up", follow_up_node)
    g.add_node("hint_provider", hint_provider_node)
    g.add_node("static_info", static_info_node)
    g.add_node("clarification", clarification_node)
    g.add_node("summary", summary_node)

    g.add_node("judge", judge_node)

    g.add_edge(START, "normalizer")
    g.add_edge("normalizer", "profile_loader")
    g.add_edge("profile_loader", "intent")
    g.add_edge("intent", "router")

    g.add_conditional_edges(
        "router",
        _route_decider,
        {
            "question_generator": "question_generator",
            "answer_evaluator": "answer_evaluator",
            "follow_up": "follow_up",
            "hint_provider": "hint_provider",
            "static_info": "static_info",
            "clarification": "clarification",
            "summary": "summary",
            END: END,
        },
    )

    for specialist in (
        "question_generator",
        "answer_evaluator",
        "follow_up",
        "hint_provider",
        "static_info",
        "clarification",
        "summary",
    ):
        g.add_edge(specialist, "judge")

    g.add_edge("judge", END)

    return g


_checkpointer = MemorySaver()

_graph = build_interview_graph()
_compiled_graph = _graph.compile(checkpointer=_checkpointer)

logger.info("Interview LangGraph compiled with MemorySaver checkpointer")


def get_compiled_graph():
    return _compiled_graph


def run_graph(
    user_id: str,
    session_id: str,
    user_message: str,
    *,
    target_question_count: Optional[int] = None,
    selected_topic: Optional[str] = None,
) -> Dict[str, Any]:
    if not user_id or not user_id.strip():
        raise ValueError("user_id is required -- refusing to run without identity.")
    if not session_id or not session_id.strip():
        raise ValueError("session_id is required.")

    t0 = time.perf_counter()

    initial = new_state(user_id=user_id, session_id=session_id, raw_input=user_message)
    if target_question_count:
        initial["target_question_count"] = target_question_count
    if selected_topic:
        initial["selected_topic"] = selected_topic

    config = {"configurable": {"thread_id": user_id}}

    try:
        final_state = _compiled_graph.invoke(initial, config=config)
    except Exception as exc:
        logger.exception(f"[run_graph] error for user={user_id}: {exc}")
        return {
            "user_id": user_id,
            "session_id": session_id,
            "bot_reply": "Sorry, something went wrong on our side. Please try again.",
            "error": str(exc),
            "error_node": "run_graph",
        }

    latency_ms = (time.perf_counter() - t0) * 1000.0
    final_state["latency_ms"] = latency_ms
    logger.info(
        f"[run_graph] user={user_id} session={session_id} "
        f"intent={final_state.get('intent')} route={final_state.get('route')} "
        f"latency={latency_ms:.1f}ms model={final_state.get('model_used')}"
    )
    return final_state


async def arun_graph(
    user_id: str,
    session_id: str,
    user_message: str,
    *,
    target_question_count: Optional[int] = None,
    selected_topic: Optional[str] = None,
) -> Dict[str, Any]:
    if not user_id or not user_id.strip():
        raise ValueError("user_id is required -- refusing to run without identity.")
    if not session_id or not session_id.strip():
        raise ValueError("session_id is required.")

    t0 = time.perf_counter()

    initial = new_state(user_id=user_id, session_id=session_id, raw_input=user_message)
    if target_question_count:
        initial["target_question_count"] = target_question_count
    if selected_topic:
        initial["selected_topic"] = selected_topic

    config = {"configurable": {"thread_id": user_id}}

    try:
        final_state = await _compiled_graph.ainvoke(initial, config=config)
    except Exception as exc:
        logger.exception(f"[arun_graph] error for user={user_id}: {exc}")
        return {
            "user_id": user_id,
            "session_id": session_id,
            "bot_reply": "Sorry, something went wrong on our side. Please try again.",
            "error": str(exc),
            "error_node": "arun_graph",
        }

    latency_ms = (time.perf_counter() - t0) * 1000.0
    final_state["latency_ms"] = latency_ms
    logger.info(
        f"[arun_graph] user={user_id} session={session_id} "
        f"intent={final_state.get('intent')} route={final_state.get('route')} "
        f"latency={latency_ms:.1f}ms"
    )
    return final_state


async def stream_graph(
    user_id: str,
    session_id: str,
    user_message: str,
) -> AsyncIterator[Dict[str, Any]]:
    if not user_id or not user_id.strip():
        raise ValueError("user_id is required.")

    initial = new_state(user_id=user_id, session_id=session_id, raw_input=user_message)
    config = {"configurable": {"thread_id": user_id}}

    async for event in _compiled_graph.astream(initial, config=config, stream_mode="updates"):
        for node_name, delta in event.items():
            yield {"node": node_name, "state": delta}


def get_thread_state(user_id: str) -> Optional[Dict[str, Any]]:
    if not user_id:
        return None
    config = {"configurable": {"thread_id": user_id}}
    try:
        snapshot = _compiled_graph.get_state(config)
        return snapshot.values if snapshot else None
    except Exception as exc:
        logger.warning(f"[get_thread_state] no state for {user_id}: {exc}")
        return None
