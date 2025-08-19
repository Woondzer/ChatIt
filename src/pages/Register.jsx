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
      // if (ok) navigate("/login");
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
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
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
                autoComplete="username"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-[#1780db] outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
            {/* felmeddelande confirm password*/}
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                Password does not match
              </p>
            )}
          </div>

          {/* Error message / Success message */}
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
            className={`flex w-full justify-center rounded-md bg-[#4095dd] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
              ${
                loading ||
                !form.username ||
                !form.email ||
                !form.password ||
                form.password !== form.confirmPassword
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4095dd] hover:bg-indigo-500 cursor-pointer"
              }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
