'use client';

import Link from 'next/link';
import { formatDate, daysSince, daysColor, daysText } from '@/lib/utils';
import { useSortable } from '@/components/useSortable';
import PhotoQuickLog from './PhotoQuickLog';
import PhotoPermissionSelect from './PhotoPermissionSelect';

type Row = {
  id: number; name: string; housing_group: string; employment_group: string;
  photo_permission: string | null; last_photo: string | null; total_photos: number;
  _days: number | null;
};

const COLS: { key: keyof Row; label: string }[] = [
  { key: 'name',             label: 'שם דייר' },
  { key: 'housing_group',    label: 'קבוצת דיור' },
  { key: '_days',            label: 'תמונה אחרונה' },
  { key: 'photo_permission', label: 'אישור צילום' },
  { key: 'total_photos',     label: 'סה"כ פרסומים' },
];

export default function PhotosTable({ residents }: { residents: Omit<Row, '_days'>[] }) {
  const rows: Row[] = residents.map((r) => ({ ...r, _days: daysSince(r.last_photo) }));
  const { sorted, toggle, icon, thClass } = useSortable(rows, '_days', 'asc');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {COLS.map((c) => (
              <th key={String(c.key)}
                onClick={() => toggle(c.key)}
                className={`text-right px-4 py-3 font-medium text-gray-600 ${thClass(c.key)}`}>
                {c.label}{icon(c.key)}
              </th>
            ))}
            <th className="text-center px-4 py-3 font-medium text-gray-600">מצב</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">פעולה מהירה</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/residents/${r.id}`} className="font-medium text-blue-700 hover:underline">
                  {r.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-500">{r.housing_group || '—'}</td>
              <td className="px-4 py-3 text-gray-700">
                {r.last_photo ? formatDate(r.last_photo) : <span className="text-gray-400">אף פעם</span>}
              </td>
              <td className="px-4 py-3">
                <PhotoPermissionSelect residentId={r.id} initial={r.photo_permission} />
              </td>
              <td className="px-4 py-3 text-center text-gray-500">{r.total_photos}</td>
              <td className="px-4 py-3 text-center">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${daysColor(r._days, 30, 60)}`}>
                  {r.last_photo ? daysText(r._days) : 'לא פורסם'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <PhotoQuickLog residentId={r.id} residentName={r.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
