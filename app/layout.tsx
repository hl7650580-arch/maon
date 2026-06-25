import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'מערכת מעון',
  description: 'מערכת ניהול ומעקב דיירים',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'מערכת מעון',
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-50 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6 min-h-screen pt-16 md:pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
