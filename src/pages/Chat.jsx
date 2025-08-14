import { useEffect, useState } from "react";
import api from "../utils/api";
import DOMPurify from "dompurify";
import { useAuth } from "../context/AuthContext";
import getCsrfToken from "../utils/csrf";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/messages");
      setMessages(data);
    } catch {
      setError("Failed to load messages");
    }
  };

  const send = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;
    try {
      const csrfToken = await getCsrfToken();
      await api.post(
        "/messages",
        { message: text },
        { headers: { "X-CSRF-Token": csrfToken } }
      );
      setText("");
      load();
    } catch {
      setError("Failed to send message");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-v-3xl mx-auto p-4">
      <form onSubmit={send} className="flex gap-2 mb-4">
        <input
          className="input input-bordered flex-1"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary">Send</button>
      </form>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <ul className="space-y-2">
        {messages.map((m) => {
          const mine = m.userId === (user?.sub || user?.id);
          const safe = DOMPurify.sanitize(m.message);
          return (
            <li
              key={m.id}
              className={`max-w-[70%] p-3 rounded-xl ${
                mine
                  ? "ml-auto bg-blue-100 text-right"
                  : "mr-auto bg-gray-100 text-left"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: safe }} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
