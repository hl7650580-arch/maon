import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '@/lib/db';
import { randomUUID } from 'crypto';
import path from 'path';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
  'image/webp',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const residentId = formData.get('resident_id') as string;
    const category = (formData.get('category') as string) || '';

    if (!file || !residentId) {
      return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'הקובץ גדול מדי (מקסימום 10MB)' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'סוג קובץ לא מורשה' }, { status: 400 });
    }

    const ext = path.extname(file.name);
    const blobName = `residents/${residentId}/${randomUUID()}${ext}`;
    const blob = await put(blobName, file, { access: 'public' });

    await sql`
      INSERT INTO resident_files (resident_id, filename, original_name, category, blob_url)
      VALUES (${parseInt(residentId)}, ${blobName}, ${file.name}, ${category}, ${blob.url})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'שגיאה בהעלאה' }, { status: 500 });
  }
}
