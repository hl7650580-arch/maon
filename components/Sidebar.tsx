'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const nav = [
  { href: '/',          label: 'דשבורד',        emoji: '🏠' },
  { href: '/tracking',  label: 'מעקב תאריכים',  emoji: '📊' },
  { href: '/bulk',      label: 'דיווח מרוכז',    emoji: '✅' },
  { href: '/residents', label: 'פרטי דיירים',    emoji: '👥' },
  { href: '/photos',    label: 'מעקב תמונות',    emoji: '📸' },
  { href: '/documents', label: 'מסמכים לקבוצה', emoji: '📋' },
  { href: '/import',    label: 'ייבוא מאקסל',    emoji: '📥' },
  { href: '/settings',  label: 'הגדרות',          emoji: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-blue-800 flex items-center justify-between">
        <div>
          <div className="text-base font-bold leading-tight">מערכת מעון</div>
          <div className="text-blue-400 text-xs mt-1">ניהול ומעקב דיירים</div>
        </div>
        <button className="md:hidden text-blue-300 hover:text-white text-xl" onClick={() => setOpen(false)}>✕</button>
      </div>
      <nav className="p-2.5 space-y-0.5 flex-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'bg-blue-700 text-white font-medium' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}>
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-blue-800">
        <button onClick={async () => { await fetch('/api/logout', { method: 'POST' }); window.location.href = '/login'; }}
          className="w-full text-blue-300 hover:text-white text-xs text-center py-1.5 rounded hover:bg-blue-800 transition-colors">
          יציאה מהמערכת
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-40 bg-blue-900 text-white flex items-center justify-between px-4 py-3">
        <button onClick={() => setOpen(true)} className="text-white text-2xl leading-none">☰</button>
        <span className="font-bold text-sm">מערכת מעון</span>
        <div className="w-8" />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-blue-900 text-white flex flex-col h-full mr-auto z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 bg-blue-900 text-white flex-shrink-0 min-h-screen flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
