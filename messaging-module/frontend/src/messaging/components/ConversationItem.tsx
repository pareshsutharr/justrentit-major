import { Conversation } from "../types";

interface Props {
  item: Conversation;
  active: boolean;
  onClick: () => void;
}

export const ConversationItem = ({ item, active, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-slate-100 hover:bg-slate-100 ${
        active ? "bg-slate-100" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={item.avatar || "https://via.placeholder.com/48"}
          alt={item.title}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm truncate">{item.title}</p>
            <span className="text-xs text-slate-400">
              {item.last_message_at ? new Date(item.last_message_at).toLocaleTimeString() : ""}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">{item.last_message || "No messages yet"}</p>
        </div>
        {item.unread_count > 0 && (
          <span className="h-5 min-w-5 px-1 rounded-full bg-emerald-500 text-white text-xs grid place-items-center">
            {item.unread_count}
          </span>
        )}
      </div>
    </button>
  );
};
