'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createGuardian, updateGuardian, deleteGuardian,
  createTrackingEvent, deleteTrackingEvent,
  createPhoto, deletePhoto,
  deactivateResident,
  createFamilyCall, deleteFamilyCall,
  createSocialWorkerMeeting, deleteSocialWorkerMeeting,
  createFunctionalReport, deleteFunctionalReport,
} from '@/app/actions';
import { formatDate, daysSince, daysColor, daysText, todayStr, nowTimeStr, EVENT_TYPES } from '@/lib/utils';
import FlexDateInput from '@/components/FlexDateInput';

interface Resident {
  id: number; name: string; id_number: string; birth_date: string; gender: string;
  housing_group: string; employment_group: string; health_fund: string; notes: string;
  created_at: string; updated_at: string;
}
interface Guardian {
  id: number; name: string; relationship: string; phone: string; email: string; address: string; notes: string;
}
interface TrackingEvent {
  id: number; event_type: string; event_date: string; notes: string; logged_by: string; created_at: string;
}
interface Photo {
  id: number; published_date: string; notes: string; created_at: string;
}
interface ResidentFile {
  id: number; filename: string; original_name: string; category: string; uploaded_at: string;
}
interface FamilyCall {
  id: number; call_date: string; call_time: string | null; notes: string | null; logged_by: string | null; created_at: string;
}
interface SocialWorkerMeeting {
  id: number; meeting_date: string; meeting_time: string | null; notes: string | null; logged_by: string | null; created_at: string;
}
interface FunctionalReport {
  id: number; written_date: string; sent_date: string | null; sent_to: string | null; notes: string | null; created_at: string;
}

const FILE_CATEGORIES = ['תוכנית אישית', 'ניהול סיכונים', 'דוח רפואי', 'מסמך משפטי', 'אחר'];

type Tab = 'info' | 'tracking' | 'family' | 'social' | 'reports' | 'photos' | 'files';

export default function ResidentDetail({
  resident, guardians, tracking, photos, files,
  familyCalls, socialWorkerMeetings, functionalReports,
}: {
  resident: Resident;
  guardians: Guardian[];
  tracking: TrackingEvent[];
  photos: Photo[];
  files: ResidentFile[];
  familyCalls: FamilyCall[];
  socialWorkerMeetings: SocialWorkerMeeting[];
  functionalReports: FunctionalReport[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [editingGuardianId, setEditingGuardianId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const trackingByType: Record<string, TrackingEvent[]> = {};
  for (const t of tracking) {
    if (!trackingByType[t.event_type]) trackingByType[t.event_type] = [];
    trackingByType[t.event_type].push(t);
  }

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileCategory, setFileCategory] = useState(FILE_CATEGORIES[0]);
  const [localFiles, setLocalFiles] = useState<ResidentFile[]>(files);

  const lastFamilyCall = familyCalls[0];
  const lastSocialMeeting = socialWorkerMeetings[0];
  const lastReport = functionalReports[0];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info',     label: 'פרטים אישיים' },
    { key: 'tracking', label: 'מעקב תאריכים' },
    { key: 'family',   label: `שיחות משפחה (${familyCalls.length})` },
    { key: 'social',   label: `עו"ס רשות (${socialWorkerMeetings.length})` },
    { key: 'reports',  label: `דוחות תפקודיים (${functionalReports.length})` },
    { key: 'photos',   label: `תמונות (${photos.length})` },
    { key: 'files',    label: `קבצים (${localFiles.length})` },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/residents" className="text-gray-400 hover:text-gray-600 text-sm">← רשימת דיירים</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{resident.name}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {resident.housing_group    && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">דיור: {resident.housing_group}</span>}
            {resident.employment_group && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">תעסוקה: {resident.employment_group}</span>}
            {resident.health_fund      && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">קופ&quot;ח: {resident.health_fund}</span>}
          </div>
        </div>
        <Link href={`/residents/${resident.id}/edit`}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors">
          ✏️ ערוך פרטים
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6 gap-0">
        {tabs.map((tab) => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setOpenForm(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: פרטים אישיים ── */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">פרטים אישיים</h2>
              <Link href={`/residents/${resident.id}/edit`} className="text-blue-600 text-xs hover:underline">ערוך</Link>
            </div>
            <dl className="space-y-3">
              {[
                { label: 'שם מלא',      value: resident.name },
                { label: 'תעודת זהות',   value: resident.id_number },
                { label: 'תאריך לידה',   value: formatDate(resident.birth_date) },
                { label: 'מין',          value: resident.gender },
                { label: 'קבוצת דיור',   value: resident.housing_group },
                { label: 'קבוצת תעסוקה', value: resident.employment_group },
                { label: 'קופת חולים',   value: resident.health_fund },
              ].map((item) => (
                <div key={item.label} className="flex justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <dt className="text-gray-500 text-sm">{item.label}</dt>
                  <dd className="text-gray-800 text-sm font-medium">{item.value || '—'}</dd>
                </div>
              ))}
            </dl>
            {resident.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">הערות</p>
                <p className="text-sm text-gray-700">{resident.notes}</p>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-0.5">
              <div>נוצר: {resident.created_at?.split('T')[0]}</div>
              <div>עודכן: {resident.updated_at?.split('T')[0]}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">הורים / אפוטרופוסים</h2>
              <button onClick={() => setOpenForm(openForm === 'guardian_new' ? null : 'guardian_new')}
                className="text-sm text-blue-600 hover:underline">+ הוסף</button>
            </div>

            {openForm === 'guardian_new' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                runAction(() => createGuardian(resident.id, new FormData(e.currentTarget)));
                setOpenForm(null);
              }} className="bg-blue-50 rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[['name','שם'],['relationship','קשר'],['phone','טלפון'],['email','אימייל']].map(([n,l]) => (
                    <div key={n}>
                      <label className="text-xs text-gray-600 block mb-1">{l}</label>
                      <input name={n} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                    </div>
                  ))}
                  {[['address','כתובת'],['notes','הערות']].map(([n,l]) => (
                    <div key={n} className="col-span-2">
                      <label className="text-xs text-gray-600 block mb-1">{l}</label>
                      <input name={n} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                  <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm">ביטול</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {guardians.length === 0 && <p className="text-gray-400 text-sm text-center py-4">אין קשרי משפחה רשומים</p>}
              {guardians.map((g) => (
                <div key={g.id} className="border border-gray-100 rounded-lg p-3">
                  {editingGuardianId === g.id ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      runAction(() => updateGuardian(g.id, resident.id, new FormData(e.currentTarget)));
                      setEditingGuardianId(null);
                    }} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input name="name" defaultValue={g.name} placeholder="שם" className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="relationship" defaultValue={g.relationship} placeholder="קשר" className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="phone" defaultValue={g.phone} placeholder="טלפון" className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="email" defaultValue={g.email} placeholder="אימייל" className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="address" defaultValue={g.address} placeholder="כתובת" className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="notes" defaultValue={g.notes} placeholder="הערות" className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">שמור</button>
                        <button type="button" onClick={() => setEditingGuardianId(null)} className="text-gray-500 px-3 py-1 rounded text-xs">ביטול</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{g.name || '—'}</div>
                          {g.relationship && <div className="text-gray-500 text-xs">{g.relationship}</div>}
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setEditingGuardianId(g.id)} className="text-blue-500 hover:text-blue-700 text-xs">ערוך</button>
                          <button onClick={() => { if (confirm(`למחוק את ${g.name}?`)) runAction(() => deleteGuardian(g.id, resident.id)); }}
                            className="text-red-400 hover:text-red-600 text-xs">מחק</button>
                        </div>
                      </div>
                      <div className="mt-2 space-y-0.5 text-xs text-gray-600">
                        {g.phone   && <div>📞 <a href={`tel:${g.phone}`} className="hover:underline">{g.phone}</a></div>}
                        {g.email   && <div>✉️ <a href={`mailto:${g.email}`} className="hover:underline">{g.email}</a></div>}
                        {g.address && <div>🏠 {g.address}</div>}
                        {g.notes   && <div className="text-gray-400 mt-1">{g.notes}</div>}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: מעקב תאריכים ── */}
      {activeTab === 'tracking' && (
        <div className="grid grid-cols-2 gap-5">
          {EVENT_TYPES.map(({ key, label, emoji, alertDays }) => {
            const events = trackingByType[key] || [];
            const lastEvent = events[0];
            const days = daysSince(lastEvent?.event_date);
            const formKey = `track_${key}`;
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-gray-700 text-base">{emoji} {label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {lastEvent ? `עודכן: ${formatDate(lastEvent.event_date)}` : 'לא נרשם עדיין'}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${daysColor(days, Math.floor(alertDays * 0.6), alertDays)}`}>
                    {daysText(days)}
                  </span>
                </div>

                {openForm === formKey ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    runAction(() => createTrackingEvent(resident.id, new FormData(e.currentTarget)));
                    setOpenForm(null);
                  }} className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2">
                    <input type="hidden" name="event_type" value={key} />
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">תאריך</label>
                      <FlexDateInput name="event_date" defaultValue={todayStr()} required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">הערה (אופציונלי)</label>
                      <input name="notes" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">מי רשם</label>
                      <input name="logged_by" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                      <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm">ביטול</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setOpenForm(formKey)}
                    className="w-full border border-dashed border-blue-300 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors mb-3">
                    + רשום עדכון
                  </button>
                )}

                {events.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {events.map((e) => (
                      <div key={e.id} className="flex justify-between items-start py-2 border-t border-gray-50 text-sm">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-700">{formatDate(e.event_date)}</span>
                          {e.logged_by && <span className="text-gray-400 text-xs mr-1.5">({e.logged_by})</span>}
                          {e.notes && <div className="text-gray-500 text-xs mt-0.5 truncate">{e.notes}</div>}
                        </div>
                        <button onClick={() => { if (confirm('למחוק?')) runAction(() => deleteTrackingEvent(e.id, resident.id)); }}
                          className="text-red-300 hover:text-red-500 text-xs mr-1 flex-shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {events.length === 0 && <p className="text-gray-400 text-xs text-center py-2">אין רשומות עדיין</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: שיחות משפחה ── */}
      {activeTab === 'family' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-gray-700 text-base">📞 שיחות עם משפחה</h2>
              {lastFamilyCall ? (
                <p className="text-sm text-gray-500 mt-1">
                  שיחה אחרונה: <strong>{formatDate(lastFamilyCall.call_date)}</strong>
                  {lastFamilyCall.call_time && <span className="mr-1 text-gray-400"> בשעה {lastFamilyCall.call_time}</span>}
                  {' '}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${daysColor(daysSince(lastFamilyCall.call_date), 30, 60)}`}>
                    {daysText(daysSince(lastFamilyCall.call_date))}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-orange-600 mt-1">⚠️ אין שיחות משפחה מתועדות</p>
              )}
            </div>
            <button onClick={() => setOpenForm(openForm === 'family' ? null : 'family')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              + תעד שיחה
            </button>
          </div>

          {openForm === 'family' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              runAction(() => createFamilyCall(resident.id, new FormData(e.currentTarget)));
              setOpenForm(null);
            }} className="bg-blue-50 rounded-lg p-4 mb-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">תאריך השיחה</label>
                  <FlexDateInput name="call_date" defaultValue={todayStr()} required />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">שעה</label>
                  <input name="call_time" type="time" defaultValue={nowTimeStr()}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">מי רשם</label>
                  <input name="logged_by" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-gray-600 block mb-1">סיכום השיחה</label>
                  <textarea name="notes" rows={2}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm">ביטול</button>
              </div>
            </form>
          )}

          {familyCalls.length === 0 && <p className="text-gray-400 text-sm text-center py-8">אין שיחות מתועדות</p>}
          <div className="space-y-2">
            {familyCalls.map((c) => (
              <div key={c.id} className="flex justify-between items-start py-3 px-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700 text-sm">{formatDate(c.call_date)}</span>
                    {c.call_time && <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">{c.call_time}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${daysColor(daysSince(c.call_date), 30, 60)}`}>
                      {daysText(daysSince(c.call_date))}
                    </span>
                    {c.logged_by && <span className="text-gray-400 text-xs">({c.logged_by})</span>}
                  </div>
                  {c.notes && <p className="text-gray-600 text-sm mt-1">{c.notes}</p>}
                </div>
                <button onClick={() => { if (confirm('למחוק?')) runAction(() => deleteFamilyCall(c.id, resident.id)); }}
                  className="text-red-300 hover:text-red-500 text-xs mr-2 flex-shrink-0">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: עו"ס רשות ── */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-gray-700 text-base">🏛️ מפגשים עם עו&quot;ס רשות</h2>
              {lastSocialMeeting ? (
                <p className="text-sm text-gray-500 mt-1">
                  מפגש אחרון: <strong>{formatDate(lastSocialMeeting.meeting_date)}</strong>
                  {lastSocialMeeting.meeting_time && <span className="mr-1 text-gray-400"> בשעה {lastSocialMeeting.meeting_time}</span>}
                  {' '}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${daysColor(daysSince(lastSocialMeeting.meeting_date), 60, 90)}`}>
                    {daysText(daysSince(lastSocialMeeting.meeting_date))}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-orange-600 mt-1">⚠️ אין מפגשים מתועדים</p>
              )}
            </div>
            <button onClick={() => setOpenForm(openForm === 'social' ? null : 'social')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              + תעד מפגש
            </button>
          </div>

          {openForm === 'social' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              runAction(() => createSocialWorkerMeeting(resident.id, new FormData(e.currentTarget)));
              setOpenForm(null);
            }} className="bg-blue-50 rounded-lg p-4 mb-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">תאריך המפגש</label>
                  <FlexDateInput name="meeting_date" defaultValue={todayStr()} required />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">שעה</label>
                  <input name="meeting_time" type="time" defaultValue={nowTimeStr()}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">מי רשם</label>
                  <input name="logged_by" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-gray-600 block mb-1">סיכום המפגש</label>
                  <textarea name="notes" rows={2}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm">ביטול</button>
              </div>
            </form>
          )}

          {socialWorkerMeetings.length === 0 && <p className="text-gray-400 text-sm text-center py-8">אין מפגשים מתועדים</p>}
          <div className="space-y-2">
            {socialWorkerMeetings.map((m) => (
              <div key={m.id} className="flex justify-between items-start py-3 px-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700 text-sm">{formatDate(m.meeting_date)}</span>
                    {m.meeting_time && <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">{m.meeting_time}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${daysColor(daysSince(m.meeting_date), 60, 90)}`}>
                      {daysText(daysSince(m.meeting_date))}
                    </span>
                    {m.logged_by && <span className="text-gray-400 text-xs">({m.logged_by})</span>}
                  </div>
                  {m.notes && <p className="text-gray-600 text-sm mt-1">{m.notes}</p>}
                </div>
                <button onClick={() => { if (confirm('למחוק?')) runAction(() => deleteSocialWorkerMeeting(m.id, resident.id)); }}
                  className="text-red-300 hover:text-red-500 text-xs mr-2 flex-shrink-0">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: דוחות תפקודיים ── */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-gray-700 text-base">📋 דוחות תפקודיים</h2>
              {lastReport ? (
                <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                  <div>נכתב לאחרונה: <strong>{formatDate(lastReport.written_date)}</strong>
                    {' '}<span className={`text-xs px-2 py-0.5 rounded-full border ${daysColor(daysSince(lastReport.written_date), 180, 365)}`}>
                      {daysText(daysSince(lastReport.written_date))}
                    </span>
                  </div>
                  {lastReport.sent_date && (
                    <div>נשלח לאחרונה: <strong>{formatDate(lastReport.sent_date)}</strong>
                      {lastReport.sent_to && <span className="text-gray-400 mr-1"> ← {lastReport.sent_to}</span>}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-orange-600 mt-1">⚠️ אין דוחות תפקודיים מתועדים</p>
              )}
            </div>
            <button onClick={() => setOpenForm(openForm === 'report' ? null : 'report')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              + תעד דוח
            </button>
          </div>

          {openForm === 'report' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              runAction(() => createFunctionalReport(resident.id, new FormData(e.currentTarget)));
              setOpenForm(null);
            }} className="bg-blue-50 rounded-lg p-4 mb-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">תאריך כתיבה</label>
                  <FlexDateInput name="written_date" defaultValue={todayStr()} required />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">תאריך שליחה (אופציונלי)</label>
                  <FlexDateInput name="sent_date" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">נשלח ל</label>
                  <input name="sent_to" placeholder="שם / גורם"
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-gray-600 block mb-1">הערות</label>
                  <textarea name="notes" rows={2}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm">ביטול</button>
              </div>
            </form>
          )}

          {functionalReports.length === 0 && <p className="text-gray-400 text-sm text-center py-8">אין דוחות מתועדים</p>}
          <div className="space-y-2">
            {functionalReports.map((r) => (
              <div key={r.id} className="flex justify-between items-start py-3 px-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-gray-700 text-sm">נכתב: {formatDate(r.written_date)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${daysColor(daysSince(r.written_date), 180, 365)}`}>
                      {daysText(daysSince(r.written_date))}
                    </span>
                    {r.sent_date && (
                      <span className="text-gray-600 text-xs">
                        | נשלח: {formatDate(r.sent_date)}
                        {r.sent_to && <span className="text-gray-400 mr-1"> → {r.sent_to}</span>}
                      </span>
                    )}
                  </div>
                  {r.notes && <p className="text-gray-600 text-sm mt-1">{r.notes}</p>}
                </div>
                <button onClick={() => { if (confirm('למחוק?')) runAction(() => deleteFunctionalReport(r.id, resident.id)); }}
                  className="text-red-300 hover:text-red-500 text-xs mr-2 flex-shrink-0">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: תמונות ── */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-gray-700 text-base">📸 מעקב פרסום תמונות</h2>
              {photos.length > 0 ? (
                <p className="text-sm text-gray-500 mt-1">
                  פורסם לאחרונה: <strong>{formatDate(photos[0].published_date)}</strong>
                  {' '}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${daysColor(daysSince(photos[0].published_date), 30, 60)}`}>
                    {daysText(daysSince(photos[0].published_date))}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-orange-600 mt-1">⚠️ לא פורסמה תמונה עדיין</p>
              )}
            </div>
            <button onClick={() => setOpenForm(openForm === 'photo' ? null : 'photo')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              + רשום פרסום תמונה
            </button>
          </div>

          {openForm === 'photo' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              runAction(() => createPhoto(resident.id, new FormData(e.currentTarget)));
              setOpenForm(null);
            }} className="bg-blue-50 rounded-lg p-4 mb-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">תאריך פרסום</label>
                  <FlexDateInput name="published_date" defaultValue={todayStr()} required />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">הערות (לאן פורסם?)</label>
                  <input name="notes" placeholder="ווטסאפ הורים / פייסבוק / ..."
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm">ביטול</button>
              </div>
            </form>
          )}

          {photos.length === 0 && <p className="text-gray-400 text-sm text-center py-8">אין פרסומי תמונה רשומים</p>}
          <div className="space-y-2">
            {photos.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-50 last:border-0">
                <div>
                  <span className="font-medium text-gray-700 text-sm">{formatDate(p.published_date)}</span>
                  {p.notes && <span className="text-gray-500 text-xs mr-3">{p.notes}</span>}
                </div>
                <button onClick={() => { if (confirm('למחוק?')) runAction(() => deletePhoto(p.id, resident.id)); }}
                  className="text-red-300 hover:text-red-500 text-sm">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: קבצים ── */}
      {activeTab === 'files' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-700 text-base">📎 קבצים מצורפים</h2>
            <p className="text-xs text-gray-400 mt-0.5">PDF, Word, תמונות — עד 10MB</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">העלה קובץ חדש</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">קטגוריה</label>
                <select value={fileCategory} onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                  {FILE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">בחר קובץ</label>
                <input id="file-upload" type="file"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" />
              </div>
            </div>
            <button disabled={uploadingFile} onClick={async () => {
              const input = document.getElementById('file-upload') as HTMLInputElement;
              if (!input?.files?.length) { alert('בחר קובץ תחילה'); return; }
              setUploadingFile(true);
              const fd = new FormData();
              fd.append('file', input.files[0]);
              fd.append('resident_id', resident.id.toString());
              fd.append('category', fileCategory);
              try {
                const res = await fetch('/api/files', { method: 'POST', body: fd });
                if (res.ok) {
                  setLocalFiles((prev) => [{
                    id: Date.now(), filename: '', original_name: input.files![0].name,
                    category: fileCategory, uploaded_at: new Date().toISOString(),
                  }, ...prev]);
                  input.value = '';
                  router.refresh();
                } else {
                  const d = await res.json();
                  alert(d.error || 'שגיאה בהעלאה');
                }
              } finally { setUploadingFile(false); }
            }}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {uploadingFile ? 'מעלה...' : '📤 העלה קובץ'}
            </button>
          </div>

          {localFiles.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">אין קבצים מצורפים</p>
          ) : (
            <div className="space-y-2">
              {localFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">
                      {f.original_name.endsWith('.pdf') ? '📄' :
                       f.original_name.match(/\.(doc|docx)$/) ? '📝' :
                       f.original_name.match(/\.(png|jpg|jpeg|webp)$/) ? '🖼️' : '📎'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{f.original_name}</div>
                      <div className="text-xs text-gray-400">
                        {f.category && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mr-2">{f.category}</span>}
                        {String(f.uploaded_at).split('T')[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <a href={`/api/files/${f.id}`} download className="text-blue-600 hover:text-blue-800 text-xs">⬇ הורד</a>
                    <button onClick={async () => {
                      if (!confirm('למחוק קובץ זה?')) return;
                      await fetch(`/api/files/${f.id}`, { method: 'DELETE' });
                      setLocalFiles((prev) => prev.filter((x) => x.id !== f.id));
                    }} className="text-red-400 hover:text-red-600 text-xs">מחק</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button onClick={() => {
          if (confirm(`האם למחוק את ${resident.name} מהמערכת?`)) {
            runAction(() => deactivateResident(resident.id));
          }
        }} className="text-red-400 hover:text-red-600 text-xs hover:underline">
          הסר דייר מהמערכת
        </button>
      </div>
    </div>
  );
}
