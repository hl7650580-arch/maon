import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { HEALTH_FUNDS, GENDER_OPTIONS, HOUSING_GROUPS, EMPLOYMENT_GROUPS } from '@/lib/utils';

export async function GET() {
  // Build example rows
  const data = [
    {
      'שם מלא (חובה)': 'ישראל ישראלי',
      'תעודת זהות': '123456789',
      'תאריך לידה (YYYY-MM-DD)': '1990-05-15',
      'מין': 'זכר',
      'קבוצת דיור': 'קומה 2',
      'קבוצת תעסוקה': 'בנים א',
      'קופת חולים': 'כללית',
      'הערות': '',
    },
    {
      'שם מלא (חובה)': 'שרה לוי',
      'תעודת זהות': '987654321',
      'תאריך לידה (YYYY-MM-DD)': '1985-11-20',
      'מין': 'נקבה',
      'קבוצת דיור': 'קומה 3',
      'קבוצת תעסוקה': 'בנות א',
      'קופת חולים': 'מכבי',
      'הערות': 'הערה לדוגמה',
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 20 }, { wch: 14 }, { wch: 22 }, { wch: 8 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 20 },
  ];

  // Add validation notes sheet
  const notes = [
    { 'שדה': 'מין',             'ערכים אפשריים': GENDER_OPTIONS.join(' / ') },
    { 'שדה': 'קבוצת דיור',      'ערכים אפשריים': HOUSING_GROUPS.join(' / ') },
    { 'שדה': 'קבוצת תעסוקה',    'ערכים אפשריים': EMPLOYMENT_GROUPS.join(' / ') },
    { 'שדה': 'קופת חולים',      'ערכים אפשריים': HEALTH_FUNDS.join(' / ') },
    { 'שדה': 'תאריך לידה',      'ערכים אפשריים': 'פורמט: YYYY-MM-DD (לדוגמה: 1990-05-15)' },
  ];
  const wsNotes = XLSX.utils.json_to_sheet(notes);
  wsNotes['!cols'] = [{ wch: 18 }, { wch: 45 }];

  XLSX.utils.book_append_sheet(wb, ws, 'דיירים');
  XLSX.utils.book_append_sheet(wb, wsNotes, 'הוראות');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Disposition': 'attachment; filename*=UTF-8\'\'%D7%AA%D7%91%D7%A0%D7%99%D7%AA_%D7%99%D7%99%D7%91%D7%95%D7%90.xlsx',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
