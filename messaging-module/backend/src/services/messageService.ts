import { randomUUID } from "crypto";
import { pgPool } from "../db/pool.js";
import { MessageType } from "../types.js";

export const createMessage = async (input: {
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
}) => {
  const id = randomUUID();
  const { rows } = await pgPool.query(
    `INSERT INTO messages (id, conversation_id, sender_id, content, type, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, input.conversationId, input.senderId, input.content, input.type, input.metadata ?? {}]
  );
  return rows[0];
};

export const updateMessage = async (messageId: string, senderId: string, content: string) => {
  const { rows } = await pgPool.query(
    `UPDATE messages
     SET content = $1, edited = true
     WHERE id = $2 AND sender_id = $3 AND deleted_for_everyone = false
     RETURNING *`,
    [content, messageId, senderId]
  );
  return rows[0] ?? null;
};

export const deleteMessageForEveryone = async (messageId: string, senderId: string) => {
  const { rowCount } = await pgPool.query(
    `UPDATE messages
     SET content = 'This message was deleted.', deleted_for_everyone = true, edited = true
     WHERE id = $1 AND sender_id = $2`,
    [messageId, senderId]
  );
  return rowCount > 0;
};

export const getMessages = async (conversationId: string, limit: number, cursor?: string) => {
  const params: unknown[] = [conversationId, limit];
  let cursorSql = "";
  if (cursor) {
    params.push(cursor);
    cursorSql = `AND created_at < $3::timestamptz`;
  }

  const { rows } = await pgPool.query(
    `SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
     FROM messages m
     LEFT JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1 ${cursorSql}
     ORDER BY m.created_at DESC
     LIMIT $2`,
    params
  );

  return rows.reverse();
};
