'use client';
import { useState } from 'react';
import { youtubeThumb } from '@/lib/youtube';
import { videoSource } from '@/lib/embed';

// Video diputar DI DALAM LMS (YouTube atau Google Drive). Thumbnail dulu, iframe dimuat setelah diklik.
// `sandbox` tanpa allow-popups mencegah klik logo/judul membuka tab baru.
export default function VideoPlayer({ url, title }: { url?: string | null; title: string }) {
  const [play, setPlay] = useState(false);
  const src = videoSource(url);
  if (!src) return <div className="grid aspect-video w-full place-items-center bg-ink px-4 text-center text-sm text-slate-500">Pelajaran ini belum memiliki video.</div>;
  const embed = src.kind === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${src.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`
    : `https://drive.google.com/file/d/${src.id}/preview`;
  const thumb = src.kind === 'youtube' ? youtubeThumb(src.id) : null;
  return (
    <div className="relative aspect-video w-full bg-black">
      {play ? (
        <iframe className="absolute inset-0 h-full w-full" title={title} src={embed}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <button onClick={() => setPlay(true)} aria-label={`Putar video: ${title}`} className="group absolute inset-0 h-full w-full bg-gradient-to-br from-violet/40 to-cyan/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {thumb && <img src={thumb} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />}
          <span className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 to-transparent">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-violet text-2xl shadow-[0_0_30px_rgba(139,92,246,.7)] transition active:scale-95 group-hover:scale-110">▶</span>
          </span>
        </button>
      )}
    </div>
  );
}
