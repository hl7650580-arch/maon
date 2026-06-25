import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  return run();
}
export async function POST() {
  return run();
}

async function run() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS family_calls (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      call_date TEXT NOT NULL,
      call_time TEXT,
      notes TEXT,
      logged_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS social_worker_meetings (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      meeting_date TEXT NOT NULL,
      meeting_time TEXT,
      notes TEXT,
      logged_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS functional_reports (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      written_date TEXT NOT NULL,
      sent_date TEXT,
      sent_to TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`ALTER TABLE residents ADD COLUMN IF NOT EXISTS photo_permission TEXT`;

    return NextResponse.json({ ok: true, message: 'כל הטבלאות נוצרו בהצלחה' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
