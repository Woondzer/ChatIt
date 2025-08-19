import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { token, decodedJwt } = useAuth();
  const isValid =
    Boolean(token) &&
    decodedJwt &&
    typeof decodedJwt.exp === "number" &&
    decodedJwt.exp * 1000 > Date.now();

  return isValid ? children : <Navigate to="/login" replace />;
}
