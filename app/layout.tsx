import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
export const metadata: Metadata = { title: 'LMS Vibe Coding', description: 'Belajar membuat aplikasi bisnis sendiri untuk UMKM' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="id"><body className={`${jakarta.variable} font-sans antialiased`}>{children}</body></html>);
}
