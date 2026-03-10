export type MessageType =
  | "text"
  | "emoji"
  | "gif"
  | "image"
  | "video"
  | "document"
  | "voice"
  | "link";

export interface Conversation {
  id: string;
  type: "private" | "group";
  title: string;
  avatar?: string;
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  last_message?: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
  created_at: string;
  edited: boolean;
  deleted_for_everyone: boolean;
}
