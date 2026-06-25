export const dynamic = 'force-dynamic';

import sql from '@/lib/db';
import TrackingMatrix from './TrackingMatrix';

export default async function TrackingPage() {
  const [residentsRaw, trackingRaw, photosRaw] = await Promise.all([
    sql`SELECT id, name, housing_group, employment_group, photo_permission FROM residents WHERE is_active = 1 ORDER BY name`,
    sql`SELECT resident_id, event_type, MAX(event_date) as last_date FROM tracking_events GROUP BY resident_id, event_type`,
    sql`SELECT resident_id, MAX(published_date) as last_date FROM photos GROUP BY resident_id`,
  ]);

  const residents = residentsRaw as { id: number; name: string; housing_group: string; employment_group: string; photo_permission: string | null }[];
  const trackingEvents = trackingRaw as { resident_id: number; event_type: string; last_date: string }[];
  const photosData = photosRaw as { resident_id: number; last_date: string }[];

  const trackingMap: Record<string, Record<string, string>> = {};
  for (const t of trackingEvents) {
    if (!trackingMap[t.resident_id]) trackingMap[t.resident_id] = {};
    trackingMap[t.resident_id][t.event_type] = t.last_date;
  }
  const photoMap: Record<number, string> = {};
  for (const p of photosData) {
    photoMap[p.resident_id] = p.last_date;
  }

  const rows = residents.map((r) => ({
    id: r.id,
    name: r.name,
    housing_group: r.housing_group,
    employment_group: r.employment_group,
    personal_plan:   trackingMap[r.id]?.['personal_plan']   ?? null,
    team_meeting:    trackingMap[r.id]?.['team_meeting']     ?? null,
    risk_management: trackingMap[r.id]?.['risk_management']  ?? null,
    conversation:    trackingMap[r.id]?.['conversation']     ?? null,
    photo:           photoMap[r.id] ?? null,
    photo_permission: r.photo_permission ?? null,
  }));

  return <TrackingMatrix rows={rows} />;
}
