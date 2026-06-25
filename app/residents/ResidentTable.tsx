'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useSortable } from '@/components/useSortable';

type Resident = {
  id: number; name: string; id_number: string; birth_date: string;
  gender: string; housing_group: string; employment_group: string;
  health_fund: string; notes: string; guardian_count: number;
};

const COLS: { key: keyof Resident; label: string }[] = [
  { key: 'name',             label: 'שם מלא' },
  { key: 'birth_date',       label: 'תאריך לידה' },
  { key: 'gender',           label: 'מין' },
  { key: 'housing_group',    label: 'קבוצת דיור' },
  { key: 'employment_group', label: 'קבוצת תעסוקה' },
  { key: 'health_fund',      label: 'קופת חולים' },
];

export default function ResidentTable({ residents }: { residents: Resident[] }) {
  const { sorted, toggle, icon, thClass } = useSortable(residents, 'name');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {COLS.map((c) => (
              <th key={c.key}
                onClick={() => toggle(c.key)}
                className={`text-right px-4 py-3 font-medium text-gray-600 ${thClass(c.key)}`}>
                {c.label}{icon(c.key)}
              </th>
            ))}
            <th className="text-right px-3 py-3 font-medium text-gray-600">ת.ז.</th>
            <th className="text-center px-3 py-3 font-medium text-gray-600">קשרים</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-12 text-gray-400">
                אין דיירים רשומים.{' '}
                <Link href="/residents/new" className="text-blue-600 hover:underline">הוסף דייר ראשון</Link>
              </td>
            </tr>
          )}
          {sorted.map((r) => (
            <tr key={r.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-4 py-2.5">
                <Link href={`/residents/${r.id}`} className="font-medium text-blue-700 hover:underline">
                  {r.name}
                </Link>
                {r.notes && <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{r.notes}</div>}
              </td>
              <td className="px-3 py-2.5 text-gray-600">{formatDate(r.birth_date)}</td>
              <td className="px-3 py-2.5 text-center text-gray-600">{r.gender || '—'}</td>
              <td className="px-3 py-2.5 text-gray-600">{r.housing_group || '—'}</td>
              <td className="px-3 py-2.5 text-gray-600">{r.employment_group || '—'}</td>
              <td className="px-3 py-2.5 text-gray-600">{r.health_fund || '—'}</td>
              <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{r.id_number || '—'}</td>
              <td className="px-3 py-2.5 text-center">
                {Number(r.guardian_count) > 0 ? (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.guardian_count}</span>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
