export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - date.getTime()) / 86400000);
}

export function daysColor(days: number | null, warnAt = 30, alertAt = 60): string {
  if (days === null) return 'bg-red-100 text-red-800 border-red-200';
  if (days > alertAt) return 'bg-red-100 text-red-800 border-red-200';
  if (days > warnAt) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-green-100 text-green-800 border-green-200';
}

export function daysRowColor(days: number | null, warnAt = 30, alertAt = 60): string {
  if (days === null) return 'bg-red-50';
  if (days > alertAt) return 'bg-red-50';
  if (days > warnAt) return 'bg-orange-50';
  return '';
}

export function daysText(days: number | null): string {
  if (days === null) return 'אף פעם';
  if (days === 0) return 'היום';
  if (days === 1) return 'אתמול';
  return `לפני ${days} ימים`;
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function isValidDate(d: string): boolean {
  const dt = new Date(d + 'T00:00:00');
  return !isNaN(dt.getTime()) && d.split('-')[0].length === 4;
}

export function parseFlexibleDate(input: string): string | null {
  if (!input) return null;
  input = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return isValidDate(input) ? input : null;

  // DD.MM.YYYY / DD/MM/YYYY / D.M.YYYY / D/M/YY etc.
  const sep = input.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})$/);
  if (sep) {
    let [, d, m, y] = sep;
    if (y.length === 2) y = (parseInt(y) <= 30 ? '20' : '19') + y;
    const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    if (isValidDate(date)) return date;
  }

  // DDMMYYYY (8 digits no separator)
  if (/^\d{8}$/.test(input)) {
    const date = `${input.slice(4)}-${input.slice(2, 4)}-${input.slice(0, 2)}`;
    if (isValidDate(date)) return date;
  }

  return null;
}

export const HEALTH_FUNDS = ['כללית', 'מכבי', 'מאוחדת', 'לאומית'];

export const GENDER_OPTIONS = ['זכר', 'נקבה'];

export const HOUSING_GROUPS = ['קומה 2', 'קומה 3', 'קומה 4', 'קומה 5'];

export const EMPLOYMENT_GROUPS = ['בנים א', 'בנים ב', 'בנות א', 'בנות ב'];

export const EVENT_TYPES = [
  { key: 'personal_plan', label: 'תוכנית אישית', emoji: '📝', alertDays: 365 },
  { key: 'team_meeting', label: 'ישיבת צוות רב מקצועית', emoji: '👥', alertDays: 365 },
  { key: 'risk_management', label: 'ניהול סיכונים', emoji: '⚠️', alertDays: 365 },
  { key: 'conversation', label: 'שיחה אישית', emoji: '💬', alertDays: 30 },
];
