import { randomUUID } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { pgPool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);

conversationsRouter.get("/", async (req, res) => {
  const userId = req.auth!.userId;
  const q = (req.query.q as string | undefined)?.trim() ?? "";
  const filter = (req.query.filter as string | undefined) ?? "all";

  const params: unknown[] = [userId, `%${q}%`];
  const { rows } = await pgPool.query(
    `SELECT c.id, c.type, c.title, c.avatar, cm.is_pinned, cm.is_archived,
            m.content AS last_message, m.created_at AS last_message_at,
            SUM(CASE WHEN mr.seen_at IS NULL AND m.sender_id <> $1 THEN 1 ELSE 0 END)::int AS unread_count
     FROM conversation_members cm
     JOIN conversations c ON c.id = cm.conversation_id
     LEFT JOIN LATERAL (
       SELECT * FROM messages lm WHERE lm.conversation_id = c.id ORDER BY lm.created_at DESC LIMIT 1
     ) m ON true
     LEFT JOIN message_receipts mr ON mr.message_id = m.id AND mr.user_id = $1
     WHERE cm.user_id = $1
       AND ($2 = '%%' OR COALESCE(c.title, '') ILIKE $2)
     GROUP BY c.id, cm.is_pinned, cm.is_archived, m.content, m.created_at
     ORDER BY cm.is_pinned DESC, m.created_at DESC NULLS LAST`,
    params
  );

  const filtered = rows.filter((row) => {
    if (filter === "archived") return row.is_archived;
    if (filter === "pinned") return row.is_pinned;
    return true;
  });

  res.json(filtered);
});

const createConversationSchema = z.object({
  type: z.enum(["private", "group"]),
  title: z.string().optional(),
  avatar: z.string().optional(),
  participantIds: z.array(z.string().uuid()).min(1)
});

conversationsRouter.post("/", async (req, res) => {
  const payload = createConversationSchema.parse(req.body);
  const userId = req.auth!.userId;
  const conversationId = randomUUID();

  await pgPool.query("BEGIN");
  try {
    await pgPool.query(
      `INSERT INTO conversations (id, type, title, avatar) VALUES ($1, $2, $3, $4)`,
      [conversationId, payload.type, payload.title ?? null, payload.avatar ?? null]
    );

    const memberIds = Array.from(new Set([userId, ...payload.participantIds]));
    for (const memberId of memberIds) {
      await pgPool.query(
        `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [conversationId, memberId]
      );
    }

    await pgPool.query("COMMIT");
    res.status(201).json({ id: conversationId });
  } catch (error) {
    await pgPool.query("ROLLBACK");
    throw error;
  }
});

conversationsRouter.patch("/:conversationId/archive", async (req, res) => {
  const userId = req.auth!.userId;
  await pgPool.query(
    `UPDATE conversation_members SET is_archived = true WHERE conversation_id = $1 AND user_id = $2`,
    [req.params.conversationId, userId]
  );
  res.json({ ok: true });
});

conversationsRouter.patch("/:conversationId/pin", async (req, res) => {
  const userId = req.auth!.userId;
  await pgPool.query(
    `UPDATE conversation_members SET is_pinned = true WHERE conversation_id = $1 AND user_id = $2`,
    [req.params.conversationId, userId]
  );
  res.json({ ok: true });
});
