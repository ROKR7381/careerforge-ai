"""
Seeded question bank for the Interview Agent.

Used as a retrieval source before falling back to LLM generation.
This can be replaced with a PostgreSQL-backed QuestionBank model via Prisma.
"""

from typing import List, Dict, Any, Optional

QUESTIONS: List[Dict[str, Any]] = [
    # ---- Tech / Fresher ----
    {
        "field": "Tech",
        "sub_field": "Python",
        "level": "fresher",
        "type": "technical",
        "difficulty": 2,
        "question": "Explain the difference between a list and a tuple in Python.",
        "model_answer": "Lists are mutable (can be modified after creation), tuples are immutable. Lists use [], tuples use ().",
        "tags": ["python", "data-structures"],
    },
    {
        "field": "Tech",
        "sub_field": "Python",
        "level": "fresher",
        "type": "technical",
        "difficulty": 1,
        "question": "What is a variable in Python and how do you assign a value to it?",
        "model_answer": "A variable is a name that references a value in memory. Assignment uses `=` e.g., `x = 5`.",
        "tags": ["python", "basics"],
    },
    {
        "field": "Tech",
        "sub_field": "General",
        "level": "fresher",
        "type": "behavioral",
        "difficulty": 1,
        "question": "Tell me about a time you worked on a team project. What was your role?",
        "model_answer": "Use STAR: Situation, Task, Action, Result. Describe a specific project, your contribution, and the outcome.",
        "tags": ["teamwork", "communication"],
    },
    # ---- Tech / Mid ----
    {
        "field": "Tech",
        "sub_field": "Python",
        "level": "mid",
        "type": "technical",
        "difficulty": 3,
        "question": "How does Python's GIL (Global Interpreter Lock) affect multithreading?",
        "model_answer": "GIL allows only one thread to execute at a time, making CPU-bound threads slower. Use multiprocessing for CPU-bound tasks.",
        "tags": ["python", "concurrency"],
    },
    {
        "field": "Tech",
        "sub_field": "Backend",
        "level": "mid",
        "type": "technical",
        "difficulty": 3,
        "question": "What is the difference between REST and GraphQL?",
        "model_answer": "REST has fixed endpoints returning predefined data shapes. GraphQL has a single endpoint and the client specifies exactly what data it needs.",
        "tags": ["api", "backend"],
    },
    {
        "field": "Tech",
        "sub_field": "Backend",
        "level": "mid",
        "type": "situational",
        "difficulty": 3,
        "question": "Your API endpoint is slow under load. How do you debug and fix it?",
        "model_answer": "Check slow queries, add database indexing, implement caching (Redis), use connection pooling, and consider async processing.",
        "tags": ["performance", "debugging"],
    },
    # ---- Tech / Senior ----
    {
        "field": "Tech",
        "sub_field": "System Design",
        "level": "senior",
        "type": "technical",
        "difficulty": 5,
        "question": "Design a URL shortening service like bit.ly. Walk through your architecture.",
        "model_answer": "Key components: API gateway, hashing service (base62), database for mapping, cache layer, redirect handler, analytics pipeline.",
        "tags": ["system-design", "scalability"],
    },
    {
        "field": "Tech",
        "sub_field": "Architecture",
        "level": "senior",
        "type": "technical",
        "difficulty": 4,
        "question": "Explain microservices vs monolith architecture. When would you choose one over the other?",
        "model_answer": "Monolith is simpler for small teams and early stage. Microservices suit large teams, independent deployment, and scaling needs.",
        "tags": ["architecture", "microservices"],
    },
    # ---- Finance / Fresher ----
    {
        "field": "Finance",
        "sub_field": "Accounting",
        "level": "fresher",
        "type": "technical",
        "difficulty": 2,
        "question": "What is the difference between an asset and a liability?",
        "model_answer": "An asset is something you own that has value (cash, equipment). A liability is something you owe (loans, accounts payable).",
        "tags": ["accounting", "basics"],
    },
    {
        "field": "Finance",
        "sub_field": "Valuation",
        "level": "mid",
        "type": "technical",
        "difficulty": 3,
        "question": "Walk me through a DCF (Discounted Cash Flow) valuation.",
        "model_answer": "Project FCF, determine discount rate (WACC), calculate terminal value, discount to present value, sum to get enterprise value.",
        "tags": ["valuation", "dcf"],
    },
    # ---- Marketing ----
    {
        "field": "Marketing",
        "sub_field": "Digital",
        "level": "mid",
        "type": "technical",
        "difficulty": 3,
        "question": "How do you measure the success of a digital marketing campaign?",
        "model_answer": "KPIs: CTR, conversion rate, ROAS, CPA, customer LTV, engagement rate. A/B test landing pages and ad creatives.",
        "tags": ["digital-marketing", "analytics"],
    },
    {
        "field": "Marketing",
        "sub_field": "Strategy",
        "level": "senior",
        "type": "situational",
        "difficulty": 4,
        "question": "Our product launch campaign underperformed. How do you diagnose and fix it?",
        "model_answer": "Audience targeting, messaging, channel mix, creative quality, landing page UX. Run post-mortem with data from each channel.",
        "tags": ["strategy", "campaign"],
    },
    # ---- HR ----
    {
        "field": "HR",
        "sub_field": "Recruiting",
        "level": "mid",
        "type": "behavioral",
        "difficulty": 3,
        "question": "How do you handle a hiring manager who keeps rejecting good candidates?",
        "model_answer": "Understand specific rejection reasons, align on requirements, calibrate expectations, provide market data on talent availability.",
        "tags": ["recruiting", "stakeholder"],
    },
    # ---- Consulting ----
    {
        "field": "Consulting",
        "sub_field": "Case",
        "level": "fresher",
        "type": "case_study",
        "difficulty": 2,
        "question": "A coffee shop chain's profits are declining. How would you analyze the problem?",
        "model_answer": "Revenue = price x volume. Costs = fixed + variable. Analyze foot traffic, average spend, competition, cost structure.",
        "tags": ["case-study", "profitability"],
    },
    {
        "field": "Consulting",
        "sub_field": "Strategy",
        "level": "senior",
        "type": "case_study",
        "difficulty": 5,
        "question": "A client wants to enter a new market in Southeast Asia. Develop a market entry strategy.",
        "model_answer": "Market sizing, competitive landscape, regulatory analysis, entry mode (JV/acquisition/organic), 3-year financial model.",
        "tags": ["strategy", "market-entry"],
    },
]


def get_questions_for(
    field: str,
    level: str,
    *,
    sub_field: Optional[str] = None,
    q_type: Optional[str] = None,
    max_difficulty: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """Filter the question bank by field, level, and optional filters."""
    results = []
    for q in QUESTIONS:
        if q["field"].lower() != field.lower():
            continue
        if q["level"].lower() != level.lower():
            continue
        if sub_field and q.get("sub_field", "").lower() != sub_field.lower():
            continue
        if q_type and q.get("type", "").lower() != q_type.lower():
            continue
        if max_difficulty is not None and q.get("difficulty", 5) > max_difficulty:
            continue
        results.append(q)
    return results


def get_random_question(
    field: str,
    level: str,
    *,
    exclude_ids: Optional[List[str]] = None,
) -> Optional[Dict[str, Any]]:
    """Pick a random question matching criteria, excluding already-asked IDs."""
    import random
    candidates = get_questions_for(field, level)
    if exclude_ids:
        candidates = [q for q in candidates if q.get("id") not in exclude_ids]
    return random.choice(candidates) if candidates else None


def get_question_count() -> int:
    return len(QUESTIONS)
