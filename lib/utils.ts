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

export const HEALTH_FUNDS = ['כללית', 'מכבי', 'מאוחדת', 'לאומית'];

export const GENDER_OPTIONS = ['זכר', 'נקבה'];

export const HOUSING_GROUPS = ['קומה 2', 'קומה 3', 'קומה 4', 'קומה 5'];

export const EMPLOYMENT_GROUPS = ['בנים א', 'בנים ב', 'בנות א', 'בנות ב'];

export const EVENT_TYPES = [
  { key: 'personal_plan', label: 'תוכנית אישית', emoji: '📝', alertDays: 365 },
  { key: 'team_meeting', label: 'ישיבת צוות רב מקצועית', emoji: '👥', alertDays: 365 },
  { key: 'risk_management', label: 'ניהול סיכונים', emoji: '⚠️', alertDays: 90 },
  { key: 'conversation', label: 'שיחה אישית', emoji: '💬', alertDays: 30 },
];
