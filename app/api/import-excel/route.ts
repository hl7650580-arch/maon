import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'לא נשלח קובץ' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const wb = XLSX.read(bytes, { type: 'buffer', cellDates: true });

    const sheetName = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]) as Record<string, unknown>[];

    if (!rows.length) return NextResponse.json({ error: 'הקובץ ריק' }, { status: 400 });

    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO residents (name, id_number, birth_date, gender, housing_group, employment_group, health_fund, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const results = { added: 0, skipped: 0, errors: [] as string[] };

    for (const row of rows) {
      const name = String(row['שם מלא (חובה)'] ?? row['שם מלא'] ?? row['שם'] ?? '').trim();
      if (!name) { results.skipped++; continue; }

      // Parse date - handle Excel date number or string
      let birthDate: string | null = null;
      const rawDate = row['תאריך לידה (YYYY-MM-DD)'] ?? row['תאריך לידה'];
      if (rawDate) {
        if (rawDate instanceof Date) {
          birthDate = rawDate.toISOString().split('T')[0];
        } else if (typeof rawDate === 'number') {
          const d = XLSX.SSF.parse_date_code(rawDate);
          birthDate = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
        } else {
          birthDate = String(rawDate).trim() || null;
        }
      }

      try {
        insert.run(
          name,
          String(row['תעודת זהות'] ?? '').trim() || null,
          birthDate,
          String(row['מין'] ?? '').trim() || null,
          String(row['קבוצת דיור'] ?? '').trim() || null,
          String(row['קבוצת תעסוקה'] ?? '').trim() || null,
          String(row['קופת חולים'] ?? '').trim() || null,
          String(row['הערות'] ?? '').trim() || null,
        );
        results.added++;
      } catch (e: unknown) {
        results.errors.push(`${name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'שגיאה בעיבוד הקובץ' }, { status: 500 });
  }
}
