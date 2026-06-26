import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { getHistory, getOrCreateConversation, saveMessage } from "../services/conversation.js";
import { generateReply, LlmServiceError } from "../services/llm.js";

export const chatRouter = Router();

const MAX_MESSAGE_LENGTH = 4000;

const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty"),
  sessionId: z.string().trim().min(1).nullish(),
});

chatRouter.post("/message", async (req, res, next) => {
  try {
    const parsed = chatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid request");
    }

    let { message } = parsed.data;
    const sessionId = parsed.data.sessionId ?? undefined;

    let truncationNotice = "";
    if (message.length > MAX_MESSAGE_LENGTH) {
      message = message.slice(0, MAX_MESSAGE_LENGTH);
      truncationNotice = " (note: your message was truncated to 4000 characters)";
    }

    const conversation = getOrCreateConversation(sessionId);
    const history = getHistory(conversation.id);

    saveMessage(conversation.id, "user", message + truncationNotice);

    let reply: string;
    try {
      reply = await generateReply(history, message);
    } catch (err) {
      const friendlyMessage =
        err instanceof LlmServiceError ? err.message : "Sorry, something went wrong generating a reply.";
      saveMessage(conversation.id, "ai", friendlyMessage);
      res.json({ reply: friendlyMessage, sessionId: conversation.sessionId });
      return;
    }

    saveMessage(conversation.id, "ai", reply);

    res.json({ reply, sessionId: conversation.sessionId });
  } catch (err) {
    next(err);
  }
});

chatRouter.get("/history/:sessionId", (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) throw new HttpError(400, "sessionId is required");

    const conversation = getOrCreateConversation(sessionId);
    const history = getHistory(conversation.id);

    res.json({ sessionId: conversation.sessionId, messages: history });
  } catch (err) {
    next(err);
  }
});
