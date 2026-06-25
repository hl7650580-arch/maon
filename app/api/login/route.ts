import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'שם משתמש או סיסמה שגויים' }, { status: 401 });
}
