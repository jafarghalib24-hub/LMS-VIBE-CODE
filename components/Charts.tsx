const fmt = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1) + ' jt' : n >= 1e3 ? Math.round(n / 1e3) + ' rb' : String(n);

export function AreaChart({ data, labels }: { data: number[]; labels: string[] }) {
  const W = 420, H = 170, P = 24, max = Math.max(...data, 1);
  const pts = data.map((v, i) => [P + (i * (W - 2 * P)) / Math.max(data.length - 1, 1), H - P - (v / max) * (H - 2 * P)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Grafik pendapatan bulanan">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06B6D4" stopOpacity=".45" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0" /></linearGradient></defs>
      {[0, .5, 1].map((t) => <line key={t} x1={P} x2={W - P} y1={H - P - t * (H - 2 * P)} y2={H - P - t * (H - 2 * P)} stroke="#fff" strokeOpacity=".07" />)}
      <path d={`${line} L${pts[pts.length - 1][0]},${H - P} L${pts[0][0]},${H - P} Z`} fill="url(#ag)" />
      <path d={line} fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />)}
      {labels.map((l, i) => <text key={i} x={pts[i][0]} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{l}</text>)}
      <text x={P} y="12" fontSize="10" fill="#94a3b8">Maks {fmt(max)}</text>
    </svg>
  );
}
export function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const W = 420, H = 170, P = 24, max = Math.max(...data, 1), bw = (W - 2 * P) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Grafik jumlah pendaftar per bulan">
      {data.map((v, i) => { const h = (v / max) * (H - 2 * P); return (
        <g key={i}><rect x={P + i * bw + bw * .2} y={H - P - h} width={bw * .6} height={Math.max(h, 2)} rx="4" fill={i % 2 ? '#8B5CF6' : '#06B6D4'} />
          <text x={P + i * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{labels[i]}</text>
          <text x={P + i * bw + bw / 2} y={H - P - h - 5} textAnchor="middle" fontSize="10" fill="#cbd5e1">{v}</text></g>); })}
    </svg>
  );
}
