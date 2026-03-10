import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { pgPool } from "../db/pool.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get("/unread", async (req, res) => {
  const userId = req.auth!.userId;
  const { rows } = await pgPool.query(
    `SELECT COUNT(*)::int AS unread
     FROM messages m
     JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
     LEFT JOIN message_receipts mr ON mr.message_id = m.id AND mr.user_id = $1
     WHERE cm.user_id = $1 AND m.sender_id <> $1 AND mr.seen_at IS NULL`,
    [userId]
  );
  res.json(rows[0]);
});
