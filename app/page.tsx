export const dynamic = 'force-dynamic';

import Link from 'next/link';
import getDb from '@/lib/db';
import { formatDate, daysSince, daysColor, daysText, EVENT_TYPES } from '@/lib/utils';

function getDashboardData() {
  const db = getDb();

  const totalResidents = (
    db.prepare('SELECT COUNT(*) as count FROM residents WHERE is_active = 1').get() as { count: number }
  ).count;

  const noRecentPhoto = db.prepare(`
    SELECT r.id, r.name, MAX(p.published_date) as last_photo
    FROM residents r
    LEFT JOIN photos p ON r.id = p.resident_id
    WHERE r.is_active = 1
    GROUP BY r.id
    HAVING last_photo IS NULL OR last_photo < date('now', '-30 days')
    ORDER BY last_photo ASC
  `).all() as { id: number; name: string; last_photo: string | null }[];

  const trackingSummary = db.prepare(`
    WITH latest AS (
      SELECT resident_id, event_type, MAX(event_date) as last_date
      FROM tracking_events
      GROUP BY resident_id, event_type
    )
    SELECT r.id, r.name,
      MAX(CASE WHEN l.event_type = 'personal_plan'   THEN l.last_date END) as last_plan,
      MAX(CASE WHEN l.event_type = 'team_meeting'    THEN l.last_date END) as last_meeting,
      MAX(CASE WHEN l.event_type = 'risk_management' THEN l.last_date END) as last_risk,
      MAX(CASE WHEN l.event_type = 'conversation'    THEN l.last_date END) as last_conversation
    FROM residents r
    LEFT JOIN latest l ON r.id = l.resident_id
    WHERE r.is_active = 1
    GROUP BY r.id
  `).all() as {
    id: number; name: string;
    last_plan: string | null; last_meeting: string | null;
    last_risk: string | null; last_conversation: string | null;
  }[];

  const recentActivity = db.prepare(`
    SELECT te.*, r.name as resident_name
    FROM tracking_events te
    JOIN residents r ON te.resident_id = r.id
    ORDER BY te.created_at DESC
    LIMIT 12
  `).all() as { id: number; resident_id: number; resident_name: string; event_type: string; event_date: string; notes: string; logged_by: string }[];

  const missingPlan     = trackingSummary.filter(r => !r.last_plan     || (daysSince(r.last_plan)     ?? 999) > 365).length;
  const missingMeeting  = trackingSummary.filter(r => !r.last_meeting  || (daysSince(r.last_meeting)  ?? 999) > 365).length;
  const missingRisk     = trackingSummary.filter(r => !r.last_risk     || (daysSince(r.last_risk)     ?? 999) > 90).length;
  const missingConvo    = trackingSummary.filter(r => !r.last_conversation || (daysSince(r.last_conversation) ?? 999) > 30).length;

  return { totalResidents, noRecentPhoto, recentActivity, missingPlan, missingMeeting, missingRisk, missingConvo };
}

const EVENT_LABEL: Record<string, string> = {
  personal_plan: 'תוכנית אישית',
  team_meeting: 'ישיבת צוות',
  risk_management: 'ניהול סיכונים',
  conversation: 'שיחה אישית',
};

export default function Dashboard() {
  const { totalResidents, noRecentPhoto, recentActivity, missingPlan, missingMeeting, missingRisk, missingConvo } =
    getDashboardData();

  const stats = [
    { label: 'דיירים פעילים', value: totalResidents, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'ללא תמונה 30+ יום', value: noRecentPhoto.length, color: noRecentPhoto.length > 0 ? 'text-orange-600' : 'text-green-600', bg: noRecentPhoto.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200' },
    { label: 'ללא תוכנית אישית שנה+', value: missingPlan, color: missingPlan > 0 ? 'text-red-600' : 'text-green-600', bg: missingPlan > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200' },
    { label: 'ללא ישיבת צוות שנה+', value: missingMeeting, color: missingMeeting > 0 ? 'text-red-600' : 'text-green-600', bg: missingMeeting > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200' },
    { label: 'ללא שיחה אישית 30+ יום', value: missingConvo, color: missingConvo > 0 ? 'text-orange-600' : 'text-green-600', bg: missingConvo > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200' },
    { label: 'ללא ניהול סיכונים 90+ יום', value: missingRisk, color: missingRisk > 0 ? 'text-red-600' : 'text-green-600', bg: missingRisk > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">דשבורד</h1>
        <p className="text-gray-500 text-sm mt-1">סיכום מצב המעון</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-600 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Photo alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">📸 דיירים ללא תמונה אחרונה</h2>
            <Link href="/photos" className="text-blue-600 text-sm hover:underline">
              לכל הדיירים ←
            </Link>
          </div>
          <div className="p-3">
            {noRecentPhoto.length === 0 ? (
              <p className="text-green-600 text-sm p-2">✓ כל הדיירים פורסמו בחודש האחרון</p>
            ) : (
              <div className="space-y-1">
                {noRecentPhoto.slice(0, 10).map((r) => {
                  const days = daysSince(r.last_photo);
                  return (
                    <Link
                      key={r.id}
                      href={`/residents/${r.id}`}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-800">{r.name}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${daysColor(days, 30, 60)}`}>
                        {r.last_photo ? daysText(days) : 'אף פעם'}
                      </span>
                    </Link>
                  );
                })}
                {noRecentPhoto.length > 10 && (
                  <Link href="/photos" className="block text-center text-blue-600 text-xs py-2 hover:underline">
                    ועוד {noRecentPhoto.length - 10} דיירים...
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">🕐 פעילות אחרונה</h2>
          </div>
          <div className="p-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-sm p-2">אין פעילות רשומה עדיין</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((a) => (
                  <Link
                    key={a.id}
                    href={`/residents/${a.resident_id}`}
                    className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800">{a.resident_name}</span>
                      <span className="text-xs text-gray-500 mr-2">— {EVENT_LABEL[a.event_type] ?? a.event_type}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(a.event_date)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 flex gap-3">
        <Link href="/residents/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          + הוסף דייר חדש
        </Link>
        <Link href="/documents/new"
          className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
          + מסמך לקבוצה
        </Link>
      </div>
    </div>
  );
}
