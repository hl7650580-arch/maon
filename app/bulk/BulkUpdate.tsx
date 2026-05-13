'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { bulkCreateTrackingEvents, bulkCreatePhotos } from '@/app/actions';
import { formatDate, daysSince, todayStr, HOUSING_GROUPS, EMPLOYMENT_GROUPS } from '@/lib/utils';

const CATEGORIES = [
  { key: 'team_meeting',    label: 'ישיבת צוות רב מקצועית', emoji: '👥', isPhoto: false },
  { key: 'photo',           label: 'פרסום תמונה',            emoji: '📸', isPhoto: true  },
  { key: 'personal_plan',   label: 'תוכנית אישית',           emoji: '📝', isPhoto: false },
  { key: 'risk_management', label: 'ניהול סיכונים',          emoji: '⚠️', isPhoto: false },
  { key: 'conversation',    label: 'שיחה אישית',             emoji: '💬', isPhoto: false },
];

interface Resident {
  id: number; name: string; housing_group: string; employment_group: string;
  last_plan: string | null; last_meeting: string | null; last_risk: string | null;
  last_conversation: string | null; last_photo: string | null;
}

function getLastDate(r: Resident, categoryKey: string): string | null {
  if (categoryKey === 'photo')           return r.last_photo;
  if (categoryKey === 'personal_plan')   return r.last_plan;
  if (categoryKey === 'team_meeting')    return r.last_meeting;
  if (categoryKey === 'risk_management') return r.last_risk;
  if (categoryKey === 'conversation')    return r.last_conversation;
  return null;
}

export default function BulkUpdate({ residents }: { residents: Resident[] }) {
  const [category, setCategory]     = useState(CATEGORIES[0].key);
  const [eventDate, setEventDate]   = useState(todayStr());
  const [notes, setNotes]           = useState('');
  const [loggedBy, setLoggedBy]     = useState('');
  const [selected, setSelected]     = useState<Set<number>>(new Set());
  const [filterGroup, setFilterGroup] = useState('');
  const [search, setSearch]         = useState('');
  const [done, setDone]             = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentCat = CATEGORIES.find((c) => c.key === category)!;

  const filtered = residents.filter((r) => {
    if (filterGroup && r.housing_group !== filterGroup) return false;
    if (search && !r.name.includes(search)) return false;
    return true;
  });

  function toggleAll() {
    if (filtered.every((r) => selected.has(r.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.add(r.id));
        return next;
      });
    }
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSubmit() {
    if (selected.size === 0) { alert('לא נבחרו דיירים'); return; }
    const ids = Array.from(selected);
    startTransition(async () => {
      if (currentCat.isPhoto) {
        await bulkCreatePhotos(ids, eventDate, notes);
      } else {
        await bulkCreateTrackingEvents(ids, category, eventDate, notes, loggedBy);
      }
      setDone(true);
      router.refresh();
    });
  }

  function reset() {
    setSelected(new Set());
    setNotes('');
    setDone(false);
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">נשמר בהצלחה!</h2>
        <p className="text-gray-500 mb-6">
          עודכנו <strong>{selected.size}</strong> דיירים — {currentCat.emoji} {currentCat.label}
          {' '}בתאריך <strong>{formatDate(eventDate)}</strong>
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            דיווח נוסף
          </button>
          <button
            onClick={() => router.push('/tracking')}
            className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            למעקב תאריכים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">דיווח מרוכז</h1>
        <p className="text-gray-500 text-sm mt-0.5">סמן דיירים ושמור הכל בבת אחת</p>
      </div>

      {/* Settings bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
        {/* Category */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-2">קטגוריה</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => { setCategory(c.key); setSelected(new Set()); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  category === c.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date + note + who */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">תאריך</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {!currentCat.isPhoto && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">מי רשם</label>
              <input
                value={loggedBy}
                onChange={(e) => setLoggedBy(e.target.value)}
                placeholder="שמך"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className={currentCat.isPhoto ? 'col-span-2' : ''}>
            <label className="text-xs text-gray-500 block mb-1">הערה (אופציונלי)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={currentCat.isPhoto ? 'לאן פורסם?' : 'הערה...'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Filters + select all */}
      <div className="flex items-center gap-3 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש שם..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל הקבוצות</option>
          {HOUSING_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <button
          onClick={toggleAll}
          className="text-sm text-blue-600 hover:underline"
        >
          {allFilteredSelected ? 'בטל בחירת הכל' : 'בחר הכל'}
        </button>

        <span className="text-sm text-gray-500 mr-auto">
          נבחרו: <strong>{selected.size}</strong> מתוך {residents.length}
        </span>
      </div>

      {/* Resident checklist */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          {filtered.map((r) => {
            const lastDate = getLastDate(r, category);
            const days = daysSince(lastDate);
            const isSelected = selected.has(r.id);

            return (
              <label
                key={r.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(r.id)}
                  className="w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                    {r.name}
                  </div>
                  <div className="text-xs text-gray-400">{r.housing_group || ''}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  {lastDate ? (
                    <>
                      <div className="text-xs text-gray-500">{formatDate(lastDate)}</div>
                      <div className={`text-xs ${
                        days === null ? 'text-red-500' :
                        days > 90    ? 'text-red-500' :
                        days > 30    ? 'text-orange-500' : 'text-green-600'
                      }`}>
                        {days === 0 ? 'היום' : `${days} ימים`}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-red-400">אף פעם</div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">אין דיירים</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={isPending || selected.size === 0}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors shadow-sm"
        >
          {isPending
            ? 'שומר...'
            : `✓ שמור עדכון ל-${selected.size} דיירים`}
        </button>
        {selected.size > 0 && (
          <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600 text-sm">
            נקה בחירה
          </button>
        )}
      </div>
    </div>
  );
}
