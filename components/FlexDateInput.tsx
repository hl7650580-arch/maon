'use client';

import { useState } from 'react';
import { parseFlexibleDate, formatDate } from '@/lib/utils';

interface Props {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}

export default function FlexDateInput({ name, defaultValue = '', required, placeholder = 'DD/MM/YYYY' }: Props) {
  const [raw, setRaw] = useState(defaultValue ? formatDate(defaultValue).replace(/\//g, '/') : '');
  const [touched, setTouched] = useState(false);

  const parsed = parseFlexibleDate(raw);
  const hasError = touched && raw !== '' && !parsed;

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setTouched(false); }}
        onBlur={() => setTouched(true)}
        required={required}
        className={`w-full border rounded px-2 py-1.5 text-sm ${
          hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
        dir="ltr"
      />
      <input type="hidden" name={name} value={parsed ?? ''} />
      {parsed && !hasError && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-500 text-xs pointer-events-none">
          ✓ {formatDate(parsed)}
        </span>
      )}
      {hasError && (
        <p className="text-red-500 text-xs mt-0.5">תאריך לא תקין — נסה DD/MM/YYYY</p>
      )}
    </div>
  );
}
