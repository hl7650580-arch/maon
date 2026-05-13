'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPhoto } from '@/app/actions';
import { todayStr } from '@/lib/utils';

export default function PhotoQuickLog({
  residentId,
  residentName,
}: {
  residentId: number;
  residentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createPhoto(residentId, fd);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
      >
        📸 רשום היום
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 justify-center" onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="published_date" value={todayStr()} />
      <input
        name="notes"
        placeholder="הערה..."
        className="border border-gray-300 rounded px-2 py-1 text-xs w-24"
        autoFocus
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-60"
      >
        ✓
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-gray-400 hover:text-gray-600 text-xs px-1"
      >
        ✕
      </button>
    </form>
  );
}
