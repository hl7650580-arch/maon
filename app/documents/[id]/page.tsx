export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import DocumentDetail from './DocumentDetail';

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const [doc] = await sql`SELECT * FROM group_documents WHERE id = ${id}` as {
    id: number; title: string; description: string;
    document_date: string; deadline: string; created_at: string;
  }[];

  if (!doc) notFound();

  const recipients = await sql`
    SELECT dr.*, r.name as resident_name, r.housing_group, r.employment_group
    FROM document_recipients dr
    JOIN residents r ON dr.resident_id = r.id
    WHERE dr.document_id = ${id}
    ORDER BY r.name
  ` as {
    id: number; resident_id: number; resident_name: string;
    housing_group: string; employment_group: string;
    sent: number; sent_date: string | null;
    responded: number; response_date: string | null;
    registered: number; response_notes: string | null;
  }[];

  return <DocumentDetail doc={doc} recipients={recipients} />;
}
