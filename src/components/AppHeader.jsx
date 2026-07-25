import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context.jsx";

export default function AppHeader() {
  const { user, signOut } = useAuth();
  return (
    <div className="header">
      <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="brand-mark">C</div>
        <span className="font-display" style={{ fontSize: 18 }}>CoachIQ</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && <span className="p" style={{ fontSize: 13 }}>{user.displayName || user.email}</span>}
        <button className="btn btn-ghost" onClick={signOut} style={{ padding: "8px 12px" }}>Sign out</button>
      </div>
    </div>
  );
}
