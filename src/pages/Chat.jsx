import { useEffect, useState } from "react";
import api from "../utils/api";
import DOMPurify from "dompurify";
import { useAuth } from "../context/AuthContext";
import getCsrfToken from "../utils/csrf";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  // const [id, setId] = useState("");
  const [text, setText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [error, setError] = useState("");

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/conversations");
      setConversations(data || []);
      if (data?.length && !conversationId) {
        setConversationId(data[0].id);
      }
    } catch {
      setError("Failed to load conversations");
    }
  };

  const loadMessages = async (cid = conversationId) => {
    if (!cid) return;
    try {
      const { data } = await api.get("/messages", {
        params: { conversationId: cid },
      });
      setMessages(data || []);
      setError("");
    } catch {
      setError("Failed to load messages");
    }
  };

  const send = async (e) => {
    e.preventDefault();

    if (!text.trim() || !conversationId) return;
    try {
      const csrfToken = await getCsrfToken();
      await api.post(
        "/messages",
        { text, conversationId },
        { headers: { "X-CSRF-Token": csrfToken } }
      );
      setText("");
      await loadMessages(conversationId);
    } catch {
      setError("Failed to send message");
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);
  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* drop down för att byta convo */}
      {conversations.length > 0 && (
        <select
          className="select select-bordered mb-4"
          value={conversationId}
          onChange={(e) => setConversationId(e.target.value)}
        >
          {conversations.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title || c.id}
            </option>
          ))}
        </select>
      )}

      <form onSubmit={send} className="flex gap-2 mb-4">
        <input
          className="input input-bordered flex-1"
          placeholder="Type message here.."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" onClick={send()}>
          Send
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <ul className="space-y-2">
        {messages.map((m) => {
          const mine = m.userId === (user?.sub || user?.id);
          const safe = DOMPurify.sanitize(m.text);
          return (
            <li
              key={m.id || m._id}
              className={`max-w-[70%] p-3 rounded-xl ${
                mine
                  ? "ml-auto bg-blue-100 text-right"
                  : "mr-auto bg-gray-100 text-left"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: safe }} />
              <span className="block mt-1 text-[11px] text-gray-500">
                {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
