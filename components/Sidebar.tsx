'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/',          label: 'דשבורד',           emoji: '🏠' },
  { href: '/tracking',  label: 'מעקב תאריכים',     emoji: '📊' },
  { href: '/bulk',      label: 'דיווח מרוכז',       emoji: '✅' },
  { href: '/residents', label: 'פרטי דיירים',       emoji: '👥' },
  { href: '/photos',    label: 'מעקב תמונות',       emoji: '📸' },
  { href: '/documents', label: 'מסמכים לקבוצה',    emoji: '📋' },
  { href: '/import',    label: 'ייבוא מאקסל',       emoji: '📥' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 bg-blue-900 text-white flex-shrink-0 min-h-screen flex flex-col">
      <div className="p-4 border-b border-blue-800">
        <div className="text-base font-bold leading-tight">מערכת מעון</div>
        <div className="text-blue-400 text-xs mt-1">ניהול ומעקב דיירים</div>
      </div>
      <nav className="p-2.5 space-y-0.5 flex-1">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-700 text-white font-medium'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-blue-800 text-blue-500 text-xs text-center">v1.0</div>
    </aside>
  );
}
