import { Router } from "express";
import { createMentorSession, getAvailableSlots } from "../googleCalendar.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { start, end, topic } = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: "start and end are required" });
    }

    // Re-check the slot is still free right before booking — guards against
    // two students racing for the same slot between fetching availability
    // and confirming a booking.
    const currentSlots = await getAvailableSlots();
    const stillOpen = currentSlots.some((s) => s.start === start && s.end === end);
    if (!stillOpen) {
      return res.status(409).json({ error: "That slot was just taken. Please pick another." });
    }

    const studentEmail = req.user?.email;
    const studentName = req.user?.name || req.user?.email;

    if (!studentEmail) {
      return res.status(400).json({ error: "Your account has no email on file — can't send a calendar invite." });
    }

    const session = await createMentorSession({ start, end, studentEmail, studentName, topic });
    res.json(session);
  } catch (err) {
    console.error("[schedule-mentor-session] Error:", err.message);
    res.status(500).json({ error: "Failed to book mentor session" });
  }
});

export default router;