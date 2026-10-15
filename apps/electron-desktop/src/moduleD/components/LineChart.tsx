// ============================================================================
// WHAT IS THIS FILE?
// A simple line chart drawn with plain SVG (no charting library needed
// for something this small). Give it a list of numbers and it draws a
// line connecting them, with a lightly shaded area underneath, plus the
// lowest/highest values and start/end dates labeled. Used three times on
// the Analytics screen (impressions, engagement rate, followers).
// ============================================================================

interface LineChartProps {
  title: string;
  values: number[];
  // ^ One number per day, oldest first.
  dates: string[];
  // ^ The matching dates, same length as "values".
  color: string;
  format?: (n: number) => string;
  // ^ How to display a number in the labels (e.g. add a "%" sign).
}

export function LineChart({ title, values, dates, color, format = (n) => n.toLocaleString() }: LineChartProps) {
  const width = 320;
  const height = 110;
  const pad = 6;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  // ^ "range" is never allowed to be zero, so a perfectly flat line
  //   doesn't cause a divide-by-zero.

  const coords = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    // ^ Bigger numbers sit HIGHER on screen, so the y position is flipped.
    return [x, y] as const;
  });

  const linePoints = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPoints = `${pad},${height - pad} ${linePoints} ${width - pad},${height - pad}`;
  // ^ The shaded area is the same line, closed off along the bottom edge.

  const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <p className="chart-card__title">{title}</p>
        <p className="muted-text">
          Low {format(min)} · High {format(max)}
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" className="chart-card__svg">
        <polygon points={areaPoints} fill={color} opacity={0.12} />
        <polyline points={linePoints} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <div className="chart-card__axis">
        <span className="muted-text">{dates.length ? shortDate(dates[0]) : ""}</span>
        <span className="muted-text">{dates.length ? shortDate(dates[dates.length - 1]) : ""}</span>
      </div>
    </div>
  );
}
