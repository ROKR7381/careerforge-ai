"""
Node implementations for the Interview LangGraph.

Each node:
- Accepts: InterviewState
- Returns: InterviewState (or partial dict -- LangGraph merges)
- Uses GPT-4o-mini via the existing models.py get_llm() helper
"""

from __future__ import annotations
import json
import logging
import os
from datetime import datetime
from typing import Optional

from models import get_openai_llm
from app.agents.interview.state import (
    InterviewState, HISTORY_WINDOW, TurnMessage, QuestionRecord, Evaluation
)

logger = logging.getLogger(__name__)

# Reusable LLM accessor -- OpenAI only
def _llm(temperature: float = 0.3):
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise ValueError("OPENAI_API_KEY is not set")
    return get_openai_llm(api_key=key, temperature=temperature)


PROMPT_DIR = os.path.join(os.path.dirname(__file__), "prompts")

def _load_prompt(field: str) -> str:
    """Load a field-specific prompt template, or return a default."""
    path = os.path.join(PROMPT_DIR, f"{field.lower()}.txt")
    if os.path.exists(path):
        with open(path) as f:
            return f.read()
    return ""


# ---------- 1. Normalizer ----------
def normalizer_node(state: InterviewState) -> InterviewState:
    raw = (state.get("raw_input") or "").strip()
    state["normalized_input"] = raw
    state["updated_at"] = datetime.utcnow().isoformat()
    return state


# ---------- 2. Profile loader ----------
def profile_loader_node(state: InterviewState) -> InterviewState:
    if state.get("profile_loaded"):
        return state
    user_id = state["user_id"]

    profile = {
        "user_id": user_id,
        "name": "Candidate",
        "field": "Tech",
        "sub_field": None,
        "target_role": None,
        "experience_level": "fresher",
        "years_of_experience": 0.0,
        "skills": [],
        "resume_summary": None,
    }
    state["profile"] = profile
    state["profile_loaded"] = True
    return state


# ---------- 3. Intent classifier (LLM) ----------
INTENT_SYSTEM_PROMPT = """You are an intent classifier for an interview preparation bot.
Given the user's message, classify it into exactly one intent.

Intents:
- start_interview: User wants to begin a new interview session
- answer_question: User is answering the current interview question
- next_question: User wants the next question (e.g. "next", "skip", "another")
- ask_hint: User wants a hint for the current question
- ask_clarification: User is asking a clarifying question about the process
- static_info: User is asking about how the interview works, what fields are supported
- end_interview: User wants to end the session and get a report
- unknown: None of the above

Respond with JSON: {"intent": "<intent>", "confidence": <0.0-1.0>}
"""


def intent_node(state: InterviewState) -> InterviewState:
    text = state.get("normalized_input", "")
    if not text:
        state["intent"] = "unknown"
        state["intent_confidence"] = 0.0
        return state

    try:
        llm = _llm(temperature=0.1)
        response = llm.invoke([
            {"role": "system", "content": INTENT_SYSTEM_PROMPT},
            {"role": "user", "content": f"User message: {text}"},
        ])
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[-1].rsplit("\n", 1)[0]
        parsed = json.loads(content)
        state["intent"] = parsed.get("intent", "unknown")
        state["intent_confidence"] = parsed.get("confidence", 0.0)
        state["model_used"] = "gpt-4o-mini"
    except Exception as e:
        logger.warning(f"Intent LLM failed: {e}, using fallback")
        text_lower = text.lower()
        if any(k in text_lower for k in ("start", "begin", "new", "ready", "let's go")):
            state["intent"] = "start_interview"
        elif any(k in text_lower for k in ("next", "another", "skip", "continue")):
            state["intent"] = "next_question"
        elif "hint" in text_lower:
            state["intent"] = "ask_hint"
        elif any(k in text_lower for k in ("end", "stop", "finish", "report", "done", "quit")):
            state["intent"] = "end_interview"
        elif state.get("current_question"):
            state["intent"] = "answer_question"
        elif any(k in text_lower for k in ("how does", "what is", "how this", "fields", "supported")):
            state["intent"] = "static_info"
        else:
            state["intent"] = "unknown"
        state["intent_confidence"] = 0.7

    return state


# ---------- 4. Router ----------
def router_node(state: InterviewState) -> InterviewState:
    intent = state.get("intent", "unknown")
    mapping = {
        "start_interview": "question_generator",
        "next_question": "question_generator",
        "answer_question": "answer_evaluator",
        "ask_hint": "hint_provider",
        "ask_clarification": "clarification",
        "static_info": "static_info",
        "end_interview": "summary",
        "unknown": "clarification",
    }
    state["route"] = mapping.get(intent, "clarification")
    state["routing_reason"] = f"intent={intent}"
    return state


# ---------- 5. Question generator (LLM) ----------
QUESTION_PROMPT = """You are an expert technical interviewer at a top tech company.
Generate ONE interview question tailored to the candidate's profile.

Candidate Profile:
- Field: {field}
- Sub-field: {sub_field}
- Level: {level}
- Skills: {skills}
- Target role: {target_role}

Question guidelines:
- {level} level questions should be {difficulty_guide}
- Focus on practical knowledge, not trivia
- Cover the candidate's stated skills

Already asked question IDs (do not repeat): {asked_ids}

Respond with JSON:
{{
  "question_text": "the question",
  "type": "technical|behavioral|situational",
  "difficulty": <1-5>,
  "model_answer": "ideal answer outline",
  "follow_up_topic": "what to ask next if they answer well"
}}
"""


def question_generator_node(state: InterviewState) -> InterviewState:
    profile = state.get("profile", {})
    field = profile.get("field", "Tech")
    sub_field = profile.get("sub_field", "General")
    level = profile.get("experience_level", "fresher")
    skills = ", ".join(profile.get("skills", []))
    target_role = profile.get("target_role", "Not specified")

    difficulty_guide = {
        "fresher": "fundamental concepts, definitions, basic problem-solving",
        "mid": "applied knowledge, system design basics, debugging scenarios",
        "senior": "architecture decisions, trade-offs, design patterns, scalability",
        "lead": "strategy, team dynamics, architecture at scale, mentoring",
    }.get(level, "fundamental concepts")

    asked_ids = state.get("asked_question_ids", [])
    count = state.get("questions_asked_count", 0)

    if count >= state.get("target_question_count", 10):
        state["bot_reply"] = "You've completed all questions! Type 'end' or 'report' to see your summary."
        return state

    try:
        llm = _llm(temperature=0.7)
        prompt = QUESTION_PROMPT.format(
            field=field,
            sub_field=sub_field,
            level=level,
            skills=skills,
            target_role=target_role,
            difficulty_guide=difficulty_guide,
            asked_ids=json.dumps(asked_ids),
        )
        response = llm.invoke([
            {"role": "system", "content": "You are an expert interviewer. Respond with valid JSON only."},
            {"role": "user", "content": prompt},
        ])
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[-1].rsplit("\n", 1)[0]
        parsed = json.loads(content)

        question_record: QuestionRecord = {
            "field": field,
            "sub_field": sub_field,
            "level": level,
            "type": parsed.get("type", "technical"),
            "difficulty": parsed.get("difficulty", 2),
            "question_text": parsed.get("question_text", ""),
            "model_answer": parsed.get("model_answer"),
            "asked_at": datetime.utcnow().isoformat(),
        }
        state["current_question"] = question_record
        state["questions_asked_count"] = count + 1
        state["bot_reply"] = question_record["question_text"]
        state["model_used"] = "gpt-4o-mini"
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        state["bot_reply"] = (
            f"Here's a {level}-level question: Tell me about a challenging project "
            f"you worked on related to {sub_field} and how you approached it."
        )
        state["current_question"] = {
            "field": field,
            "sub_field": sub_field,
            "level": level,
            "type": "behavioral",
            "difficulty": 2,
            "question_text": state["bot_reply"],
            "asked_at": datetime.utcnow().isoformat(),
        }
        state["questions_asked_count"] = count + 1
        state["error"] = str(e)
        state["error_node"] = "question_generator_node"

    return state


# ---------- 6. Answer evaluator (LLM) ----------
EVALUATOR_PROMPT = """You are an expert interview judge. Evaluate the candidate's answer.

Question: {question}
Model Answer: {model_answer}

Candidate's Answer: {answer}

Score each dimension 0-10 and provide specific feedback.

Respond with JSON:
{{
  "score": <overall 0-10>,
  "clarity": <0-10>,
  "correctness": <0-10>,
  "depth": <0-10>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestion": "specific improvement advice",
  "follow_up_topic": "deeper topic to explore next or null"
}}
"""


def answer_evaluator_node(state: InterviewState) -> InterviewState:
    q = state.get("current_question") or {}
    user_answer = state.get("normalized_input", "")

    try:
        llm = _llm(temperature=0.2)
        prompt = EVALUATOR_PROMPT.format(
            question=q.get("question_text", ""),
            model_answer=q.get("model_answer", "Not provided"),
            answer=user_answer,
        )
        response = llm.invoke([
            {"role": "system", "content": "You are an expert interview judge. Respond with valid JSON only."},
            {"role": "user", "content": prompt},
        ])
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[-1].rsplit("\n", 1)[0]
        parsed = json.loads(content)

        evaluation: Evaluation = {
            "score": parsed.get("score", 5),
            "clarity": parsed.get("clarity", 5),
            "correctness": parsed.get("correctness", 5),
            "depth": parsed.get("depth", 5),
            "strengths": parsed.get("strengths", []),
            "weaknesses": parsed.get("weaknesses", []),
            "suggestion": parsed.get("suggestion", ""),
            "follow_up_topic": parsed.get("follow_up_topic"),
        }
        state["last_evaluation"] = evaluation
        state["session_evaluations"] = state.get("session_evaluations", []) + [evaluation]

        evals = state["session_evaluations"]
        total = sum(e.get("score", 0) for e in evals)
        state["session_score_running"] = total / len(evals)

        score = evaluation["score"]
        strengths = evaluation["strengths"]
        suggestion = evaluation["suggestion"]

        reply_parts = [
            f"**Score: {score}/10**",
        ]
        if strengths:
            reply_parts.append(f"  {chr(10)}".join(f"* {s}" for s in strengths[:2]))
        if suggestion:
            reply_parts.append(f"  {suggestion}")

        follow_up = evaluation.get("follow_up_topic")
        if follow_up:
            reply_parts.append(f"  Can you go deeper into {follow_up}?")
            state["route"] = "follow_up"

        state["bot_reply"] = "\n\n".join(reply_parts)
        state["model_used"] = "gpt-4o-mini"
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        state["bot_reply"] = (
            f"Thanks for your answer! I'd rate it thoughtfully. "
            f"Let's move to the next question."
        )
        state["error"] = str(e)
        state["error_node"] = "answer_evaluator_node"

    return state


# ---------- 7. Follow-up ----------
def follow_up_node(state: InterviewState) -> InterviewState:
    topic = (state.get("last_evaluation") or {}).get("follow_up_topic")
    q = (state.get("current_question") or {}).get("question_text", "")

    if topic:
        try:
            llm = _llm(temperature=0.7)
            response = llm.invoke([
                {"role": "system", "content": "You are an expert interviewer. Ask a deeper follow-up question."},
                {"role": "user", "content": f"Original question: {q}\nTopic to explore deeper: {topic}\nAsk one concise follow-up question."},
            ])
            state["bot_reply"] = response.content.strip()
        except Exception:
            state["bot_reply"] = f"Can you elaborate more on {topic}?"
    else:
        state["bot_reply"] = "Interesting answer! Let me ask you another question."
        state["route"] = "question_generator"

    return state


# ---------- 8. Hint provider ----------
HINT_PROMPT = """Give a helpful hint for this interview question without revealing the full answer.

Question: {question}

Provide a short hint (1-2 sentences) that guides the candidate in the right direction.
"""


def hint_provider_node(state: InterviewState) -> InterviewState:
    q = (state.get("current_question") or {}).get("question_text", "")
    if not q:
        state["bot_reply"] = "There's no active question to give a hint for. Type 'next' for a new question."
        return state

    try:
        llm = _llm(temperature=0.5)
        response = llm.invoke([
            {"role": "system", "content": "You are a helpful interview coach."},
            {"role": "user", "content": HINT_PROMPT.format(question=q)},
        ])
        state["bot_reply"] = f"  {response.content.strip()}"
    except Exception:
        state["bot_reply"] = f"  Think about the core concept behind this question and how you'd apply it in practice."

    return state


# ---------- 9. Static info ----------
def static_info_node(state: InterviewState) -> InterviewState:
    state["bot_reply"] = (
        "**CarrerForge Interview Prep** helps you practice mock interviews tailored to your profile.\n\n"
        "**Supported fields:** Tech, Finance, Marketing, HR, Consulting\n"
        "**Levels:** Fresher (0-2yr), Mid (2-5yr), Senior (5+yr), Lead\n"
        "**Question types:** Technical, Behavioral, Situational, HR, Case Study\n\n"
        "**How it works:**\n"
        "1. Type 'start' to begin a new interview session\n"
        "2. Answer each question\n"
        "3. Get instant scoring and feedback\n"
        "4. Type 'end' or 'report' to see your final summary\n\n"
        "You can also ask for a 'hint' at any time."
    )
    return state


# ---------- 10. Clarification ----------
def clarification_node(state: InterviewState) -> InterviewState:
    state["needs_clarification"] = True
    state["clarification_question"] = (
        "I'm not sure what you'd like to do. Would you like to:\n"
        "- Start a new interview? (type 'start')\n"
        "- Continue with the current question? (just answer it)\n"
        "- Get help on how this works? (type 'help')"
    )
    state["bot_reply"] = state["clarification_question"]
    return state


# ---------- 11. Summary ----------
def summary_node(state: InterviewState) -> InterviewState:
    evals = state.get("session_evaluations", [])
    profile = state.get("profile", {})

    if not evals:
        state["bot_reply"] = (
            "**Session Summary**\n\n"
            "No questions were attempted in this session. "
            "Type 'start' to begin a new interview when you're ready!"
        )
        return state

    total_q = len(evals)
    avg_score = sum(e.get("score", 0) for e in evals) / total_q
    state["session_score_running"] = avg_score
    total_possible = total_q * 10
    pct = (avg_score / 10) * 100

    strengths = set()
    weaknesses = set()
    for e in evals:
        for s in e.get("strengths", []):
            strengths.add(s)
        for w in e.get("weaknesses", []):
            weaknesses.add(w)

    lines = [
        f"**Interview Session Report**",
        f"",
        f"Field: {profile.get('field', 'General')} | Level: {profile.get('experience_level', 'N/A')}",
        f"Questions answered: {total_q}",
        f"Average score: {avg_score:.1f}/10 ({pct:.0f}%)",
        f"Total points: {sum(e.get('score', 0) for e in evals):.0f}/{total_possible}",
        f"",
    ]
    if strengths:
        lines.append("**Key Strengths:**")
        for s in list(strengths)[:3]:
            lines.append(f"  * {s}")
        lines.append("")
    if weaknesses:
        lines.append("**Areas to Improve:**")
        for w in list(weaknesses)[:3]:
            lines.append(f"  * {w}")
        lines.append("")

    lines.append("Keep practicing to improve your score!")

    state["bot_reply"] = "\n".join(lines)
    state["route"] = "end"
    return state


# ---------- 12. Judge ----------
def judge_node(state: InterviewState) -> InterviewState:
    if not state.get("bot_reply"):
        state["bot_reply"] = "I didn't catch that -- could you rephrase?"
        state["error"] = "empty_bot_reply"
        state["error_node"] = "judge"

    history = state.get("history", [])
    now = datetime.utcnow().isoformat()

    history.append(TurnMessage(
        role="user",
        content=state.get("normalized_input", ""),
        timestamp=now,
    ))
    history.append(TurnMessage(
        role="bot",
        content=state["bot_reply"],
        timestamp=now,
    ))

    if len(history) > HISTORY_WINDOW * 2:
        history = history[-HISTORY_WINDOW * 2:]

    state["history"] = history
    state["updated_at"] = now
    return state
