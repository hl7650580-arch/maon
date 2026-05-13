export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import getDb from '@/lib/db';
import EditForm from './EditForm';

export default function EditResidentPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const id = parseInt(params.id);
  const resident = db.prepare('SELECT * FROM residents WHERE id = ? AND is_active = 1').get(id) as {
    id: number; name: string; id_number: string; birth_date: string; gender: string;
    housing_group: string; employment_group: string; health_fund: string; notes: string;
  } | undefined;

  if (!resident) notFound();

  return <EditForm resident={resident} />;
}
