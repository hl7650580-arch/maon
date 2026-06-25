/**
 * מיגרציית נתונים מ-SQLite ל-Neon PostgreSQL
 * הרצה: node scripts/migrate-to-neon.mjs
 * דרושה משתנה סביבה: DATABASE_URL
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('❌ חסר DATABASE_URL');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const data = JSON.parse(readFileSync(join(__dirname, '../data/export.json'), 'utf-8'));

async function run() {
  console.log('🔧 יוצר טבלאות...');

  await sql`CREATE TABLE IF NOT EXISTS residents (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, id_number TEXT, birth_date TEXT,
    gender TEXT, housing_group TEXT, employment_group TEXT, health_fund TEXT,
    notes TEXT, is_active SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS guardians (
    id SERIAL PRIMARY KEY, resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    name TEXT, relationship TEXT, phone TEXT, email TEXT, address TEXT, notes TEXT
  )`;
  await sql`CREATE TABLE IF NOT EXISTS tracking_events (
    id SERIAL PRIMARY KEY, resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, event_date TEXT NOT NULL, notes TEXT, logged_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY, resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    published_date TEXT NOT NULL, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS group_documents (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    document_date TEXT, deadline TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS resident_files (
    id SERIAL PRIMARY KEY, resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    filename TEXT NOT NULL, original_name TEXT NOT NULL, category TEXT, blob_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS document_recipients (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES group_documents(id) ON DELETE CASCADE,
    resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    sent SMALLINT DEFAULT 0, sent_date TEXT,
    responded SMALLINT DEFAULT 0, response_date TEXT,
    registered SMALLINT DEFAULT 0, response_notes TEXT
  )`;

  console.log('✅ טבלאות נוצרו');

  // Residents
  if (data.residents.length) {
    console.log(`📥 מייבא ${data.residents.length} דיירים...`);
    for (const r of data.residents) {
      await sql`
        INSERT INTO residents (id, name, id_number, birth_date, gender, housing_group, employment_group, health_fund, notes, is_active)
        VALUES (${r.id}, ${r.name}, ${r.id_number||null}, ${r.birth_date||null}, ${r.gender||null},
          ${r.housing_group||null}, ${r.employment_group||null}, ${r.health_fund||null}, ${r.notes||null}, ${r.is_active??1})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    await sql`SELECT setval('residents_id_seq', (SELECT MAX(id) FROM residents))`;
    console.log(`  ✓ ${data.residents.length} דיירים`);
  }

  // Guardians
  if (data.guardians.length) {
    for (const g of data.guardians) {
      await sql`
        INSERT INTO guardians (id, resident_id, name, relationship, phone, email, address, notes)
        VALUES (${g.id}, ${g.resident_id}, ${g.name||null}, ${g.relationship||null}, ${g.phone||null}, ${g.email||null}, ${g.address||null}, ${g.notes||null})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    await sql`SELECT setval('guardians_id_seq', (SELECT MAX(id) FROM guardians))`;
    console.log(`  ✓ ${data.guardians.length} אפוטרופוסים`);
  }

  // Tracking events
  if (data.tracking_events.length) {
    console.log(`📥 מייבא ${data.tracking_events.length} אירועי מעקב...`);
    for (const t of data.tracking_events) {
      await sql`
        INSERT INTO tracking_events (id, resident_id, event_type, event_date, notes, logged_by)
        VALUES (${t.id}, ${t.resident_id}, ${t.event_type}, ${t.event_date}, ${t.notes||null}, ${t.logged_by||null})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    await sql`SELECT setval('tracking_events_id_seq', (SELECT MAX(id) FROM tracking_events))`;
    console.log(`  ✓ ${data.tracking_events.length} אירועים`);
  }

  // Photos
  if (data.photos.length) {
    console.log(`📥 מייבא ${data.photos.length} תמונות...`);
    for (const p of data.photos) {
      await sql`
        INSERT INTO photos (id, resident_id, published_date, notes)
        VALUES (${p.id}, ${p.resident_id}, ${p.published_date}, ${p.notes||null})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    await sql`SELECT setval('photos_id_seq', (SELECT MAX(id) FROM photos))`;
    console.log(`  ✓ ${data.photos.length} תמונות`);
  }

  // Create new tables (no data to migrate, they're new)
  await sql`CREATE TABLE IF NOT EXISTS family_calls (
    id SERIAL PRIMARY KEY, resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    call_date TEXT NOT NULL, call_time TEXT, notes TEXT, logged_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS social_worker_meetings (
    id SERIAL PRIMARY KEY, resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    meeting_date TEXT NOT NULL, meeting_time TEXT, notes TEXT, logged_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS functional_reports (
    id SERIAL PRIMARY KEY, resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    written_date TEXT NOT NULL, sent_date TEXT, sent_to TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log('  ✓ טבלאות חדשות נוצרו (שיחות משפחה, עו"ס, דוחות)');

  console.log('\n✅ מיגרציה הושלמה בהצלחה!');
}

run().catch((e) => { console.error('❌', e); process.exit(1); });
