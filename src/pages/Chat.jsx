import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../utils/api";
import DOMPurify from "dompurify";
import { useAuth } from "../hooks/useAuth";
import SideNav from "../components/SideNav";

export default function Chat() {
  const { decodedJwt, csrfToken, fetchCsrfToken } = useAuth();
  const me = decodedJwt?.sub || decodedJwt?.id;
  const [messages, setMessages] = useState([]);
  const [fakeChat, setFakeChat] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const DEFAULT_AVATAR = 10;

  const myName =
    decodedJwt?.user ||
    decodedJwt.username ||
    decodedJwt.name ||
    decodedJwt.email?.split("@")[0] ||
    "Me";

  const myAvatarIndex = parseInt(
    localStorage.getItem(`avatarIndex:${me}`) ?? DEFAULT_AVATAR,
    10
  );

  const myAvatarUrl = `https://i.pravatar.cc/150?img=${myAvatarIndex}`;

  const getDemoConvoId = useCallback(() => {
    if (!me) return null;
    const key = `chat:convoId:${me}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    localStorage.removeItem("demoConvoId");
    return id;
  }, [me]);

  const demoConvoId = useMemo(() => getDemoConvoId(), [getDemoConvoId]);

  const LS_KEY = useMemo(
    () => (demoConvoId ? `chat:mock:${demoConvoId}` : null),
    [demoConvoId]
  );

  useEffect(() => {
    setMessages([]);
    setFakeChat([]);
  }, [demoConvoId]);

  const loadMessages = async () => {
    try {
      const { data } = await api.get("/messages", {
        params: { conversationId: demoConvoId },
      });
      setMessages((data || []).filter((m) => m.conversationId === demoConvoId));
      setError("");
    } catch {
      setError("Failed to load messages");
    }
  };

  useEffect(() => {
    if (!LS_KEY) return;

    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setFakeChat(JSON.parse(saved));
        return;
      }

      const now = Date.now();
      const initial = [
        {
          id: `fake-${crypto.randomUUID()}`,
          text: "Tja tja, hur mår du?",
          avatar: "https://i.pravatar.cc/100?img=14",
          username: "Leffe-Pulver",
          conversationId: null,
          userId: "Leffe-Pulver",
          createdAt: new Date(now + 950 * 60 * 60 * 2).toISOString(),
        },
        {
          id: `fake-${crypto.randomUUID()}`,
          text: "Hallå!! Svara då!!",
          avatar: "https://i.pravatar.cc/100?img=14",
          username: "Leffe-Pulver",
          conversationId: null,
          userId: "mock-user",
          createdAt: new Date(now + 970 * 60 * 60 * 2).toISOString(),
        },
        {
          id: `fake-${crypto.randomUUID()}`,
          text: "Sover du eller?! 🥱",
          avatar: "https://i.pravatar.cc/100?img=14",
          username: "Leffe-Pulver",
          conversationId: null,
          userId: "mock-user",
          createdAt: new Date(now + 1000 * 60 * 60 * 2).toISOString(),
        },
      ];

      setFakeChat(initial);
      localStorage.setItem(LS_KEY, JSON.stringify(initial));
    } catch (error) {
      console.error("Failed to initialize mocked chat", error);
    }
  }, [LS_KEY]);

  useEffect(() => {
    if (!LS_KEY) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(fakeChat));
    } catch (error) {
      console.error("Failed to persist mocked chat", error);
    }
  }, [LS_KEY, fakeChat]);

  const combined = useMemo(() => {
    return [...messages, ...fakeChat].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return ta - tb;
    });
  }, [messages, fakeChat]);

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
            createdAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
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
      <ul className="space-y-2">
        {combined.map((m) => {
          const mine = m.userId === me;

          // decide what to show
          const displayName = mine ? myName : m.username || "Unknown";
          const avatarUrl = mine
            ? myAvatarUrl
            : m.avatar || `https://i.pravatar.cc/150?img=${DEFAULT_AVATAR}`;

          const safe = DOMPurify.sanitize(m.text);

          return (
            <li
              key={m.id}
              className={`max-w-[70%] p-3 rounded-xl ${
                mine
                  ? "ml-auto bg-blue-100 text-left"
                  : "mr-auto bg-gray-100 text-left"
              }`}
            >
              {/* avatar + username (inside the bubble for both users) */}
              <div className={`flex items-center gap-2 mb-1`}>
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-sm"
                />
                <span className="text-xl font-semibold">{displayName}</span>
              </div>

              {/* message text */}
              <div dangerouslySetInnerHTML={{ __html: safe }} />

              {/* timestamp */}
              <span className="block mt-1 text-[11px] text-gray-500">
                {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
              </span>

              {mine && !String(m.id).startsWith("fake-") && (
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

      <div className="max-w-3xl mx-auto p-4">
        <SideNav />
      </div>
    </div>
  );
}
