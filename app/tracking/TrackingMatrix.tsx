'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createTrackingEvent, createPhoto } from '@/app/actions';
import { formatDate, daysSince, todayStr } from '@/lib/utils';

interface Row {
  id: number;
  name: string;
  housing_group: string;
  employment_group: string;
  personal_plan: string | null;
  team_meeting: string | null;
  risk_management: string | null;
  conversation: string | null;
  photo: string | null;
}

const COLUMNS = [
  { key: 'personal_plan',   label: 'תוכנית אישית',   warnAt: 270, alertAt: 365 },
  { key: 'team_meeting',    label: 'ישיבת צוות',      warnAt: 270, alertAt: 365 },
  { key: 'risk_management', label: 'ניהול סיכונים',   warnAt: 270, alertAt: 365 },
  { key: 'conversation',    label: 'שיחה אישית',      warnAt: 21,  alertAt: 45  },
  { key: 'photo',           label: 'תמונה',            warnAt: 21,  alertAt: 45  },
] as const;

type ColKey = typeof COLUMNS[number]['key'];

function cellBg(days: number | null, warnAt: number, alertAt: number): string {
  if (days === null)      return 'bg-red-100 hover:bg-red-200';
  if (days > alertAt)    return 'bg-red-100 hover:bg-red-200';
  if (days > warnAt)     return 'bg-orange-100 hover:bg-orange-200';
  return 'bg-green-100 hover:bg-green-200';
}

function cellText(days: number | null, warnAt: number, alertAt: number): string {
  if (days === null)      return 'text-red-700';
  if (days > alertAt)    return 'text-red-700';
  if (days > warnAt)     return 'text-orange-700';
  return 'text-green-700';
}

export default function TrackingMatrix({ rows }: { rows: Row[] }) {
  const [openCell, setOpenCell] = useState<{ residentId: number; col: ColKey } | null>(null);
  const [loggedBy, setLoggedBy] = useState('');
  const [eventDate, setEventDate] = useState(todayStr());
  const [notes, setNotes] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const groups = Array.from(new Set(rows.map((r) => r.housing_group).filter(Boolean))).sort();

  const filtered = filterGroup ? rows.filter((r) => r.housing_group === filterGroup) : rows;

  function openForm(residentId: number, col: ColKey) {
    setOpenCell({ residentId, col });
    setEventDate(todayStr());
    setNotes('');
  }

  function closeForm() {
    setOpenCell(null);
    setNotes('');
  }

  async function submitForm() {
    if (!openCell) return;
    setIsPending(true);
    try {
      if (openCell.col === 'photo') {
        const fd = new FormData();
        fd.append('published_date', eventDate);
        fd.append('notes', notes);
        await createPhoto(openCell.residentId, fd);
      } else {
        const res = await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resident_id: openCell.residentId,
            event_type: openCell.col,
            event_date: eventDate,
            notes,
            logged_by: loggedBy,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || `שגיאת שרת ${res.status}`);
        }
      }
      closeForm();
      window.location.href = '/tracking?t=' + Date.now();
    } catch (e: any) {
      alert('שגיאה בשמירה: ' + (e?.message || e));
      setIsPending(false);
    }
  }

  // Stats for the summary row
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">מעקב תאריכים</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length} דיירים · לחץ על תא לרישום עדכון
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Group filter */}
          {groups.length > 0 && (
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">כל הקבוצות</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          {/* Who am I */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">מי רושם:</label>
            <input
              value={loggedBy}
              onChange={(e) => setLoggedBy(e.target.value)}
              placeholder="שמך"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block"></span> עדכני</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-200 inline-block"></span> דורש תשומת לב</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 inline-block"></span> דחוף / לא עודכן</span>
      </div>

      {/* Inline form popup */}
      {openCell && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={closeForm}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-80" onClick={(e) => e.stopPropagation()}>
            <div className="font-semibold text-gray-800 mb-1">
              {rows.find((r) => r.id === openCell.residentId)?.name}
            </div>
            <div className="text-sm text-blue-600 mb-4">
              {COLUMNS.find((c) => c.key === openCell.col)?.label}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">תאריך</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">הערה קצרה (אופציונלי)</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="הערה..."
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={submitForm}
                disabled={isPending}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? 'שומר...' : 'שמור עדכון'}
              </button>
              <button
                onClick={closeForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matrix table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm" style={{overflow:'auto', maxHeight:'75vh'}}>
        <table className="w-full text-sm" style={{minWidth:'700px'}}>
          <thead className="bg-gray-50 border-b border-gray-200 z-20" style={{position:'sticky', top: 0}}>
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600 sticky right-0 bg-gray-50 z-30 border-l border-gray-200 min-w-36">
                שם דייר
              </th>
              <th className="text-right px-3 py-3 font-medium text-gray-500 min-w-24 bg-gray-50">קבוצה</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-center px-3 py-3 font-medium text-gray-600 min-w-28 bg-gray-50">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="text-center py-10 text-gray-400">
                  אין דיירים
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Name - sticky */}
                <td className="px-4 py-2 sticky right-0 bg-white border-l border-gray-100 z-10">
                  <Link
                    href={`/residents/${r.id}`}
                    className="font-medium text-blue-700 hover:underline text-sm"
                  >
                    {r.name}
                  </Link>
                </td>

                {/* Group */}
                <td className="px-3 py-2 text-gray-400 text-xs">{r.housing_group || '—'}</td>

                {/* Tracking cells */}
                {COLUMNS.map((col) => {
                  const dateStr = r[col.key];
                  const days = daysSince(dateStr);
                  const isOpen = openCell?.residentId === r.id && openCell?.col === col.key;

                  return (
                    <td key={col.key} className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => openForm(r.id, col.key)}
                        className={`w-full rounded-lg py-2 px-1 transition-colors cursor-pointer ${cellBg(days, col.warnAt, col.alertAt)} ${isOpen ? 'ring-2 ring-blue-400' : ''}`}
                        title={dateStr ? `עדכון אחרון: ${formatDate(dateStr)}` : 'לא עודכן — לחץ לרישום'}
                      >
                        {dateStr ? (
                          <>
                            <div className={`font-medium text-xs ${cellText(days, col.warnAt, col.alertAt)}`}>
                              {formatDate(dateStr)}
                            </div>
                            <div className={`text-xs mt-0.5 ${cellText(days, col.warnAt, col.alertAt)} opacity-75`}>
                              {days === 0 ? 'היום' : days === 1 ? 'אתמול' : `${days} ימים`}
                            </div>
                          </>
                        ) : (
                          <div className="text-red-600 text-xs font-medium">לא עודכן</div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="mt-4 grid grid-cols-5 gap-3">
        {COLUMNS.map((col) => {
          const never  = filtered.filter((r) => !r[col.key]).length;
          const urgent = filtered.filter((r) => {
            const d = daysSince(r[col.key]);
            return d !== null && d > col.alertAt;
          }).length;
          const warn = filtered.filter((r) => {
            const d = daysSince(r[col.key]);
            return d !== null && d > col.warnAt && d <= col.alertAt;
          }).length;
          const ok = filtered.length - never - urgent - warn;

          return (
            <div key={col.key} className="bg-white rounded-lg border border-gray-200 p-3 text-xs">
              <div className="font-medium text-gray-700 mb-2">{col.label}</div>
              <div className="space-y-1">
                {never  > 0 && <div className="flex justify-between"><span className="text-red-600">לא עודכן</span><span className="font-medium text-red-600">{never}</span></div>}
                {urgent > 0 && <div className="flex justify-between"><span className="text-orange-600">דחוף</span><span className="font-medium text-orange-600">{urgent}</span></div>}
                {warn   > 0 && <div className="flex justify-between"><span className="text-yellow-600">תשומת לב</span><span className="font-medium text-yellow-600">{warn}</span></div>}
                <div className="flex justify-between"><span className="text-green-600">עדכני</span><span className="font-medium text-green-600">{ok}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
