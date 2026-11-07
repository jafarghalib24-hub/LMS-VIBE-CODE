export function youtubeId(url?: string | null) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}
export const youtubeThumb = (id?: string | null) => (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
