import { useEffect, useState } from "react";

export const useDrafts = (conversationId?: string) => {
  const key = conversationId ? `draft:${conversationId}` : "draft:unknown";
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!conversationId) return;
    setDraft(localStorage.getItem(key) || "");
  }, [conversationId, key]);

  const update = (value: string) => {
    setDraft(value);
    if (conversationId) localStorage.setItem(key, value);
  };

  const clear = () => {
    setDraft("");
    if (conversationId) localStorage.removeItem(key);
  };

  return { draft, setDraft: update, clearDraft: clear };
};
