export const TypingIndicator = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return <p className="text-xs text-slate-500 px-4 py-2">Typing...</p>;
};
