'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createGuardian, updateGuardian, deleteGuardian,
  createTrackingEvent, deleteTrackingEvent,
  createPhoto, deletePhoto,
  deactivateResident,
} from '@/app/actions';
import { formatDate, daysSince, daysColor, daysText, todayStr, EVENT_TYPES } from '@/lib/utils';

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

const FILE_CATEGORIES = ['תוכנית אישית', 'ניהול סיכונים', 'דוח רפואי', 'מסמך משפטי', 'אחר'];

export default function ResidentDetail({
  resident, guardians, tracking, photos, files,
}: {
  resident: Resident;
  guardians: Guardian[];
  tracking: TrackingEvent[];
  photos: Photo[];
  files: ResidentFile[];
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'tracking' | 'photos' | 'files'>('info');
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

  const tabs = [
    { key: 'info',     label: 'פרטים אישיים' },
    { key: 'tracking', label: 'מעקב תאריכים' },
    { key: 'photos',   label: `תמונות (${photos.length})` },
    { key: 'files',    label: `קבצים (${localFiles.length})` },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/residents" className="text-gray-400 hover:text-gray-600 text-sm">
            ← רשימת דיירים
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{resident.name}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {resident.housing_group    && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">דיור: {resident.housing_group}</span>}
            {resident.employment_group && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">תעסוקה: {resident.employment_group}</span>}
            {resident.health_fund      && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">קופ"ח: {resident.health_fund}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/residents/${resident.id}/edit`}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
          >
            ✏️ ערוך פרטים
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as typeof activeTab); setOpenForm(null); }}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: פרטים אישיים ── */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Personal info card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">פרטים אישיים</h2>
              <Link href={`/residents/${resident.id}/edit`} className="text-blue-600 text-xs hover:underline">ערוך</Link>
            </div>
            <dl className="space-y-3">
              {[
                { label: 'שם מלא',          value: resident.name },
                { label: 'תעודת זהות',       value: resident.id_number },
                { label: 'תאריך לידה',       value: formatDate(resident.birth_date) },
                { label: 'מין',              value: resident.gender },
                { label: 'קבוצת דיור',       value: resident.housing_group },
                { label: 'קבוצת תעסוקה',     value: resident.employment_group },
                { label: 'קופת חולים',       value: resident.health_fund },
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
              <div>נוצר: {resident.created_at?.split(' ')[0]}</div>
              <div>עודכן: {resident.updated_at?.split(' ')[0]}</div>
            </div>
          </div>

          {/* Guardians card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">הורים / אפוטרופוסים</h2>
              <button
                onClick={() => setOpenForm(openForm === 'guardian_new' ? null : 'guardian_new')}
                className="text-sm text-blue-600 hover:underline"
              >
                + הוסף
              </button>
            </div>

            {openForm === 'guardian_new' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  runAction(() => createGuardian(resident.id, fd));
                  setOpenForm(null);
                }}
                className="bg-blue-50 rounded-lg p-4 mb-4 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">שם</label>
                    <input name="name" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">קשר</label>
                    <input name="relationship" placeholder="אמא / אבא / אפוטרופוס" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">טלפון</label>
                    <input name="phone" type="tel" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">אימייל</label>
                    <input name="email" type="email" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600 block mb-1">כתובת</label>
                    <input name="address" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600 block mb-1">הערות</label>
                    <input name="notes" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                  <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm hover:bg-white">ביטול</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {guardians.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">אין קשרי משפחה רשומים</p>
              )}
              {guardians.map((g) => (
                <div key={g.id} className="border border-gray-100 rounded-lg p-3">
                  {editingGuardianId === g.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        runAction(() => updateGuardian(g.id, resident.id, fd));
                        setEditingGuardianId(null);
                      }}
                      className="space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input name="name"         defaultValue={g.name}         placeholder="שם"      className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="relationship" defaultValue={g.relationship} placeholder="קשר"     className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="phone"        defaultValue={g.phone}        placeholder="טלפון"   className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="email"        defaultValue={g.email}        placeholder="אימייל"  className="border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="address"      defaultValue={g.address}      placeholder="כתובת"   className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input name="notes"        defaultValue={g.notes}        placeholder="הערות"   className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">שמור</button>
                        <button type="button" onClick={() => setEditingGuardianId(null)} className="text-gray-500 px-3 py-1 rounded text-xs hover:bg-gray-100">ביטול</button>
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
                          <button
                            onClick={() => {
                              if (confirm(`למחוק את ${g.name}?`)) {
                                runAction(() => deleteGuardian(g.id, resident.id));
                              }
                            }}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            מחק
                          </button>
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
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-gray-700 text-base">
                      {emoji} {label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {lastEvent
                        ? `עודכן: ${formatDate(lastEvent.event_date)}`
                        : 'לא נרשם עדיין'}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${daysColor(days, Math.floor(alertDays * 0.6), alertDays)}`}>
                    {daysText(days)}
                  </span>
                </div>

                {/* Add form */}
                {openForm === formKey ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      runAction(() => createTrackingEvent(resident.id, fd));
                      setOpenForm(null);
                    }}
                    className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2"
                  >
                    <input type="hidden" name="event_type" value={key} />
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">תאריך</label>
                      <input
                        name="event_date"
                        type="date"
                        defaultValue={todayStr()}
                        required
                        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">הערה קצרה (אופציונלי)</label>
                      <input name="notes" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">מי רשם</label>
                      <input name="logged_by" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
                        שמור
                      </button>
                      <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm hover:bg-white">
                        ביטול
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setOpenForm(formKey)}
                    className="w-full border border-dashed border-blue-300 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors mb-3"
                  >
                    + רשום עדכון
                  </button>
                )}

                {/* Events list */}
                {events.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {events.map((e) => (
                      <div
                        key={e.id}
                        className="flex justify-between items-start py-2 border-t border-gray-50 text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-700">{formatDate(e.event_date)}</span>
                          {e.logged_by && (
                            <span className="text-gray-400 text-xs mr-1.5">({e.logged_by})</span>
                          )}
                          {e.notes && (
                            <div className="text-gray-500 text-xs mt-0.5 truncate">{e.notes}</div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('למחוק רשומה זו?')) {
                              runAction(() => deleteTrackingEvent(e.id, resident.id));
                            }
                          }}
                          className="text-red-300 hover:text-red-500 text-xs mr-1 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {events.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-2">אין רשומות עדיין</p>
                )}
              </div>
            );
          })}
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
            <button
              onClick={() => setOpenForm(openForm === 'photo' ? null : 'photo')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              + רשום פרסום תמונה
            </button>
          </div>

          {openForm === 'photo' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                runAction(() => createPhoto(resident.id, fd));
                setOpenForm(null);
              }}
              className="bg-blue-50 rounded-lg p-4 mb-5 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">תאריך פרסום</label>
                  <input
                    name="published_date"
                    type="date"
                    defaultValue={todayStr()}
                    required
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">הערות (לאן פורסם?)</label>
                  <input
                    name="notes"
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full"
                    placeholder="ווטסאפ הורים / פייסבוק / ..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">שמור</button>
                <button type="button" onClick={() => setOpenForm(null)} className="text-gray-600 px-3 py-1.5 rounded text-sm hover:bg-white">ביטול</button>
              </div>
            </form>
          )}

          {photos.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">אין פרסומי תמונה רשומים</p>
          )}

          <div className="space-y-2">
            {photos.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <div>
                  <span className="font-medium text-gray-700 text-sm">{formatDate(p.published_date)}</span>
                  {p.notes && (
                    <span className="text-gray-500 text-xs mr-3">{p.notes}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm('למחוק רשומה זו?')) {
                      runAction(() => deletePhoto(p.id, resident.id));
                    }
                  }}
                  className="text-red-300 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: קבצים מצורפים ── */}
      {activeTab === 'files' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-semibold text-gray-700 text-base">📎 קבצים מצורפים</h2>
              <p className="text-xs text-gray-400 mt-0.5">PDF, Word, תמונות וכל קובץ אחר</p>
            </div>
          </div>

          {/* Upload form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">העלה קובץ חדש</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">קטגוריה</label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                >
                  {FILE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">בחר קובץ</label>
                <input
                  id="file-upload"
                  type="file"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                />
              </div>
            </div>
            <button
              disabled={uploadingFile}
              onClick={async () => {
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
                    const newFile: ResidentFile = {
                      id: Date.now(),
                      filename: '',
                      original_name: input.files[0].name,
                      category: fileCategory,
                      uploaded_at: new Date().toISOString(),
                    };
                    setLocalFiles((prev) => [newFile, ...prev]);
                    input.value = '';
                    router.refresh();
                  } else {
                    alert('שגיאה בהעלאה');
                  }
                } finally {
                  setUploadingFile(false);
                }
              }}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {uploadingFile ? 'מעלה...' : '📤 העלה קובץ'}
            </button>
          </div>

          {/* Files list */}
          {localFiles.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">אין קבצים מצורפים</p>
          ) : (
            <div className="space-y-2">
              {localFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">
                      {f.original_name.endsWith('.pdf') ? '📄' :
                       f.original_name.match(/\.(doc|docx)$/) ? '📝' :
                       f.original_name.match(/\.(xls|xlsx)$/) ? '📊' :
                       f.original_name.match(/\.(png|jpg|jpeg)$/) ? '🖼️' : '📎'}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{f.original_name}</div>
                      <div className="text-xs text-gray-400">
                        {f.category && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mr-2">{f.category}</span>}
                        {f.uploaded_at?.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <a
                      href={`/api/files/${f.id}`}
                      download
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      ⬇ הורד
                    </a>
                    <button
                      onClick={async () => {
                        if (!confirm('למחוק קובץ זה?')) return;
                        await fetch(`/api/files/${f.id}`, { method: 'DELETE' });
                        setLocalFiles((prev) => prev.filter((x) => x.id !== f.id));
                      }}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Danger zone */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            if (confirm(`האם למחוק את ${resident.name} מהמערכת? ניתן לשחזר בהמשך`)) {
              runAction(() => deactivateResident(resident.id));
            }
          }}
          className="text-red-400 hover:text-red-600 text-xs hover:underline"
        >
          הסר דייר מהמערכת
        </button>
      </div>
    </div>
  );
}
