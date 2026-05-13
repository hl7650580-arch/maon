export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import getDb from '@/lib/db';
import ResidentDetail from './ResidentDetail';

export default function ResidentPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const id = parseInt(params.id);

  const resident = db.prepare('SELECT * FROM residents WHERE id = ? AND is_active = 1').get(id) as {
    id: number; name: string; id_number: string; birth_date: string; gender: string;
    housing_group: string; employment_group: string; health_fund: string; notes: string;
    created_at: string; updated_at: string;
  } | undefined;

  if (!resident) notFound();

  const guardians = db.prepare(
    'SELECT * FROM guardians WHERE resident_id = ? ORDER BY id'
  ).all(id) as {
    id: number; name: string; relationship: string; phone: string; email: string; address: string; notes: string;
  }[];

  const tracking = db.prepare(
    'SELECT * FROM tracking_events WHERE resident_id = ? ORDER BY event_date DESC, id DESC'
  ).all(id) as {
    id: number; event_type: string; event_date: string; notes: string; logged_by: string; created_at: string;
  }[];

  const photos = db.prepare(
    'SELECT * FROM photos WHERE resident_id = ? ORDER BY published_date DESC, id DESC'
  ).all(id) as {
    id: number; published_date: string; notes: string; created_at: string;
  }[];

  const files = db.prepare(
    'SELECT * FROM resident_files WHERE resident_id = ? ORDER BY uploaded_at DESC'
  ).all(id) as {
    id: number; filename: string; original_name: string; category: string; uploaded_at: string;
  }[];

  return (
    <ResidentDetail
      resident={resident}
      guardians={guardians}
      tracking={tracking}
      photos={photos}
      files={files}
    />
  );
}
