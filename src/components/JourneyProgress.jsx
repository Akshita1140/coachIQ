export default function JourneyProgress({ total, current }) {
  const items = [];
  for (let i = 0; i < total; i++) {
    const done = i < current;
    const active = i === current;
    items.push(
      <div key={`d-${i}`} className={`dot ${done ? "done" : ""} ${active ? "active" : ""}`}>
        {done ? "✓" : i + 1}
      </div>,
    );
    if (i < total - 1) items.push(<div key={`l-${i}`} className={`line ${i < current ? "done" : ""}`} />);
  }
  return <div className="checkpoints">{items}</div>;
}
