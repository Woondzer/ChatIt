import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import api from "../utils/api";
import DOMPurify from "dompurify";
import { useAuth } from "../hooks/useAuth";
import SideNav from "../components/SideNav";
import { RiChatDeleteLine } from "react-icons/ri";

export default function Chat() {
  const { decodedJwt, csrfToken, fetchCsrfToken } = useAuth();
  const me = decodedJwt?.sub || decodedJwt?.id;
  const [messages, setMessages] = useState([]);
  const [fakeChat, setFakeChat] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const DEFAULT_AVATAR = 10;
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback((behavior = "auto") => {
    endRef.current?.scrollIntoView({ behavior, page: "end" });
  }, []);

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
    scrollToBottom("auto");
  }, [demoConvoId, scrollToBottom]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if (document.activeElement !== textareaRef.current) {
          e.preventDefault();
          textareaRef.current.focus();
        }
      }
    };
    window.addEventListener("keyDown", handleKeyDown);
    return () => window.removeEventListener("keyDown", handleKeyDown);
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const { data } = await api.get("/messages", {
        params: { conversationId: demoConvoId },
      });
      setMessages((data || []).filter((m) => m.conversationId === demoConvoId));
      setError("");
    } catch {
      setError("Failed to load messages");
    }
  }, [demoConvoId]);

  useEffect(() => {
    if (!LS_KEY) return;

    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setFakeChat(JSON.parse(saved));
      } else {
        const now = Date.now();
        const initial = [
          {
            id: `fake-${crypto.randomUUID()}`,
            text: "Tjena fan, det är Leffe här. Ska du med till bänken?",
            avatar: "https://i.pravatar.cc/100?img=70",
            username: "Leffe-Pulver",
            conversationId: null,
            userId: "Leffe-Pulver",
            createdAt: new Date(now + 950 * 60 * 60 * 2).toISOString(),
          },
          {
            id: `fake-${crypto.randomUUID()}`,
            text: "Grabbarna hitta en fin fin kasse bira bakom tjorren, så vi tänkte fira Roggas 2dagar som nykterist",
            avatar: "https://i.pravatar.cc/100?img=70",
            username: "Leffe-Pulver",
            conversationId: null,
            userId: "mock-user",
            createdAt: new Date(now + 970 * 60 * 60 * 2).toISOString(),
          },
          {
            id: `fake-${crypto.randomUUID()}`,
            text: "Bara dyk upp när du vill iallafall!",
            avatar: "https://i.pravatar.cc/100?img=70",
            username: "Leffe-Pulver",
            conversationId: null,
            userId: "mock-user",
            createdAt: new Date(now + 1000 * 60 * 60 * 2).toISOString(),
          },
        ];
        setFakeChat(initial);
        localStorage.setItem(LS_KEY, JSON.stringify(initial));
      }
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

  useEffect(() => {
    scrollToBottom("smooth");
  }, [combined.length, scrollToBottom]);

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

      const leffeRandomReplies = [
        "Lugnt, vi är kvar ett tag. Skickar pin strax.",
        "Säg till när du drar hemifrån så håller vi plats.",
        "Om du inte pallar idag tar vi det imorgon, inga konstigheter.",
        "Behöver du skjuts eller möte, säg till.",
        "Vi sitter vid bänken vid tjorren, kom när du kan.",
      ];

      setTimeout(() => {
        setFakeChat((prev) => [
          ...prev,
          {
            id: `fake-${crypto.randomUUID()}`,
            text: leffeRandomReplies[
              Math.floor(Math.random() * leffeRandomReplies.length)
            ],
            avatar: "https://i.pravatar.cc/100?img=70",
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    await deleteMessage(id);
  };

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <main className="min-h-dvh flex flex-col bg-[#0B082F] text-slate-100">
      <div className="max-w-3xl mx-auto p-4">
        <SideNav />
      </div>
      <div className="flex-1 overflow-auto px-2 md-px-5 pt-4">
        <ul className="space-y-6 sm:space-y-8 md:px-5 ">
          {combined.map((m) => {
            const mine = m.userId === me;

            // decide what to show
            const displayName = mine ? myName : m.username || "Unknown";
            const avatarUrl = mine
              ? myAvatarUrl
              : m.avatar || `https://i.pravatar.cc/150?img=${DEFAULT_AVATAR}`;

            const safe = DOMPurify.sanitize(m.text);

            //chat bubble styling testing a new way to write the styling.
            const bubbleBase =
              "group relative max-w-[70%] xl:max-w-[50%] rounded-2xl px-4 py-3 shadow-lg ring-1 backdrop-blur-md transition duration-200";

            const bubbleMine =
              "ml-auto bg-sky-400/15 ring-sky-200/20 text-slate-100 hover:scale-[1.01] ";
            const bubbleTheirs =
              "mr-auto bg-white/10 ring-white/15 text-slate-100 hover:scale-[1.01] ";

            return (
              <li
                key={m.id}
                className={`${bubbleBase} ${mine ? bubbleMine : bubbleTheirs}`}
              >
                {/* avatar & username */}
                <div className={`flex items-center gap-2 mb-2`}>
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-12 h-12 rounded-sm"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="text-xl font-semibold opacity-90">
                    {displayName}
                  </span>
                </div>

                {/* message text */}
                <div
                  className="leading-relaxed text-[15px] whitespace-pre-wrap [overflow-wrap:anywhere]"
                  dangerouslySetInnerHTML={{ __html: safe }}
                />

                {/* timestamp */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[11px] text-white/20">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                  </span>

                  {/* remove message btn */}
                  {mine && !String(m.id).startsWith("fake-") && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="ml-auto text-s text-rose-400/80 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition hover:cursor-pointer"
                      title="Delete message"
                    >
                      <RiChatDeleteLine />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          <li ref={endRef} />
        </ul>
      </div>

      <form onSubmit={send} className="sticky bottom-0 left-0 right-0 z-10">
        <div className="backdrop-blur-md bg-white/5 border-t border-white/10 px-3 py-3 flex gap-2">
          <textarea
            rows={4}
            ref={textareaRef}
            className="flex-1 rounded-xl bg-white/10 border border-white/15 px-4 py-3
            text-slate-100 placeholder-white/50 focus:outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/30"
            placeholder="Type message here.."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            className="rounded-xl bg-sky-500/80 px-12 font-medium text-white shadow-lg shadow-sky-500/25 hover:bg-sky-500 hover:cursor-pointer"
            type="submit"
          >
            Send
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
    </main>
  );
}
