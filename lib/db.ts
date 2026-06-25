import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS residents (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      id_number TEXT,
      birth_date TEXT,
      gender TEXT,
      housing_group TEXT,
      employment_group TEXT,
      health_fund TEXT,
      notes TEXT,
      is_active SMALLINT DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS guardians (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      name TEXT,
      relationship TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      notes TEXT,
      logged_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      published_date TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS group_documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      document_date TEXT,
      deadline TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS resident_files (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      category TEXT,
      blob_url TEXT,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS document_recipients (
      id SERIAL PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES group_documents(id) ON DELETE CASCADE,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      sent SMALLINT DEFAULT 0,
      sent_date TEXT,
      responded SMALLINT DEFAULT 0,
      response_date TEXT,
      registered SMALLINT DEFAULT 0,
      response_notes TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS family_calls (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      call_date TEXT NOT NULL,
      call_time TEXT,
      notes TEXT,
      logged_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS social_worker_meetings (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      meeting_date TEXT NOT NULL,
      meeting_time TEXT,
      notes TEXT,
      logged_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS functional_reports (
      id SERIAL PRIMARY KEY,
      resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
      written_date TEXT NOT NULL,
      sent_date TEXT,
      sent_to TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export default sql;
