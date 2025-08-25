import { useEffect, useState, useMemo } from "react";
import api from "../utils/api";
import DOMPurify from "dompurify";
import { useAuth } from "../hooks/useAuth";
import SideNav from "../components/SideNav";

export default function Chat() {
  const { decodedJwt, csrfToken, fetchCsrfToken } = useAuth();
  const me = decodedJwt?.sub || decodedJwt?.id;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const getDemoConvoId = () => {
    const saved = localStorage.getItem("demoConvoId");
    if (saved) return saved;
    const id = crypto.randomUUID();
    localStorage.setItem("demoConvoId", id);
    return id;
  };

  const demoConvoId = useMemo(() => getDemoConvoId(me), [me]);

  const [fakeChat, setFakeChat] = useState([
    {
      id: `fake-${crypto.randomUUID()}`,
      text: "Tja tja, hur mår du?",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      conversationId: null,
      userId: "Leffe-Pulver",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: `fake-${crypto.randomUUID()}`,
      text: "Hallå!! Svara då!!",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Leffe-Pulver",
      conversationId: null,
      userId: "mock-user",
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    {
      id: `fake-${crypto.randomUUID()}`,
      text: "Sover du eller?! 🥱",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Leffe-Pulver",
      conversationId: null,
      userId: "mock-user",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ]);

  const combined = useMemo(() => {
    return [...messages, ...fakeChat].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return ta - tb;
    });
  }, [messages, fakeChat]);

  const loadMessages = async () => {
    try {
      const { data } = await api.get("/messages", {
        params: { conversationId: demoConvoId },
      });
      setMessages(data || []);
      setError("");
    } catch {
      setError("Failed to load messages");
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      if (!csrfToken) await fetchCsrfToken();
      await api.post(
        "/messages",
        { text, conversationId: demoConvoId },
        { headers: { "X-CSRF-Token": csrfToken } }
      );
      setText("");
      await loadMessages();

      setTimeout(() => {
        setFakeChat((prev) => [
          ...prev,
          {
            id: `fake-${crypto.randomUUID()}`,
            text:
              Math.random() > 0.5 ? "Jaha okej" : "Varför tog det sån tid då?",
            avatar: "https://i.pravatar.cc/100?img=14",
            username: "Leffe-Pulver",
            conversationId: null,
            userId: "mock-user",
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 1200);
    } catch {
      setError("Failed to send message");
    }
  };

  const deleteMessage = async (id) => {
    try {
      const msg = messages.find((m) => (m.id || m._id) === id);
      if (!msg || msg.userId !== me) return;
      if (!csrfToken) await fetchCsrfToken();
      await api.delete(`/messages/${id}`, {
        headers: { "X-CSRF-Token": csrfToken },
      });
      await loadMessages();
    } catch {
      setError("Failed to delete message");
    }
  };

  useEffect(() => {
    loadMessages();
  }, [demoConvoId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <form onSubmit={send} className="flex gap-2 mb-4">
        <input
          className="input input-bordered flex-1"
          placeholder="Type message here.."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Send
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <ul className="space-y-2">
        {combined.map((m) => {
          const mine = m.userId === me;
          const isFake = String(m.id).startsWith("fake-");
          const safe = DOMPurify.sanitize(m.text);
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
              <span className="block mt-1 text-[11px] text-gray-500">
                {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
              </span>

              {mine && !isFake && (
                <button
                  onClick={() => deleteMessage(m.id)}
                  className="text-xs text-red-500 ml-2"
                >
                  trash
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="max-w-3xl mx-auto p-4">
        <SideNav />
      </div>
    </div>
  );
}
