const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export async function callPythonApi<T>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${PYTHON_API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Python API error");
  }
  return res.json();
}
