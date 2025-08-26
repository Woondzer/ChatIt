import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../images/ChatIT-logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, errorMessage } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const startTime = Date.now();

    try {
      const ok = await login({ username, password });
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 2000 - elapsed);

      if (ok) {
        await new Promise((r) => setTimeout(r, delay));
        navigate("/chat");
      } else {
        await new Promise((r) => setTimeout(r, delay));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex relative min-h-screen flex-col justify-top px-6 py-12 lg:px-8 bg-[#0B082F] text-slate-100">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />

      {/* <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8"> */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img src={logo} alt="ChatIT" className="mx-auto h-auto w-100" />
      </div>
      {/* Username input */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm/6 font-medium text-[#1780db]">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="Username"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#1780db] sm:text-sm/6"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm/6 font-medium text-[#1780db]">
                Password
              </label>
              <div className="text-sm">
                <Link
                  to="/workingOnIt"
                  className="font-semibold text-[#e17e41] hover:text-[#1780db]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#1780db] sm:text-sm/6"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {/* login button with loading animation on login */}
          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center rounded-md bg-[#1780db]
             px-3 text-sm font-semibold text-white shadow-xs hover:bg-[#4095dd] hover:cursor-pointer
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
             disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <div className="loader" aria-hidden="true"></div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        {/* Registration clickable text */}
        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Don't have an account?
          <Link
            to="/register"
            className="block font-semibold text-[#e17e41] hover:text-indigo-500"
          >
            Register here
          </Link>
        </p>
      </div>
      {/* </div>  */}
    </main>
  );
}
