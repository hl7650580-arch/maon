import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const count = await sql`SELECT COUNT(*) as c FROM users` as { c: number }[];
  if (Number(count[0].c) <= 1) return NextResponse.json({ error: 'לא ניתן למחוק את המשתמש האחרון' }, { status: 400 });
  await sql`DELETE FROM users WHERE id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
