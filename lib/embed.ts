import { youtubeId } from './youtube';

export type VideoSrc = { kind: 'youtube' | 'drive'; id: string } | null;
export function videoSource(url?: string | null): VideoSrc {
  if (!url) return null;
  const y = youtubeId(url); if (y) return { kind: 'youtube', id: y };
  const d = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  return d ? { kind: 'drive', id: d[1] } : null;
}
// Google Docs / Slides / Sheets -> alamat yang bisa ditanam (iframe). Dokumen harus dibagikan "Siapa saja yang memiliki link".
export function docEmbedUrl(url?: string | null) {
  if (!url) return null;
  const m = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
  if (!m) return null;
  return m[1] === 'presentation' ? `https://docs.google.com/presentation/d/${m[2]}/embed` : `https://docs.google.com/${m[1]}/d/${m[2]}/preview`;
}
export const hostOf = (u: string) => { try { return new URL(u).hostname; } catch { return ''; } };
export const faviconOf = (u: string) => `https://www.google.com/s2/favicons?domain=${hostOf(u)}&sz=64`;
