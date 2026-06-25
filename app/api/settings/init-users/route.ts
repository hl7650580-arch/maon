import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() { return POST(); }
export async function POST() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin';

  const existing = await sql`SELECT id FROM users WHERE username = ${adminUser}`;
  if (existing.length === 0) {
    const hash = await bcrypt.hash(adminPass, 10);
    await sql`INSERT INTO users (username, password_hash) VALUES (${adminUser}, ${hash})`;
  }

  return NextResponse.json({ ok: true });
}
