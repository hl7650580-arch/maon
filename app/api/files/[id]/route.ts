import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import getDb from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const file = db.prepare('SELECT * FROM resident_files WHERE id = ?').get(parseInt(params.id)) as {
    id: number; resident_id: number; filename: string; original_name: string;
  } | undefined;

  if (!file) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });

  const filePath = path.join(process.cwd(), 'data', 'uploads', file.resident_id.toString(), file.filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'הקובץ לא נמצא בדיסק' }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const encoded = encodeURIComponent(file.original_name);

  return new NextResponse(buffer, {
    headers: {
      'Content-Disposition': `attachment; filename*=UTF-8''${encoded}`,
      'Content-Type': 'application/octet-stream',
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const file = db.prepare('SELECT * FROM resident_files WHERE id = ?').get(parseInt(params.id)) as {
    id: number; resident_id: number; filename: string;
  } | undefined;

  if (!file) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });

  const filePath = path.join(process.cwd(), 'data', 'uploads', file.resident_id.toString(), file.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM resident_files WHERE id = ?').run(parseInt(params.id));

  return NextResponse.json({ success: true });
}
