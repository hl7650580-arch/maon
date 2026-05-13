export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import getDb from '@/lib/db';
import { formatDate } from '@/lib/utils';
import DocumentDetail from './DocumentDetail';

export default function DocumentPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const id = parseInt(params.id);

  const doc = db.prepare('SELECT * FROM group_documents WHERE id = ?').get(id) as {
    id: number; title: string; description: string;
    document_date: string; deadline: string; created_at: string;
  } | undefined;

  if (!doc) notFound();

  const recipients = db.prepare(`
    SELECT dr.*, r.name as resident_name, r.housing_group, r.employment_group
    FROM document_recipients dr
    JOIN residents r ON dr.resident_id = r.id
    WHERE dr.document_id = ?
    ORDER BY r.name
  `).all(id) as {
    id: number; resident_id: number; resident_name: string;
    housing_group: string; employment_group: string;
    sent: number; sent_date: string | null;
    responded: number; response_date: string | null;
    registered: number; response_notes: string | null;
  }[];

  return <DocumentDetail doc={doc} recipients={recipients} />;
}
