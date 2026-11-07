// Tampil langsung saat berpindah halaman, jadi layar tidak terasa "macet" saat data dimuat.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Memuat halaman">
      <div className="h-7 w-44 rounded-lg bg-white/10" />
      <div className="h-4 w-64 max-w-full rounded bg-white/5" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/5" />)}</div>
      <div className="h-40 rounded-2xl bg-white/5" />
      <div className="h-40 rounded-2xl bg-white/5" />
    </div>
  );
}
