import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  // Try DB users first
  const rows = await sql`SELECT * FROM users WHERE username = ${username}` as { id: number; username: string; password_hash: string }[];

  if (rows.length > 0) {
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (valid) {
      const session = await getSession();
      session.isLoggedIn = true;
      (session as any).username = username;
      await session.save();
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 });
  }

  // Fallback to env vars (before DB migration)
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 });
}
