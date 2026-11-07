/** @type {import('next').NextConfig} */
export default {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  experimental: { serverActions: { bodySizeLimit: '5mb' } }, // untuk unggah gambar
};
