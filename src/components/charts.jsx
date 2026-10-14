// Reusable SVG charts for dashboards; calling pages supply the chart data, labels, and colors.
import { short } from "./ui";

const W = 600, H = 220, P = 30;

export function LineChart({ data, labels, color = "#2563eb" }) {
  const max = Math.max(...data, 1);
  const x = (i) => P + (i * (W - 2 * P)) / Math.max(data.length - 1, 1);
  const y = (v) => H - P - (v / max) * (H - 2 * P);
  const pts = data.map((v, i) => [x(i), y(v)]);
  const d = pts.map((q, i) => (i ? "L" : "M") + q[0] + " " + q[1]).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      <defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {[0, 0.5, 1].map((t) => <g key={t}><line x1={P} x2={W - P} y1={y(max * t)} y2={y(max * t)} className="gl" /><text x={P - 4} y={y(max * t) + 4} textAnchor="end" className="lbl">{short(max * t)}</text></g>)}
      <path d={`${d} L${x(data.length - 1)} ${H - P} L${P} ${H - P}Z`} fill="url(#lg)" className="fade" />
      <path d={d} pathLength="1" className="line" stroke={color} />
      {pts.map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r="4" fill="#fff" stroke={color} strokeWidth="2" />)}
      {labels.map((l, i) => <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="lbl">{l}</text>)}
    </svg>
  );
}

export function Bars({ series, labels }) {
  const max = Math.max(...series.flatMap((s) => s.data), 1);
  const g = (W - 2 * P) / labels.length, bw = g / (series.length + 1);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart">
        {[0, 0.5, 1].map((t) => <g key={t}><line x1={P} x2={W - P} y1={H - P - t * (H - 2 * P)} y2={H - P - t * (H - 2 * P)} className="gl" /><text x={P - 4} y={H - P - t * (H - 2 * P) + 4} textAnchor="end" className="lbl">{short(max * t)}</text></g>)}
        {labels.map((l, i) => (
          <g key={l + i}>
            {series.map((s, j) => {
              const h = (s.data[i] / max) * (H - 2 * P);
              return <rect key={j} x={P + i * g + bw / 2 + j * bw} y={H - P - h} width={bw * 0.9} height={h} rx="3" fill={s.color} className="bar" style={{ animationDelay: i * 70 + "ms" }} />;
            })}
            <text x={P + i * g + g / 2} y={H - 8} textAnchor="middle" className="lbl">{l}</text>
          </g>
        ))}
      </svg>
      <div className="legend">{series.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</div>
    </>
  );
}

export function Donut({ data, center, fmt = (v) => v }) {
  const tot = data.reduce((s, d) => s + d.value, 0) || 1, R = 58, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 160 160">
        <g transform="rotate(-90 80 80)">
          {data.map((d) => {
            const len = (d.value / tot) * C;
            const el = <circle key={d.label} cx="80" cy="80" r={R} fill="none" stroke={d.color} strokeWidth="22" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} className="seg" />;
            off += len;
            return el;
          })}
        </g>
        <text x="80" y="80" textAnchor="middle" className="dc">{center}</text>
        <text x="80" y="97" textAnchor="middle" className="lbl">total</text>
      </svg>
      <ul>{data.map((d) => <li key={d.label}><i style={{ background: d.color }} />{d.label}<b>{fmt(d.value)}</b></li>)}</ul>
    </div>
  );
}
