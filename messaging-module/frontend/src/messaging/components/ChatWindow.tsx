import { Conversation, Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { TypingIndicator } from "./TypingIndicator";

interface Props {
  conversation?: Conversation;
  messages: Message[];
  myUserId: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  typing: boolean;
}

export const ChatWindow = ({
  conversation,
  messages,
  myUserId,
  draft,
  onDraftChange,
  onSend,
  typing
}: Props) => {
  if (!conversation) {
    return (
      <div className="h-full grid place-items-center bg-white">
        <p className="text-slate-500">Select a conversation to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="h-16 border-b border-slate-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={conversation.avatar || "https://via.placeholder.com/40"} className="h-10 w-10 rounded-full" />
          <div>
            <p className="text-sm font-semibold">{conversation.title}</p>
            <p className="text-xs text-emerald-600">Online</p>
          </div>
        </div>
        <div className="text-xs text-slate-500">Video • More</div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} own={message.sender_id === myUserId} />
        ))}
      </div>

      <TypingIndicator show={typing} />
      <Composer value={draft} onChange={onDraftChange} onSend={onSend} />
    </div>
  );
};
