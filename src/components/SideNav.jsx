import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const DEFAULT_AVATAR = 10;
const MAX_IMG = 70;

export default function SideNav() {
  const { loggedIn, decodedJwt, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(DEFAULT_AVATAR);
  const navigate = useNavigate();
  const panelRef = useRef(null);

  const userKey = decodedJwt?.sub || decodedJwt?.id;

  console.log("Using avatar storagekey:", userKey);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!loggedIn || !userKey) return;

    const storageKey = `avatarIndex:${userKey}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setAvatarIndex(parseInt(saved, 10));
    } else {
      setAvatarIndex(DEFAULT_AVATAR);
      localStorage.setItem(storageKey, String(DEFAULT_AVATAR));
    }
  }, [loggedIn, userKey]);

  const handleRandomizeAvatar = () => {
    const newIndex = Math.floor(Math.random() * MAX_IMG) + 1;
    setAvatarIndex(newIndex);
    localStorage.setItem(`avatarIndex:${userKey}`, String(newIndex));
  };

  // skiter i stäng med escape, ändra till kryss knapp som stänger fönstret och att det stängs vid klick utanför fönstret.
  const avatarUrl = `https://i.pravatar.cc/150?img=${avatarIndex}`;
  const name =
    decodedJwt?.user ||
    decodedJwt?.username ||
    decodedJwt?.name ||
    decodedJwt?.email?.split("@")[0] ||
    "User";

  const email = decodedJwt?.email || "";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-[#4095dd] text-white 
        shadow-lg flex items-center justify-center hover:bg-indigo-500 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 hover:cursor-pointer"
      >
        Placeholder
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Side menu"
        className={`fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* avatar & name/email */}
        <div className="flex items-center gap-3 p-4 border-b">
          <img
            src={avatarUrl}
            alt={name}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="min-w-0">
            <p className="font-semibold truncate">{name}</p>
            {email && <p className="text-sm text-gray-500 truncate">{email}</p>}
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="ml-auto p-2 rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 hover:cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* content */}
        <div className="p-4 space-y-4">
          <button
            onClick={handleRandomizeAvatar}
            aria-label="Refresh avatar"
            className="w-full inline-flex items-center justify-center rounded-md bg-indigo-500 text-white
                               px-4 py-2 font-medium hover:bg-indigo-600 focus-visible:outline-2
                               focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:cursor-pointer"
          >
            Randomize avatar
          </button>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center rounded-md bg-red-500 text-white
                               px-4 py-2 font-medium hover:bg-red-600 focus-visible:outline-2
                               focus-visible:outline-offset-2 focus-visible:outline-red-600 hover:cursor-pointer"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
