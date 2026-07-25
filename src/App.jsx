import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth-context.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import Home from "./pages/Home.jsx";
import Session from "./pages/Session.jsx";
import Recap from "./pages/Recap.jsx";

export default function App() {
  const { user, loading, configured } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <p className="p">Loading…</p>
      </div>
    );
  }

  // Auth gate: require sign-in whenever Firebase is configured.
  if (configured && !user) return <LoginScreen />;
  // If Firebase isn't configured, still show login screen (with hint) so devs know.
  if (!configured && !user) return <LoginScreen />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/session" element={<Session />} />
      <Route path="/recap" element={<Recap />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
