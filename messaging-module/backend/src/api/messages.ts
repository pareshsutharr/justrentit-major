import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { createMessage, deleteMessageForEveryone, getMessages, updateMessage } from "../services/messageService.js";
import { pgPool } from "../db/pool.js";

export const messagesRouter = Router();
messagesRouter.use(requireAuth);

messagesRouter.get("/:conversationId", async (req, res) => {
  const limit = Number(req.query.limit ?? 30);
  const cursor = req.query.cursor as string | undefined;
  const messages = await getMessages(req.params.conversationId, limit, cursor);
  res.json(messages);
});

const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1),
  type: z.enum(["text", "emoji", "gif", "image", "video", "document", "voice", "link"]),
  metadata: z.record(z.any()).optional()
});

messagesRouter.post("/", async (req, res) => {
  const payload = createMessageSchema.parse(req.body);
  const message = await createMessage({
    conversationId: payload.conversationId,
    senderId: req.auth!.userId,
    content: payload.content,
    type: payload.type,
    metadata: payload.metadata
  });
  res.status(201).json(message);
});

messagesRouter.patch("/:messageId", async (req, res) => {
  const body = z.object({ content: z.string().min(1) }).parse(req.body);
  const message = await updateMessage(req.params.messageId, req.auth!.userId, body.content);
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.json(message);
});

messagesRouter.delete("/:messageId/everyone", async (req, res) => {
  const ok = await deleteMessageForEveryone(req.params.messageId, req.auth!.userId);
  res.json({ ok });
});

messagesRouter.post("/:messageId/reactions", async (req, res) => {
  const body = z.object({ emoji: z.string().min(1) }).parse(req.body);
  await pgPool.query(
    `INSERT INTO message_reactions (id, message_id, user_id, emoji)
     VALUES (gen_random_uuid(), $1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [req.params.messageId, req.auth!.userId, body.emoji]
  );
  res.status(201).json({ ok: true });
});

messagesRouter.post("/:messageId/seen", async (req, res) => {
  await pgPool.query(
    `INSERT INTO message_receipts (message_id, user_id, seen_at)
     VALUES ($1, $2, now())
     ON CONFLICT (message_id, user_id) DO UPDATE SET seen_at = now()`,
    [req.params.messageId, req.auth!.userId]
  );
  res.json({ ok: true });
});
