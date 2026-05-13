'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleRecipientField, updateRecipientNotes, deleteDocument } from '@/app/actions';
import { formatDate } from '@/lib/utils';

interface Doc {
  id: number; title: string; description: string;
  document_date: string; deadline: string; created_at: string;
}
interface Recipient {
  id: number; resident_id: number; resident_name: string;
  housing_group: string; employment_group: string;
  sent: number; sent_date: string | null;
  responded: number; response_date: string | null;
  registered: number; response_notes: string | null;
}

export default function DocumentDetail({
  doc,
  recipients,
}: {
  doc: Doc;
  recipients: Recipient[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'not_sent' | 'not_responded' | 'not_registered'>('all');
  const router = useRouter();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  const sentCount       = recipients.filter((r) => r.sent).length;
  const respondedCount  = recipients.filter((r) => r.responded).length;
  const registeredCount = recipients.filter((r) => r.registered).length;
  const total = recipients.length;

  const filtered = recipients.filter((r) => {
    if (filter === 'not_sent')       return !r.sent;
    if (filter === 'not_responded')  return !r.responded;
    if (filter === 'not_registered') return !r.registered;
    return true;
  });

  function CheckBtn({
    recipientId,
    field,
    value,
  }: {
    recipientId: number;
    field: 'sent' | 'responded' | 'registered';
    value: boolean;
  }) {
    return (
      <button
        onClick={() => run(() => toggleRecipientField(recipientId, field, value, doc.id))}
        disabled={isPending}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
          value
            ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
            : 'border-gray-300 text-gray-300 hover:border-blue-400 hover:text-blue-400'
        }`}
      >
        {value ? '✓' : ''}
      </button>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/documents" className="text-gray-400 hover:text-gray-600 text-sm">
            ← מסמכים לקבוצה
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{doc.title}</h1>
          {doc.description && <p className="text-gray-500 text-sm mt-1">{doc.description}</p>}
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            {doc.document_date && <span>תאריך: {formatDate(doc.document_date)}</span>}
            {doc.deadline && <span className="text-orange-600 font-medium">דדליין: {formatDate(doc.deadline)}</span>}
            <span>נוצר: {doc.created_at?.split(' ')[0]}</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('למחוק מסמך זה לצמיתות?')) {
              run(() => deleteDocument(doc.id));
            }
          }}
          className="text-red-400 hover:text-red-600 text-xs hover:underline"
        >
          מחק מסמך
        </button>
      </div>

      {/* Progress summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'נשלח', count: sentCount,       color: 'blue',   filterKey: 'not_sent'       },
          { label: 'ענה / אישר', count: respondedCount,  color: 'green',  filterKey: 'not_responded'  },
          { label: 'נרשם', count: registeredCount, color: 'purple', filterKey: 'not_registered' },
        ].map(({ label, count, color, filterKey }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-2xl font-bold text-${color}-600`}>{count} / {total}</div>
                <div className="text-gray-600 text-sm mt-0.5">{label}</div>
              </div>
              <button
                onClick={() => setFilter(filter === filterKey as typeof filter ? 'all' : filterKey as typeof filter)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  filter === filterKey
                    ? `bg-${color}-600 text-white border-${color}-600`
                    : `border-${color}-300 text-${color}-600 hover:bg-${color}-100`
                }`}
              >
                {filter === filterKey ? 'הצג הכל' : 'חסרים'}
              </button>
            </div>
            <div className="mt-3 bg-white rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${color}-400 transition-all`}
                style={{ width: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filter label */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">
            מציג: {filter === 'not_sent' ? 'לא נשלח' : filter === 'not_responded' ? 'לא ענה' : 'לא נרשם'}
            {' '}({filtered.length})
          </span>
          <button onClick={() => setFilter('all')} className="text-xs text-blue-600 hover:underline">הצג הכל</button>
        </div>
      )}

      {/* Recipients table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600">שם דייר</th>
              <th className="text-right px-3 py-3 font-medium text-gray-600">קבוצה</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">נשלח</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">תאריך שליחה</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">ענה / אישר</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">תאריך אישור</th>
              <th className="text-center px-3 py-3 font-medium text-gray-600">נרשם</th>
              <th className="text-right px-3 py-3 font-medium text-gray-600">הערות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">אין תוצאות</td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${r.sent ? '' : 'bg-red-50/30'}`}>
                <td className="px-4 py-3">
                  <Link href={`/residents/${r.resident_id}`} className="font-medium text-blue-700 hover:underline">
                    {r.resident_name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-gray-500 text-xs">{r.housing_group || '—'}</td>
                <td className="px-3 py-3 text-center">
                  <CheckBtn recipientId={r.id} field="sent" value={!!r.sent} />
                </td>
                <td className="px-3 py-3 text-center text-xs text-gray-500">
                  {r.sent_date ? formatDate(r.sent_date) : '—'}
                </td>
                <td className="px-3 py-3 text-center">
                  <CheckBtn recipientId={r.id} field="responded" value={!!r.responded} />
                </td>
                <td className="px-3 py-3 text-center text-xs text-gray-500">
                  {r.response_date ? formatDate(r.response_date) : '—'}
                </td>
                <td className="px-3 py-3 text-center">
                  <CheckBtn recipientId={r.id} field="registered" value={!!r.registered} />
                </td>
                <td className="px-3 py-3">
                  {editingNotes === r.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        run(() => updateRecipientNotes(r.id, notesValue, doc.id));
                        setEditingNotes(null);
                      }}
                      className="flex gap-1"
                    >
                      <input
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-0.5 text-xs flex-1 min-w-0"
                        autoFocus
                      />
                      <button type="submit" className="text-green-600 text-xs px-1">✓</button>
                      <button type="button" onClick={() => setEditingNotes(null)} className="text-gray-400 text-xs px-1">✕</button>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNotes(r.id);
                        setNotesValue(r.response_notes ?? '');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-800 text-right w-full"
                    >
                      {r.response_notes || <span className="text-gray-300">+ הוסף הערה</span>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick bulk actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => {
            if (confirm('לסמן את כולם כנשלח?')) {
              for (const r of recipients.filter((r) => !r.sent)) {
                run(() => toggleRecipientField(r.id, 'sent', false, doc.id));
              }
            }
          }}
          className="text-xs border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50"
        >
          סמן הכל כנשלח
        </button>
      </div>
    </div>
  );
}
