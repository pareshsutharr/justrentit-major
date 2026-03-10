import { FormEvent } from "react";
import { FiPaperclip, FiSend, FiSmile } from "react-icons/fi";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export const Composer = ({ value, onChange, onSend }: Props) => {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSend();
  };

  return (
    <form onSubmit={submit} className="border-t border-slate-200 p-3 bg-white">
      <div className="flex items-end gap-2">
        <button type="button" className="p-2 text-slate-500 hover:text-slate-700" title="Emoji">
          <FiSmile />
        </button>
        <button type="button" className="p-2 text-slate-500 hover:text-slate-700" title="Attachment">
          <FiPaperclip />
        </button>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={1}
          placeholder="Write a message"
          className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />
        <button type="submit" className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" title="Send">
          <FiSend />
        </button>
      </div>
    </form>
  );
};
