'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { createDocument } from '@/app/actions';
import { todayStr } from '@/lib/utils';

export default function NewDocumentPage() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createDocument(fd);
    });
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/documents" className="text-gray-400 hover:text-gray-600 text-sm">
          ← חזרה למסמכים
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">מסמך חדש לקבוצה</h1>
        <p className="text-gray-500 text-sm mt-1">
          המסמך יישלח לכל הדיירים הפעילים במערכת אוטומטית
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            כותרת המסמך <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder='למשל: "הרשמה לנופש קיץ 2026"'
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור / פרטים נוספים</label>
          <textarea
            name="description"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">תאריך המסמך</label>
            <input
              name="document_date"
              type="date"
              defaultValue={todayStr()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">תאריך יעד (דדליין)</label>
            <input
              name="deadline"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium transition-colors"
          >
            {isPending ? 'יוצר מסמך...' : 'צור מסמך'}
          </button>
          <Link
            href="/documents"
            className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            ביטול
          </Link>
        </div>
      </form>
    </div>
  );
}
