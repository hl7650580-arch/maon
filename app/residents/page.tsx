export const dynamic = 'force-dynamic';

import Link from 'next/link';
import sql from '@/lib/db';
import { formatDate } from '@/lib/utils';

export default async function ResidentsPage() {
  const residents = await sql`
    SELECT r.*,
      (SELECT COUNT(*) FROM guardians WHERE resident_id = r.id) as guardian_count
    FROM residents r
    WHERE r.is_active = 1
    ORDER BY r.name
  ` as {
    id: number; name: string; id_number: string; birth_date: string;
    gender: string; housing_group: string; employment_group: string;
    health_fund: string; notes: string; guardian_count: number;
  }[];

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">דיירים</h1>
          <p className="text-gray-500 text-sm mt-0.5">{residents.length} דיירים פעילים</p>
        </div>
        <Link href="/residents/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          + הוסף דייר
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600">שם מלא</th>
              <th className="text-right px-3 py-3 font-medium text-gray-600">ת.ז.</th>
              <th className="text-right px-3 py-3 font-medium text-gray-600">תאריך לידה</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">מין</th>
              <th className="text-right px-3 py-3 font-medium text-gray-600">קבוצת דיור</th>
              <th className="text-right px-3 py-3 font-medium text-gray-600">קבוצת תעסוקה</th>
              <th className="text-right px-3 py-3 font-medium text-gray-600">קופת חולים</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">קשרים</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {residents.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  אין דיירים רשומים.{' '}
                  <Link href="/residents/new" className="text-blue-600 hover:underline">הוסף דייר ראשון</Link>
                </td>
              </tr>
            )}
            {residents.map((r) => (
              <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2.5">
                  <Link href={`/residents/${r.id}`} className="font-medium text-blue-700 hover:underline">
                    {r.name}
                  </Link>
                  {r.notes && (
                    <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{r.notes}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{r.id_number || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{formatDate(r.birth_date)}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{r.gender || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{r.housing_group || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{r.employment_group || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{r.health_fund || '—'}</td>
                <td className="px-3 py-2.5 text-center">
                  {Number(r.guardian_count) > 0 ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {r.guardian_count}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
