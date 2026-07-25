import { Router } from "express";
import { getAvailableSlots } from "../googleCalendar.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const slots = await getAvailableSlots();
    res.json({ slots });
  } catch (err) {
    console.error("[mentor-availability] Error:", err.message);
    res.status(500).json({ error: "Failed to load mentor availability" });
  }
});

export default router;