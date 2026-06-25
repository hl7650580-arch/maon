import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import sql from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const [file] = await sql`SELECT * FROM resident_files WHERE id = ${parseInt(params.id)}` as {
    id: number; resident_id: number; filename: string; original_name: string; blob_url: string | null;
  }[];

  if (!file) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });

  if (!file.blob_url) {
    return NextResponse.json({ error: 'הקובץ לא נמצא באחסון' }, { status: 404 });
  }

  const response = await fetch(file.blob_url);
  if (!response.ok) return NextResponse.json({ error: 'שגיאה בטעינת הקובץ' }, { status: 502 });

  const buffer = await response.arrayBuffer();
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
  const [file] = await sql`SELECT * FROM resident_files WHERE id = ${parseInt(params.id)}` as {
    id: number; blob_url: string | null;
  }[];

  if (!file) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });

  if (file.blob_url) {
    try { await del(file.blob_url); } catch { /* blob may already be gone */ }
  }

  await sql`DELETE FROM resident_files WHERE id = ${parseInt(params.id)}`;
  return NextResponse.json({ success: true });
}
