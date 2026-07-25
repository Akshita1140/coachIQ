import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle2, Loader2, Video } from "lucide-react";
import { getMentorAvailability, scheduleMentorSession } from "../lib/api.js";

function groupByDay(slots) {
  const groups = new Map();
  for (const slot of slots) {
    const d = new Date(slot.start);
    const key = d.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(slot);
  }
  return Array.from(groups.entries());
}

function formatDayLabel(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * Inline scheduler that replaces the old static Calendly link. Fetches the
 * mentor's real open slots (backed by Google Calendar freebusy), lets the
 * student pick one, and books it — the backend creates a Calendar event with
 * an auto-generated Meet link and emails the invite to the student.
 */
export default function MentorScheduler({ topic }) {
  const [status, setStatus] = useState("loading"); // loading | ready | error | booking | booked
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    getMentorAvailability()
      .then((res) => {
        setSlots(res.slots || []);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Failed to load mentor availability:", err.message);
        setErrorMsg("Couldn't load open slots right now.");
        setStatus("error");
      });
  }, []);

  const grouped = useMemo(() => groupByDay(slots).slice(0, 5), [slots]);

  const handleBook = async () => {
    if (!selected) return;
    setStatus("booking");
    setErrorMsg("");
    try {
      const result = await scheduleMentorSession({ start: selected.start, end: selected.end, topic });
      setSession(result);
      setStatus("booked");
    } catch (err) {
      console.error("Failed to book mentor session:", err.message);
      setErrorMsg(err.message || "Couldn't book that slot — it may have just been taken.");
      setStatus("ready");
    }
  };

  if (status === "booked" && session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: "flex", flexDirection: "column", gap: 10,
          padding: 16, borderRadius: "var(--radius-md)",
          background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: "var(--coach-ink)" }}>
          <CheckCircle2 size={18} style={{ color: "var(--coach-accent-light)" }} />
          You're booked!
        </div>
        <p className="p" style={{ fontSize: 13 }}>
          {new Date(session.start).toLocaleString(undefined, {
            weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
          })}
          . A calendar invite is on its way to your inbox.
        </p>
        {session.meetLink && (
          <a
            href={session.meetLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ width: "fit-content", textDecoration: "none" }}
          >
            <Video size={15} /> Join on Google Meet
          </a>
        )}
      </motion.div>
    );
  }

  return (
    <div className="stack">
      {status === "loading" && (
        <div className="row" style={{ alignItems: "center", gap: 8, color: "var(--coach-muted)", fontSize: 13 }}>
          <Loader2 size={14} className="spin" /> Loading open slots…
        </div>
      )}

      {status === "error" && <p className="p" style={{ fontSize: 13, color: "#fca5a5" }}>{errorMsg}</p>}

      {(status === "ready" || status === "booking") && grouped.length === 0 && (
        <p className="p" style={{ fontSize: 13 }}>No open slots in the next few days — check back soon.</p>
      )}

      {(status === "ready" || status === "booking") && grouped.length > 0 && (
        <>
          <div className="row" style={{ gap: 8 }}>
            <Calendar size={15} style={{ color: "var(--coach-accent-light)", flexShrink: 0, marginTop: 2 }} />
            <p className="p" style={{ fontSize: 13, margin: 0 }}>Pick a 30-minute slot — a Meet link gets created automatically.</p>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            {grouped.map(([day, daySlots]) => (
              <div key={day}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--coach-muted-2)", fontWeight: 600, marginBottom: 6 }}>
                  {formatDayLabel(day)}
                </div>
                <div className="row" style={{ gap: 8 }}>
                  {daySlots.map((slot) => {
                    const isSelected = selected?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        className="btn btn-ghost"
                        onClick={() => setSelected(slot)}
                        style={{
                          padding: "6px 12px", fontSize: 13,
                          borderColor: isSelected ? "var(--coach-accent-light)" : undefined,
                          background: isSelected ? "rgba(6, 182, 212, 0.14)" : undefined,
                          color: isSelected ? "var(--coach-accent-light)" : undefined,
                        }}
                      >
                        {formatTime(slot.start)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {errorMsg && <p className="p" style={{ fontSize: 13, color: "#fca5a5" }}>{errorMsg}</p>}

          <motion.button
            className="btn btn-primary"
            style={{ width: "fit-content" }}
            disabled={!selected || status === "booking"}
            onClick={handleBook}
            whileHover={selected ? { y: -1 } : {}}
            whileTap={selected ? { scale: 0.97 } : {}}
          >
            {status === "booking" ? (
              <>
                <Loader2 size={15} className="spin" /> Booking…
              </>
            ) : (
              <>
                <Video size={15} /> Confirm & get Meet link
              </>
            )}
          </motion.button>
        </>
      )}
    </div>
  );
}
