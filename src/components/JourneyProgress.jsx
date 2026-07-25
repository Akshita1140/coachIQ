import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function JourneyProgress({ total, current }) {
  const items = [];
  for (let i = 0; i < total; i++) {
    const done = i < current;
    const active = i === current;
    items.push(
      <motion.div
        key={`d-${i}`}
        className={`dot ${done ? "done" : ""} ${active ? "active" : ""}`}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
      >
        {done ? <Check size={12} strokeWidth={3} /> : i + 1}
      </motion.div>,
    );
    if (i < total - 1) {
      items.push(<div key={`l-${i}`} className={`line ${i < current ? "done" : ""}`} />);
    }
  }
  return <div className="checkpoints">{items}</div>;
}
