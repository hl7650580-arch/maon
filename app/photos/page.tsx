export const dynamic = 'force-dynamic';

import sql from '@/lib/db';
import { daysSince } from '@/lib/utils';
import PhotosTable from './PhotosTable';

export default async function PhotosPage() {
  const residents = await sql`
    SELECT r.id, r.name, r.housing_group, r.employment_group,
      r.photo_permission,
      MAX(p.published_date) as last_photo,
      COUNT(p.id) as total_photos
    FROM residents r
    LEFT JOIN photos p ON r.id = p.resident_id
    WHERE r.is_active = 1
    GROUP BY r.id, r.name, r.housing_group, r.employment_group, r.photo_permission
    ORDER BY MAX(p.published_date) ASC NULLS FIRST, r.name ASC
  ` as {
    id: number; name: string; housing_group: string; employment_group: string;
    photo_permission: string | null; last_photo: string | null; total_photos: number;
  }[];

  const neverPublished = residents.filter((r) => !r.last_photo).length;
  const over60  = residents.filter((r) => r.last_photo && (daysSince(r.last_photo) ?? 0) > 60).length;
  const over30  = residents.filter((r) => r.last_photo && (daysSince(r.last_photo) ?? 0) > 30 && (daysSince(r.last_photo) ?? 0) <= 60).length;
  const recent  = residents.filter((r) => r.last_photo && (daysSince(r.last_photo) ?? 0) <= 30).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📸 מעקב פרסום תמונות</h1>
        <p className="text-gray-500 text-sm mt-1">מטרה: לפרסם תמונה לכל דייר לפחות אחת ל-30 יום</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-600">{neverPublished}</div>
          <div className="text-sm text-gray-600 mt-1">לא פורסמו מעולם</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-600">{over60}</div>
          <div className="text-sm text-gray-600 mt-1">60+ יום ללא תמונה</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-600">{over30}</div>
          <div className="text-sm text-gray-600 mt-1">30–60 יום ללא תמונה</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-600">{recent}</div>
          <div className="text-sm text-gray-600 mt-1">פורסמו ב-30 הימים האחרונים</div>
        </div>
      </div>

      <PhotosTable residents={residents} />
    </div>
  );
}
