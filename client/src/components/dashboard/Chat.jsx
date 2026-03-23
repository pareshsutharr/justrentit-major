import React, { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare, ExternalLink } from "lucide-react";
import { getApiBaseUrl } from "../../utils/productHelpers";

const baseUrl = getApiBaseUrl();

const Chat = ({ initialReceiverId = "" }) => {
  const [loading, setLoading] = useState(Boolean(initialReceiverId));

  useEffect(() => {
    const openMessenger = async () => {
      window.dispatchEvent(new CustomEvent("chat:open"));

      if (!initialReceiverId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/api/chat/${initialReceiverId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`
          }
        });

        const user = response?.data?.user;
        if (user?._id) {
          window.dispatchEvent(
            new CustomEvent("chat:open-user", {
              detail: {
                _id: user._id,
                name: user.name,
                profilePhoto: user.profilePhoto || "",
                email: user.email || "",
                isOnline: Boolean(user.isOnline)
              }
            })
          );
        }
      } catch {
        window.dispatchEvent(new CustomEvent("chat:open"));
      } finally {
        setLoading(false);
      }
    };

    openMessenger();
  }, [initialReceiverId]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm max-w-2xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
          <MessageSquare size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Messaging moved to the global messenger
        </h2>
        <p className="mt-3 text-sm font-medium text-slate-500 leading-6">
          The dashboard chat surface is deprecated. Use the floating messenger in the
          bottom-right corner for the unified realtime chat experience.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-700"
        >
          Open Messenger
          <ExternalLink size={14} />
        </button>
        {loading && (
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Opening requested conversation...
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;
