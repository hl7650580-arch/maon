'use client';

import { useState } from 'react';

const OPTIONS = ['פנימי', 'חיצוני', 'אין אישור'];

function badge(val: string | null) {
  if (val === 'פנימי')     return 'bg-blue-100 text-blue-700 border-blue-200';
  if (val === 'חיצוני')    return 'bg-green-100 text-green-700 border-green-200';
  if (val === 'אין אישור') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-400 border-gray-200';
}

export default function PhotoPermissionSelect({
  residentId,
  initial,
}: {
  residentId: number;
  initial: string | null;
}) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(newVal: string) {
    setSaving(true);
    setEditing(false);
    await fetch(`/api/residents/${residentId}/photo-permission`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_permission: newVal || null }),
    });
    setValue(newVal || null);
    setSaving(false);
  }

  if (editing) {
    return (
      <select
        autoFocus
        defaultValue={value || ''}
        onBlur={() => setEditing(false)}
        onChange={(e) => save(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-xs"
      >
        <option value="">-- בחר --</option>
        {OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      disabled={saving}
      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${badge(value)}`}
      title="לחץ לשינוי"
    >
      {saving ? '...' : (value || 'לא הוגדר')}
    </button>
  );
}
