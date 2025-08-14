import { useState } from "react";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../images/ChatIT-logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const startTime = Date.now();

    try {
      const { data: csrf } = await api.patch("/csrf");
      const { data } = await api.post("/auth/token", {
        username,
        password,
        csrfToken: csrf.csrfToken,
      });

      const decoded = jwtDecode(data.token);
      login(data.token, decoded);

      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        navigate("/chat");
      }, delay);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img src={logo} alt="ChatIT" className="mx-auto h-auto w-100" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-[#1780db]">
          Sign in to your account
        </h2>
      </div>

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
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm/6 font-medium text-[#1780db]">
                Password
              </label>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-semibold text-[#e17e41] hover:text-indigo-500"
                >
                  Forgot password?
                </a>
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
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {loading ? (
            <div className="flex justify-center">
              <div className="loader"></div>
            </div>
          ) : (
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#4095dd] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          )}
        </form>

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
    </div>
  );
}
