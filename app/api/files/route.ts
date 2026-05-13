import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const residentId = formData.get('resident_id') as string;
    const category = (formData.get('category') as string) || '';

    if (!file || !residentId) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const dir = path.join(process.cwd(), 'data', 'uploads', residentId);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), buffer);

    const db = getDb();
    db.prepare(
      'INSERT INTO resident_files (resident_id, filename, original_name, category) VALUES (?, ?, ?, ?)'
    ).run(parseInt(residentId), filename, file.name, category);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'שגיאה בהעלאה' }, { status: 500 });
  }
}
