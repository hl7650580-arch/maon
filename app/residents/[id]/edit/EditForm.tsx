'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { updateResident } from '@/app/actions';
import { HEALTH_FUNDS, GENDER_OPTIONS, HOUSING_GROUPS, EMPLOYMENT_GROUPS } from '@/lib/utils';

interface ResidentData {
  id: number; name: string; id_number: string; birth_date: string; gender: string;
  housing_group: string; employment_group: string; health_fund: string; notes: string;
}

export default function EditForm({ resident }: { resident: ResidentData }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateResident(resident.id, fd);
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/residents/${resident.id}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← חזרה לתיק האישי
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">עריכת פרטים — {resident.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              שם מלא <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              defaultValue={resident.name}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">תעודת זהות</label>
            <input
              name="id_number"
              defaultValue={resident.id_number ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">תאריך לידה</label>
            <input
              name="birth_date"
              type="date"
              defaultValue={resident.birth_date ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">מין</label>
            <select
              name="gender"
              defaultValue={resident.gender ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— בחר —</option>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">קופת חולים</label>
            <select
              name="health_fund"
              defaultValue={resident.health_fund ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— בחר —</option>
              {HEALTH_FUNDS.map((hf) => <option key={hf} value={hf}>{hf}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">קבוצת דיור</label>
            <select
              name="housing_group"
              defaultValue={resident.housing_group ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— בחר —</option>
              {HOUSING_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">קבוצת תעסוקה</label>
            <select
              name="employment_group"
              defaultValue={resident.employment_group ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— בחר —</option>
              {EMPLOYMENT_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">הערות</label>
            <textarea
              name="notes"
              defaultValue={resident.notes ?? ''}
              rows={3}
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
            {isPending ? 'שומר...' : 'שמור שינויים'}
          </button>
          <Link
            href={`/residents/${resident.id}`}
            className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            ביטול
          </Link>
        </div>
      </form>
    </div>
  );
}
