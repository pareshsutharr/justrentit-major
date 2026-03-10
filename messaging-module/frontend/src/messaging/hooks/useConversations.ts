import { useEffect, useMemo, useState } from "react";
import { messagingApi } from "../api/client";
import { Conversation } from "../types";

export const useConversations = (search: string, filter: "all" | "archived" | "pinned") => {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await messagingApi.get<Conversation[]>("/conversations", {
        params: { q: search, filter }
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, filter]);

  const pinned = useMemo(() => items.filter((item) => item.is_pinned), [items]);
  return { items, pinned, loading, reload: load };
};
