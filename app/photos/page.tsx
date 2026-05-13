export const dynamic = 'force-dynamic';

import Link from 'next/link';
import getDb from '@/lib/db';
import { formatDate, daysSince, daysColor, daysText } from '@/lib/utils';
import PhotoQuickLog from './PhotoQuickLog';

function getPhotosOverview() {
  const db = getDb();
  return db.prepare(`
    SELECT r.id, r.name, r.housing_group, r.employment_group,
      MAX(p.published_date) as last_photo,
      COUNT(p.id) as total_photos
    FROM residents r
    LEFT JOIN photos p ON r.id = p.resident_id
    WHERE r.is_active = 1
    GROUP BY r.id
    ORDER BY last_photo ASC NULLS FIRST, r.name ASC
  `).all() as {
    id: number; name: string; housing_group: string; employment_group: string;
    last_photo: string | null; total_photos: number;
  }[];
}

export default function PhotosPage() {
  const residents = getPhotosOverview();

  const neverPublished = residents.filter((r) => !r.last_photo);
  const over60  = residents.filter((r) => r.last_photo && (daysSince(r.last_photo) ?? 0) > 60);
  const over30  = residents.filter((r) => r.last_photo && (daysSince(r.last_photo) ?? 0) > 30 && (daysSince(r.last_photo) ?? 0) <= 60);
  const recent  = residents.filter((r) => r.last_photo && (daysSince(r.last_photo) ?? 0) <= 30);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📸 מעקב פרסום תמונות</h1>
        <p className="text-gray-500 text-sm mt-1">
          מטרה: לפרסם תמונה לכל דייר לפחות אחת ל-30 יום
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-600">{neverPublished.length}</div>
          <div className="text-sm text-gray-600 mt-1">לא פורסמו מעולם</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-600">{over60.length}</div>
          <div className="text-sm text-gray-600 mt-1">60+ יום ללא תמונה</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-600">{over30.length}</div>
          <div className="text-sm text-gray-600 mt-1">30–60 יום ללא תמונה</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-600">{recent.length}</div>
          <div className="text-sm text-gray-600 mt-1">פורסמו ב-30 הימים האחרונים</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600">שם דייר</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">קבוצת דיור</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">תמונה אחרונה</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">מצב</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">סה"כ פרסומים</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">פעולה מהירה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {residents.map((r) => {
              const days = daysSince(r.last_photo);
              return (
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
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${daysColor(days, 30, 60)}`}>
                      {r.last_photo ? daysText(days) : 'לא פורסם'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{r.total_photos}</td>
                  <td className="px-4 py-3 text-center">
                    <PhotoQuickLog residentId={r.id} residentName={r.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
