import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, currentPassword, newPassword } = await request.json();
  if (!newPassword || newPassword.length < 4) return NextResponse.json({ error: 'סיסמה חייבת להיות לפחות 4 תווים' }, { status: 400 });

  const rows = await sql`SELECT * FROM users WHERE username = ${username}` as { id: number; password_hash: string }[];
  if (!rows.length) return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return NextResponse.json({ error: 'הסיסמה הנוכחית שגויה' }, { status: 401 });

  const hash = await bcrypt.hash(newPassword, 10);
  await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${rows[0].id}`;
  return NextResponse.json({ ok: true });
}
