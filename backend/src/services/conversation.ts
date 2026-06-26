import { v4 as uuid } from "uuid";
import { db } from "../db/client.js";
import type { Conversation, Message, Sender } from "../types.js";

export function getOrCreateConversation(sessionId?: string): Conversation {
  if (sessionId) {
    const existing = db
      .prepare<[string], Conversation>(
        "SELECT id, session_id as sessionId, created_at as createdAt FROM conversations WHERE session_id = ?"
      )
      .get(sessionId);
    if (existing) return existing;
  }

  const id = uuid();
  const newSessionId = sessionId ?? uuid();
  db.prepare("INSERT INTO conversations (id, session_id) VALUES (?, ?)").run(id, newSessionId);
  return getOrCreateConversation(newSessionId)!;
}

export function getHistory(conversationId: string): Message[] {
  return db
    .prepare<[string], Message>(
      `SELECT id, conversation_id as conversationId, sender, text, created_at as createdAt
       FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC`
    )
    .all(conversationId);
}

export function saveMessage(conversationId: string, sender: Sender, text: string): Message {
  const id = uuid();
  db.prepare(
    "INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)"
  ).run(id, conversationId, sender, text);

  return db
    .prepare<[string], Message>(
      `SELECT id, conversation_id as conversationId, sender, text, created_at as createdAt
       FROM messages WHERE id = ?`
    )
    .get(id)!;
}
