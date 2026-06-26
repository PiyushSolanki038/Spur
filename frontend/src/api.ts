export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function sendMessage(message: string, sessionId: string | null) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to reach the support agent. Please try again.");
  }

  return res.json() as Promise<{ reply: string; sessionId: string }>;
}

export async function fetchHistory(sessionId: string) {
  const res = await fetch(`${API_BASE}/chat/history/${sessionId}`);
  if (!res.ok) throw new Error("Failed to load conversation history.");
  return res.json() as Promise<{ sessionId: string; messages: ChatMessage[] }>;
}
