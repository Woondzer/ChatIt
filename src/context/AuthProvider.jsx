import { useEffect, useState, useMemo, useCallback } from "react";
import api, { setAuthToken } from "../utils/api";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [decodedJwt, setDecodedJwt] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    try {
      const storedLoggedIn = JSON.parse(
        localStorage.getItem("loggedIn") || "false"
      );
      const storedDecoded = localStorage.getItem("decodedJwt");
      const t = localStorage.getItem("token") || "";

      if (storedLoggedIn && t) {
        setLoggedIn(true);
        setToken(t);
        setAuthToken(t);
        if (storedDecoded) setDecodedJwt(JSON.parse(storedDecoded));
      } else {
        setAuthToken(null);
      }
    } catch {
      localStorage.clear();
      setAuthToken(null);
    }
  }, []);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = useCallback(async () => {
    try {
      const { data } = await api.patch("/csrf");
      if (data?.csrfToken) setCsrfToken(data.csrfToken);
    } catch (err) {
      console.error("CSRF fetch failed", err);
    }
  }, []);

  const decodeJwt = (t) => {
    try {
      return jwtDecode(t);
    } catch {
      return null;
    }
  };

  const setLocalStorage = useCallback((t) => {
    const decoded = decodeJwt(t);
    setDecodedJwt(decoded);
    setToken(t);
    setLoggedIn(true);

    localStorage.setItem("token", t);
    localStorage.setItem("decodedJwt", JSON.stringify(decoded || {}));
    localStorage.setItem("loggedIn", JSON.stringify(true));

    setAuthToken(t);
  }, []);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("decodedJwt");
    localStorage.removeItem("loggedIn");
  }, []);

  const register = useCallback(
    async (body) => {
      setErrorMessage("");
      setSuccessMessage("");
      try {
        if (!csrfToken) await fetchCsrfToken();

        const { data } = await api.post("/auth/register", {
          ...body,
          csrfToken: csrfToken || undefined,
        });

        setRegistered(true);
        setSuccessMessage(data?.message || "Registered successfully"); //prova att ta bort Registered successfully och kör bara data.message
        return true;
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Registration failed"; // samma sak här kolla apiet och hämta hem det meddelandet istället. borde fungera
        setErrorMessage(msg);
        return false;
      }
    },
    [csrfToken, fetchCsrfToken]
  );

  const login = useCallback(
    async (body) => {
      setErrorMessage("");
      setSuccessMessage("");
      try {
        if (!csrfToken) await fetchCsrfToken();

        const { data } = await api.post("/auth/token", {
          ...body,
          csrfToken: csrfToken || undefined,
        });

        if (!data?.token || data.token.split(".").length !== 3) {
          throw new Error("Invalid token in response");
        }

        setLocalStorage(data.token);
        setSuccessMessage("Signed in successfully");
        return true;
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Sign in failed";

        setErrorMessage(msg);
        clearLocalStorage();
        setAuthToken(null);
        setLoggedIn(false);
        setToken("");
        setDecodedJwt(null);

        return false;
      }
    },
    [csrfToken, fetchCsrfToken, setLocalStorage]
  );

  const logout = useCallback(() => {
    clearLocalStorage();
    setAuthToken("");
    setLoggedIn(false);
    setToken("");
    setDecodedJwt(null);
  }, [clearLocalStorage]);

  const value = useMemo(
    () => ({
      // state
      csrfToken,
      loggedIn,
      registered,
      errorMessage,
      successMessage,
      decodedJwt,
      token,
      // setters
      setCsrfToken,
      setLoggedIn,
      setRegistered,
      setErrorMessage,
      setSuccessMessage,
      setDecodedJwt,
      setToken,
      //actions
      fetchCsrfToken,
      register,
      login,
      logout,
    }),
    [
      csrfToken,
      loggedIn,
      registered,
      errorMessage,
      successMessage,
      decodedJwt,
      token,
      fetchCsrfToken,
      register,
      login,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
