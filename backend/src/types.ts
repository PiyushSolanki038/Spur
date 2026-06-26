export type Sender = "user" | "ai";

export interface Message {
  id: string;
  conversationId: string;
  sender: Sender;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  createdAt: string;
}

export interface ChatMessageRequest {
  message: string;
  sessionId?: string;
}

export interface ChatMessageResponse {
  reply: string;
  sessionId: string;
}
