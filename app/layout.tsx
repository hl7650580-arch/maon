import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'מערכת מעון - מעקב דיירים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-50 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
