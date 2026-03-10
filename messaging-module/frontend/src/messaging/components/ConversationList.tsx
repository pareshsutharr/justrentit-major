import { Conversation } from "../types";
import { ConversationItem } from "./ConversationItem";

interface Props {
  items: Conversation[];
  loading: boolean;
  activeId?: string;
  onSelect: (conversationId: string) => void;
}

export const ConversationList = ({ items, loading, activeId, onSelect }: Props) => {
  return (
    <div className="h-full overflow-y-auto">
      {loading ? (
        <p className="text-sm text-slate-500 p-4">Loading conversations...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 p-4">No conversations found</p>
      ) : (
        items.map((item) => (
          <ConversationItem
            key={item.id}
            item={item}
            active={activeId === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))
      )}
    </div>
  );
};
