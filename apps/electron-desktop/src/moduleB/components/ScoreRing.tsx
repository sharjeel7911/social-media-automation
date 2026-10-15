// ============================================================================
// WHAT IS THIS FILE?
// A small circular "progress ring" showing a score from 0–100, color-coded
// (green = good, amber = okay, red = needs work) — the kind of visual
// you'd see for a page-speed or content-quality score. Reused across the
// Dashboard and Site Audit screens so every score looks the same way.
// ============================================================================

interface ScoreRingProps {
  score: number;
  // ^ 0–100.
  label: string;
  size?: number;
}

function colorFor(score: number): string {
  if (score >= 80) return "#2F6B2A"; // green — good
  if (score >= 50) return "#8A5A16"; // amber — okay, room to improve
  return "#A6432D"; // red — needs attention
}

export function ScoreRing({ score, label, size = 72 }: ScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const color = colorFor(score);

  return (
    <div className="score-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={6}
        />
        {/* ^ The pale background ring, always a full circle. */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          // ^ Rotated so the ring starts filling from the top (12
          //   o'clock) instead of the default 3 o'clock position.
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size * 0.26} fontWeight={600} fill={color}>
          {Math.round(score)}
        </text>
      </svg>
      <p className="muted-text score-ring__label">{label}</p>
    </div>
  );
}
