import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  const users = await sql`SELECT id, username, created_at FROM users ORDER BY id`;
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  if (!username || !password) return NextResponse.json({ error: 'חסר שם משתמש או סיסמה' }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  try {
    await sql`INSERT INTO users (username, password_hash) VALUES (${username}, ${hash})`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'שם משתמש כבר קיים' }, { status: 409 });
  }
}
