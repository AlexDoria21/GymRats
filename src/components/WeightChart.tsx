export interface ChartPoint {
  label: string;
  value: number;
}

interface Props {
  points: ChartPoint[];
  unit: string;
}

// viewBox coordinate space (scales responsively, uniform aspect)
const W = 320;
const H = 168;
const PAD_L = 14;
const PAD_R = 14;
const PAD_T = 22;
const PAD_B = 26;

/** Minimal dependency-free SVG line chart of weight per week. */
export function WeightChart({ points, unit }: Props) {
  const n = points.length;
  const values = points.map((p) => p.value);
  const vMax = Math.max(...values);
  let vMin = Math.min(...values);
  if (vMin === vMax) vMin = vMax === 0 ? 0 : vMax - 1; // avoid divide-by-zero / flat line at edge

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const x = (i: number) => (n <= 1 ? PAD_L + innerW / 2 : PAD_L + (i * innerW) / (n - 1));
  const y = (v: number) => PAD_T + (1 - (v - vMin) / (vMax - vMin || 1)) * innerH;

  const coords = points.map((p, i) => ({ cx: x(i), cy: y(p.value), ...p }));
  const linePath = coords.map((c) => `${c.cx},${c.cy}`).join(' ');
  const areaPath =
    `${PAD_L},${PAD_T + innerH} ` +
    coords.map((c) => `${c.cx},${c.cy}`).join(' ') +
    ` ${PAD_L + innerW},${PAD_T + innerH}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Gráfica de progreso de carga"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="wc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-blaze)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-blaze)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wc-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-blaze)" />
          <stop offset="100%" stopColor="var(--color-blaze-2)" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line
        x1={PAD_L}
        y1={PAD_T + innerH}
        x2={PAD_L + innerW}
        y2={PAD_T + innerH}
        stroke="var(--color-line)"
        strokeWidth="1"
      />

      {n > 1 && <polygon points={areaPath} fill="url(#wc-fill)" />}
      {n > 1 && (
        <polyline
          points={linePath}
          fill="none"
          stroke="url(#wc-stroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {coords.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.cx}
            cy={c.cy}
            r="3.5"
            fill="var(--color-blaze)"
            stroke="var(--color-bg)"
            strokeWidth="1.5"
          />
          {c.value > 0 && (
            <text
              x={c.cx}
              y={c.cy - 9}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="var(--color-ink)"
            >
              {c.value}
            </text>
          )}
          <text x={c.cx} y={H - 9} textAnchor="middle" fontSize="9.5" fill="var(--color-faint)">
            {c.label}
          </text>
        </g>
      ))}

      <text x={PAD_L} y={13} fontSize="9.5" fill="var(--color-faint)">
        {unit}
      </text>
    </svg>
  );
}
