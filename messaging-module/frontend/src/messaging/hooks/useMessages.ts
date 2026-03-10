import { useEffect, useState } from "react";
import { messagingApi } from "../api/client";
import { Message } from "../types";

export const useMessages = (conversationId?: string) => {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const { data } = await messagingApi.get<Message[]>(`/messages/${conversationId}`, {
        params: { limit: 40 }
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [conversationId]);

  return { items, setItems, loading, reload: load };
};
