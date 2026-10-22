import { useId } from 'react';
const COINS = { BTC: ['#f7931a', '₿'], ETH: ['#e6e8f2', 'Ξ', '#3c3c5a'], USDT: ['#26a17b', '₮'], SOL: ['linear-gradient(135deg,#9945ff,#14f195)', '◎'], NGN: ['#1c3158', '₦'] };
export function Coin({ symbol, size = 40 }) {
  const [bg, ch, fg] = COINS[symbol] || ['#1c3158', symbol?.[0] || '?'];
  return <div className="kp-coin" style={{ width: size, height: size, background: bg, color: fg || '#fff', fontSize: size * 0.45 }} aria-hidden="true">{ch}</div>;
}
export function Spark({ data, h = 48, color = '#4d8bff' }) {
  const id = useId().replace(/:/g, ''); const w = 160;
  const v = (data || []).map(Number); if (v.length < 2) return null;
  const mn = Math.min(...v), mx = Math.max(...v);
  const line = v.map((x, i) => `${(i / (v.length - 1)) * w},${h - 4 - ((x - mn) / (mx - mn || 1)) * (h - 8)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height={h} aria-hidden="true">
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={`url(#${id})`} /><polyline points={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
export function TrendChart({ labels, a, b }) {
  const w = 600, h = 220, pad = 28;
  const all = [...a, ...b].map(Number), mx = Math.max(...all) || 1;
  const pts = (s) => s.map((x, i) => [pad + (i / (s.length - 1)) * (w - pad * 2), h - pad - (Number(x) / mx) * (h - pad * 2)]);
  const path = (s) => pts(s).map((p) => p.join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Platform activity trend">
      {[0, 1, 2, 3].map((i) => <line key={i} x1={pad} x2={w - pad} y1={pad + (i * (h - pad * 2)) / 3} y2={pad + (i * (h - pad * 2)) / 3} stroke="#233955" strokeDasharray="3 4" />)}
      <polygon points={`${pad},${h - pad} ${path(a)} ${w - pad},${h - pad}`} fill="rgba(77,139,255,.18)" /><polyline points={path(a)} fill="none" stroke="#4d8bff" strokeWidth="2.5" />
      <polyline points={path(b)} fill="none" stroke="#20c997" strokeWidth="2" strokeDasharray="4 4" />
      {labels.map((l, i) => <text key={l} x={pad + (i / (labels.length - 1)) * (w - pad * 2)} y={h - 6} fill="#9aa9be" fontSize="11" textAnchor="middle">{l}</text>)}
    </svg>
  );
}
export function Orbit() {
  return (
    <svg viewBox="0 0 320 260" role="img" aria-label="Crypto and naira orbit illustration">
      <defs><radialGradient id="og" cx="50%" cy="50%"><stop offset="0" stopColor="#246bfd" stopOpacity=".35" /><stop offset="1" stopColor="#246bfd" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="160" cy="130" rx="150" ry="110" fill="url(#og)" />
      <ellipse cx="160" cy="135" rx="140" ry="52" fill="none" stroke="#3fd6e0" strokeOpacity=".7" transform="rotate(-12 160 135)" />
      <ellipse cx="160" cy="125" rx="120" ry="80" fill="none" stroke="#4d8bff" strokeOpacity=".5" transform="rotate(18 160 125)" />
      <rect x="108" y="62" width="120" height="120" rx="18" fill="#12315a" stroke="#4d8bff" strokeOpacity=".6" transform="rotate(8 168 122)" />
      <circle cx="176" cy="120" r="38" fill="#3b6fe0" /><text x="176" y="134" textAnchor="middle" fontSize="40" fontWeight="700" fill="#fff">₿</text>
      <circle cx="82" cy="108" r="30" fill="#26a17b" /><text x="82" y="120" textAnchor="middle" fontSize="32" fontWeight="700" fill="#fff">₮</text>
      <circle cx="124" cy="176" r="22" fill="#2a9d78" /><text x="124" y="184" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff">₦</text>
      <circle cx="262" cy="86" r="4" fill="#3fd6e0" /><circle cx="48" cy="170" r="3" fill="#4d8bff" /><circle cx="236" cy="198" r="3" fill="#3fd6e0" />
    </svg>
  );
}
export function ShieldArt() {
  return (
    <svg viewBox="0 0 160 170" width="150" role="img" aria-label="Verified shield">
      <defs><linearGradient id="sg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#8fb2e8" /><stop offset="1" stopColor="#2a4f8f" /></linearGradient><radialGradient id="sh" cx="50%" cy="50%"><stop offset="0" stopColor="#246bfd" stopOpacity=".5" /><stop offset="1" stopColor="#246bfd" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="80" cy="85" rx="76" ry="76" fill="url(#sh)" />
      <path d="M80 14l52 20v38c0 36-22 58-52 70-30-12-52-34-52-70V34z" fill="url(#sg)" /><path d="M80 24l42 16v32c0 30-17 48-42 58-25-10-42-28-42-58V40z" fill="#0f2a55" />
      <path d="M58 78l16 16 30-34" fill="none" stroke="#4d8bff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
