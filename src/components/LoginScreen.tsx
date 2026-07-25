import { useState } from "react";
import { useAuth } from "../lib/auth-context";

export function LoginScreen() {
  const { signInWithGoogle, configured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--coach-bg)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-[var(--coach-indigo)] grid place-items-center text-white font-display font-bold">
              C
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight">CoachIQ</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
            Your personal AI coach
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            For exams, interviews, and everything you're training for. One question at a time.
          </p>
        </div>

        <div className="rounded-3xl bg-card p-8 shadow-[var(--shadow-warm)] border border-border/60">
          <button
            onClick={handle}
            disabled={loading || !configured}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-foreground text-background py-3.5 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16 4 9.1 8.5 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9 39.4 16 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5c-.5.4 6.4-4.7 6.4-15.2 0-1.3-.1-2.3-.4-3.5z"/>
            </svg>
            {loading ? "Signing in…" : "Sign in with Google"}
          </button>

          {!configured && (
            <p className="mt-4 text-xs text-center text-muted-foreground leading-relaxed">
              Firebase isn't configured yet. Add your <code>VITE_FIREBASE_*</code> env vars to enable sign-in.
            </p>
          )}
          {error && <p className="mt-4 text-sm text-center text-destructive">{error}</p>}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          A warm, conversational way to prepare — no clinical quizzes.
        </p>
      </div>
    </div>
  );
}
