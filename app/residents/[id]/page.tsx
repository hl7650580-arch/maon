export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import ResidentDetail from './ResidentDetail';

function str(v: any): string { return v == null ? '' : String(v); }

export default async function ResidentPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const rows = await sql`SELECT * FROM residents WHERE id = ${id}`;
  if (!rows[0]) notFound();

  const r0 = rows[0] as any;
  const resident = {
    id: r0.id as number,
    name: str(r0.name),
    id_number: str(r0.id_number),
    birth_date: str(r0.birth_date),
    gender: str(r0.gender),
    housing_group: str(r0.housing_group),
    employment_group: str(r0.employment_group),
    health_fund: str(r0.health_fund),
    notes: str(r0.notes),
    is_active: r0.is_active as number,
    created_at: str(r0.created_at),
    updated_at: str(r0.updated_at),
  };

  const [guardians, tracking, photos, files, familyCalls, socialWorkerMeetings, functionalReports] = await Promise.all([
    sql`SELECT * FROM guardians WHERE resident_id = ${id} ORDER BY id`,
    sql`SELECT * FROM tracking_events WHERE resident_id = ${id} ORDER BY event_date DESC, id DESC`,
    sql`SELECT * FROM photos WHERE resident_id = ${id} ORDER BY published_date DESC, id DESC`,
    sql`SELECT * FROM resident_files WHERE resident_id = ${id} ORDER BY uploaded_at DESC`,
    sql`SELECT * FROM family_calls WHERE resident_id = ${id} ORDER BY call_date DESC, id DESC`,
    sql`SELECT * FROM social_worker_meetings WHERE resident_id = ${id} ORDER BY meeting_date DESC, id DESC`,
    sql`SELECT * FROM functional_reports WHERE resident_id = ${id} ORDER BY written_date DESC, id DESC`,
  ]);

  function mapRow(row: any) {
    const out: any = {};
    for (const k of Object.keys(row)) out[k] = row[k] instanceof Date ? row[k].toISOString() : row[k];
    return out;
  }

  return (
    <ResidentDetail
      resident={resident}
      guardians={(guardians as any[]).map(mapRow)}
      tracking={(tracking as any[]).map(mapRow)}
      photos={(photos as any[]).map(mapRow)}
      files={(files as any[]).map(mapRow)}
      familyCalls={(familyCalls as any[]).map(mapRow)}
      socialWorkerMeetings={(socialWorkerMeetings as any[]).map(mapRow)}
      functionalReports={(functionalReports as any[]).map(mapRow)}
    />
  );
}
