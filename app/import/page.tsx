'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('file') as HTMLInputElement);
    if (!input.files?.length) { alert('בחר קובץ אקסל'); return; }

    setStatus('uploading');
    setResult(null);

    const fd = new FormData();
    fd.append('file', input.files[0]);

    try {
      const res = await fetch('/api/import-excel', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setStatus('done');
        router.refresh();
      } else {
        setResult({ added: 0, skipped: 0, errors: [data.error ?? 'שגיאה לא ידועה'] });
        setStatus('error');
      }
    } catch {
      setResult({ added: 0, skipped: 0, errors: ['שגיאת רשת'] });
      setStatus('error');
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/residents" className="text-gray-400 hover:text-gray-600 text-sm">← חזרה לדיירים</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">ייבוא דיירים מאקסל</h1>
      </div>

      {/* Step 1 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3">שלב 1 — הורד תבנית אקסל</h2>
        <p className="text-sm text-gray-500 mb-4">
          הורד את קובץ התבנית, מלא את פרטי הדיירים בעברית, ושמור.
        </p>
        <a
          href="/api/import-excel/template"
          download
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
        >
          📥 הורד תבנית אקסל
        </a>

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <div><strong>עמודות חובה:</strong> שם מלא</div>
          <div><strong>עמודות אופציונליות:</strong> ת.ז., תאריך לידה, מין, קבוצת דיור, קבוצת תעסוקה, קופת חולים, הערות</div>
          <div><strong>קבוצות דיור:</strong> קומה 2 / קומה 3 / קומה 4 / קומה 5</div>
          <div><strong>קבוצות תעסוקה:</strong> בנים א / בנים ב / בנות א / בנות ב</div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-700 mb-3">שלב 2 — העלה את הקובץ המלא</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="file"
              type="file"
              accept=".xlsx,.xls"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'uploading'}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium transition-colors"
          >
            {status === 'uploading' ? 'מייבא...' : '📤 יבא דיירים'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg ${status === 'done' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {status === 'done' && (
              <>
                <div className="font-semibold text-green-700 mb-2">✓ הייבוא הסתיים</div>
                <div className="text-sm text-green-600">
                  נוספו: <strong>{result.added}</strong> דיירים
                  {result.skipped > 0 && <span className="mr-3">דולגו: {result.skipped} שורות ריקות</span>}
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 space-y-0.5">
                    {result.errors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
                  </div>
                )}
                <Link href="/residents" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
                  ← עבור לרשימת הדיירים
                </Link>
              </>
            )}
            {status === 'error' && (
              <div className="text-red-700 text-sm">
                <div className="font-semibold mb-1">שגיאה בייבוא:</div>
                {result.errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
