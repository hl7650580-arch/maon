export const dynamic = 'force-dynamic';

import getDb from '@/lib/db';
import BulkUpdate from './BulkUpdate';

function getData() {
  const db = getDb();

  const residents = db.prepare(`
    SELECT r.id, r.name, r.housing_group, r.employment_group,
      (SELECT MAX(event_date) FROM tracking_events WHERE resident_id = r.id AND event_type = 'personal_plan')   as last_plan,
      (SELECT MAX(event_date) FROM tracking_events WHERE resident_id = r.id AND event_type = 'team_meeting')    as last_meeting,
      (SELECT MAX(event_date) FROM tracking_events WHERE resident_id = r.id AND event_type = 'risk_management') as last_risk,
      (SELECT MAX(event_date) FROM tracking_events WHERE resident_id = r.id AND event_type = 'conversation')    as last_conversation,
      (SELECT MAX(published_date) FROM photos WHERE resident_id = r.id) as last_photo
    FROM residents r
    WHERE r.is_active = 1
    ORDER BY r.name
  `).all() as {
    id: number; name: string; housing_group: string; employment_group: string;
    last_plan: string | null; last_meeting: string | null; last_risk: string | null;
    last_conversation: string | null; last_photo: string | null;
  }[];

  return residents;
}

export default function BulkPage() {
  const residents = getData();
  return <BulkUpdate residents={residents} />;
}
