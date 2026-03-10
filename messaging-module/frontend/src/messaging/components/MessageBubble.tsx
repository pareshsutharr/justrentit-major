import { Message } from "../types";

interface Props {
  message: Message;
  own: boolean;
}

export const MessageBubble = ({ message, own }: Props) => {
  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3 py-2 shadow-sm ${
          own ? "bg-blue-600 text-white" : "bg-white text-slate-900 border border-slate-200"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className={`text-[11px] mt-1 ${own ? "text-blue-100" : "text-slate-400"}`}>
          {new Date(message.created_at).toLocaleTimeString()} {message.edited ? "• edited" : ""}
        </div>
      </div>
    </div>
  );
};
