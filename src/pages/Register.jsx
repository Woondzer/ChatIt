import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/ChatIT-logo.png";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { register, errorMessage, successMessage, setSuccessMessage } =
    useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      navigate("/login", { state: { flash: successMessage } });
      setSuccessMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [successMessage, navigate, setSuccessMessage]);

  return (
    <main className="flex relative min-h-screen flex-col justify-top px-6 py-12 lg:px-8 bg-[#0B082F] text-slate-100">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Logo with link */}
        <Link to="/login">
          <img src={logo} alt="ChatIT" className="mx-auto h-auto w-100" />
        </Link>
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-[#1780db]">
          Account registration
        </h2>

        <form onSubmit={submit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm/6 font-medium text-[#1780db]">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                type="text"
                name="username"
                maxLength={25}
                autoComplete="username"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#1780db] sm:text-sm/6"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </div>
          {/* Email address */}
          <div>
            <label className="block text-sm/6 font-medium text-[#1780db]">
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                name="email"
                maxLength={45}
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-[#1780db] outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#1780db] sm:text-sm/6"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm/6 font-medium text-[#1780db]">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#1780db] sm:text-sm/6"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm/6 font-medium text-[#1780db]">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#1780db] sm:text-sm/6"
              />
            </div>
            {/* errormessage / confirm password*/}
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                Password does not match
              </p>
            )}
          </div>

          {/* Errormessage / Success message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm">{successMessage}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={
              loading ||
              !form.username ||
              !form.email ||
              !form.password ||
              form.password !== form.confirmPassword
            }
            className={`flex w-full justify-center rounded-md px-3 py-3 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1780db]
              ${
                loading ||
                !form.username ||
                !form.email ||
                !form.password ||
                form.password !== form.confirmPassword
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1780db] hover:bg-[#4095dd] cursor-pointer"
              }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </main>
  );
}
