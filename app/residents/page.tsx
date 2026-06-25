export const dynamic = 'force-dynamic';

import Link from 'next/link';
import sql from '@/lib/db';
import ResidentTable from './ResidentTable';

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
      <ResidentTable residents={residents} />
    </div>
  );
}
