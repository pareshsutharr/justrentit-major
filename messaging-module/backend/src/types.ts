export type ConversationType = "private" | "group";
export type InboxType = "focused" | "other";
export type MessageType =
  | "text"
  | "emoji"
  | "gif"
  | "image"
  | "video"
  | "document"
  | "voice"
  | "link";

export interface JwtPayload {
  userId: string;
  email: string;
}
