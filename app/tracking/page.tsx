export const dynamic = 'force-dynamic';

import getDb from '@/lib/db';
import TrackingMatrix from './TrackingMatrix';

function getData() {
  const db = getDb();

  const residents = db.prepare(`
    SELECT id, name, housing_group, employment_group
    FROM residents
    WHERE is_active = 1
    ORDER BY name
  `).all() as { id: number; name: string; housing_group: string; employment_group: string }[];

  const trackingRaw = db.prepare(`
    SELECT resident_id, event_type, MAX(event_date) as last_date
    FROM tracking_events
    GROUP BY resident_id, event_type
  `).all() as { resident_id: number; event_type: string; last_date: string }[];

  const photosRaw = db.prepare(`
    SELECT resident_id, MAX(published_date) as last_date
    FROM photos
    GROUP BY resident_id
  `).all() as { resident_id: number; last_date: string }[];

  // Build lookup maps
  const trackingMap: Record<string, Record<string, string>> = {};
  for (const t of trackingRaw) {
    if (!trackingMap[t.resident_id]) trackingMap[t.resident_id] = {};
    trackingMap[t.resident_id][t.event_type] = t.last_date;
  }

  const photoMap: Record<number, string> = {};
  for (const p of photosRaw) {
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
  }));

  return rows;
}

export default function TrackingPage() {
  const rows = getData();
  return <TrackingMatrix rows={rows} />;
}
