export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import ResidentDetail from './ResidentDetail';

export default async function ResidentPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const rows = await sql`SELECT * FROM residents WHERE id = ${id}`;
  const resident = rows[0] as {
    id: number; name: string; id_number: string; birth_date: string; gender: string;
    housing_group: string; employment_group: string; health_fund: string; notes: string;
    is_active: number; created_at: string; updated_at: string;
  } | undefined;

  if (!resident) notFound();

  const [guardians, tracking, photos, files, familyCalls, socialWorkerMeetings, functionalReports] = await Promise.all([
    sql`SELECT * FROM guardians WHERE resident_id = ${id} ORDER BY id`,
    sql`SELECT * FROM tracking_events WHERE resident_id = ${id} ORDER BY event_date DESC, id DESC`,
    sql`SELECT * FROM photos WHERE resident_id = ${id} ORDER BY published_date DESC, id DESC`,
    sql`SELECT * FROM resident_files WHERE resident_id = ${id} ORDER BY uploaded_at DESC`,
    sql`SELECT * FROM family_calls WHERE resident_id = ${id} ORDER BY call_date DESC, id DESC`,
    sql`SELECT * FROM social_worker_meetings WHERE resident_id = ${id} ORDER BY meeting_date DESC, id DESC`,
    sql`SELECT * FROM functional_reports WHERE resident_id = ${id} ORDER BY written_date DESC, id DESC`,
  ]);

  return (
    <ResidentDetail
      resident={resident}
      guardians={guardians as { id: number; name: string; relationship: string; phone: string; email: string; address: string; notes: string }[]}
      tracking={tracking as { id: number; event_type: string; event_date: string; notes: string; logged_by: string; created_at: string }[]}
      photos={photos as { id: number; published_date: string; notes: string; created_at: string }[]}
      files={files as { id: number; filename: string; original_name: string; category: string; uploaded_at: string }[]}
      familyCalls={familyCalls as { id: number; call_date: string; call_time: string | null; notes: string | null; logged_by: string | null; created_at: string }[]}
      socialWorkerMeetings={socialWorkerMeetings as { id: number; meeting_date: string; meeting_time: string | null; notes: string | null; logged_by: string | null; created_at: string }[]}
      functionalReports={functionalReports as { id: number; written_date: string; sent_date: string | null; sent_to: string | null; notes: string | null; created_at: string }[]}
    />
  );
}
