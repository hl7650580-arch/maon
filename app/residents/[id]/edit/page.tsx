export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import EditForm from './EditForm';

export default async function EditResidentPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [resident] = await sql`SELECT * FROM residents WHERE id = ${id}` as {
    id: number; name: string; id_number: string; birth_date: string; gender: string;
    housing_group: string; employment_group: string; health_fund: string; notes: string;
  }[];

  if (!resident) notFound();

  return <EditForm resident={resident} />;
}
