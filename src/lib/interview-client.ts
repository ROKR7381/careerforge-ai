/**
 * Interview agent API client.
 * Consumes the Next.js proxy routes which forward to the Python LangGraph backend.
 */

export interface ChatRequest {
  message: string;
  session_id: string;
  target_question_count?: number;
  selected_topic?: string;
}

export interface ChatResponse {
  reply: string;
  session_id: string;
  intent: string;
  evaluation?: {
    score: number;
    clarity: number;
    correctness: number;
    depth: number;
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
    follow_up_topic: string | null;
  } | null;
  questions_asked: number;
  questions_total: number;
  session_score: number;
  is_complete: boolean;
  latency_ms: number;
}

export interface StartRequest {
  field?: string;
  level?: string;
  target_question_count?: number;
  selected_topic?: string;
}

export interface StartResponse {
  session_id: string;
  reply: string;
  questions_asked: number;
  questions_total: number;
}

export interface SessionState {
  user_id: string;
  session_id: string;
  profile_loaded: boolean;
  questions_asked: number;
  questions_total: number;
  session_score: number;
  evaluation_count: number;
  is_active: boolean;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function startInterview(
  req: StartRequest
): Promise<StartResponse> {
  return apiPost<StartResponse>("/api/interview/start", req);
}

export async function sendChatMessage(
  req: ChatRequest
): Promise<ChatResponse> {
  return apiPost<ChatResponse>("/api/interview/chat", req);
}

export async function getInterviewState(): Promise<SessionState> {
  return apiGet<SessionState>("/api/interview/state");
}

export function createSessionId(
  field: string,
  level: string
): string {
  return `${Date.now()}_${field.toLowerCase()}_${level.toLowerCase()}`;
}
