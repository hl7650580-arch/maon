import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new DatabaseSync(path.join(DATA_DIR, 'meon.db'));

  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS residents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      id_number TEXT,
      birth_date TEXT,
      gender TEXT,
      housing_group TEXT,
      employment_group TEXT,
      health_fund TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS guardians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      name TEXT,
      relationship TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tracking_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      notes TEXT,
      logged_by TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      published_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      document_date TEXT,
      deadline TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS resident_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      category TEXT,
      uploaded_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      resident_id INTEGER NOT NULL,
      sent INTEGER DEFAULT 0,
      sent_date TEXT,
      responded INTEGER DEFAULT 0,
      response_date TEXT,
      registered INTEGER DEFAULT 0,
      response_notes TEXT,
      FOREIGN KEY (document_id) REFERENCES group_documents(id) ON DELETE CASCADE,
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
    );
  `);

  _db = db;
  return db;
}

export default getDb;
