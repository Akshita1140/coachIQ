import { Link } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";

export function AppHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="border-b border-border/60 bg-[var(--coach-bg)]/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[var(--coach-indigo)] grid place-items-center text-white font-display font-bold text-sm">
            C
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">CoachIQ</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-xs font-medium">
                {user.displayName?.[0] ?? "?"}
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
