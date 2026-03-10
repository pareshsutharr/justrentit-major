import { useEffect, useMemo, useState } from "react";
import { Conversation } from "../types";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useDrafts } from "../hooks/useDrafts";
import { useRealtimeMessaging } from "../hooks/useRealtimeMessaging";
import { messagingApi } from "../api/client";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";

interface Props {
  myUserId: string;
}

export const MessagingLayout = ({ myUserId }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "archived" | "pinned">("all");
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [typing, setTyping] = useState(false);

  const { items, loading } = useConversations(search, filter);
  const activeConversation = useMemo<Conversation | undefined>(
    () => items.find((item) => item.id === activeConversationId),
    [items, activeConversationId]
  );

  const { items: messages, setItems } = useMessages(activeConversationId);
  const { draft, setDraft, clearDraft } = useDrafts(activeConversationId);
  const socket = useRealtimeMessaging(activeConversationId);

  useEffect(() => {
    socket.on("message:new", (message) => {
      setItems((prev) => [...prev, message]);
    });
    socket.on("message:typing", (payload) => {
      if (payload.userId !== myUserId) setTyping(payload.isTyping);
    });

    return () => {
      socket.off("message:new");
      socket.off("message:typing");
    };
  }, [socket, myUserId, setItems]);

  const sendMessage = async () => {
    if (!activeConversationId || !draft.trim()) return;
    const payload = {
      conversationId: activeConversationId,
      content: draft.trim(),
      type: "text" as const
    };

    const { data } = await messagingApi.post("/messages", payload);
    socket.emit("message:send", data);
    setItems((prev) => [...prev, data]);
    clearDraft();
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-12 shadow-sm">
      <aside className="col-span-12 md:col-span-4 xl:col-span-3 bg-slate-50 border-r border-slate-200 h-full">
        <div className="p-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-2">Messaging</h2>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex gap-2 text-xs">
            {(["all", "pinned", "archived"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-2 py-1 rounded-full border ${filter === item ? "bg-blue-600 text-white" : "bg-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <ConversationList
          items={items}
          loading={loading}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
        />
      </aside>

      <section className="col-span-12 md:col-span-8 xl:col-span-9 h-full">
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          myUserId={myUserId}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendMessage}
          typing={typing}
        />
      </section>
    </div>
  );
};
