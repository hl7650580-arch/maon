'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import getDb from '@/lib/db';

// ─── RESIDENTS ───────────────────────────────────────────────────────────────

export async function createResident(formData: FormData) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO residents (name, id_number, birth_date, gender, housing_group, employment_group, health_fund, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    formData.get('name') as string,
    formData.get('id_number') as string || null,
    formData.get('birth_date') as string || null,
    formData.get('gender') as string || null,
    formData.get('housing_group') as string || null,
    formData.get('employment_group') as string || null,
    formData.get('health_fund') as string || null,
    formData.get('notes') as string || null,
  );
  revalidatePath('/residents');
  redirect(`/residents/${result.lastInsertRowid}`);
}

export async function updateResident(id: number, formData: FormData) {
  const db = getDb();
  db.prepare(`
    UPDATE residents SET
      name = ?, id_number = ?, birth_date = ?, gender = ?,
      housing_group = ?, employment_group = ?, health_fund = ?, notes = ?,
      updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(
    formData.get('name') as string,
    formData.get('id_number') as string || null,
    formData.get('birth_date') as string || null,
    formData.get('gender') as string || null,
    formData.get('housing_group') as string || null,
    formData.get('employment_group') as string || null,
    formData.get('health_fund') as string || null,
    formData.get('notes') as string || null,
    id,
  );
  revalidatePath(`/residents/${id}`);
  revalidatePath('/residents');
  redirect(`/residents/${id}`);
}

export async function deactivateResident(id: number) {
  const db = getDb();
  db.prepare(`UPDATE residents SET is_active = 0, updated_at = datetime('now', 'localtime') WHERE id = ?`).run(id);
  revalidatePath('/residents');
  redirect('/residents');
}

// ─── GUARDIANS ───────────────────────────────────────────────────────────────

export async function createGuardian(residentId: number, formData: FormData) {
  const db = getDb();
  db.prepare(`
    INSERT INTO guardians (resident_id, name, relationship, phone, email, address, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    residentId,
    formData.get('name') as string || null,
    formData.get('relationship') as string || null,
    formData.get('phone') as string || null,
    formData.get('email') as string || null,
    formData.get('address') as string || null,
    formData.get('notes') as string || null,
  );
  revalidatePath(`/residents/${residentId}`);
}

export async function updateGuardian(id: number, residentId: number, formData: FormData) {
  const db = getDb();
  db.prepare(`
    UPDATE guardians SET name = ?, relationship = ?, phone = ?, email = ?, address = ?, notes = ?
    WHERE id = ?
  `).run(
    formData.get('name') as string || null,
    formData.get('relationship') as string || null,
    formData.get('phone') as string || null,
    formData.get('email') as string || null,
    formData.get('address') as string || null,
    formData.get('notes') as string || null,
    id,
  );
  revalidatePath(`/residents/${residentId}`);
}

export async function deleteGuardian(id: number, residentId: number) {
  const db = getDb();
  db.prepare('DELETE FROM guardians WHERE id = ?').run(id);
  revalidatePath(`/residents/${residentId}`);
}

// ─── TRACKING EVENTS ─────────────────────────────────────────────────────────

export async function createTrackingEvent(residentId: number, formData: FormData) {
  const db = getDb();
  db.prepare(`
    INSERT INTO tracking_events (resident_id, event_type, event_date, notes, logged_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    residentId,
    formData.get('event_type') as string,
    formData.get('event_date') as string,
    formData.get('notes') as string || null,
    formData.get('logged_by') as string || null,
  );
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

export async function deleteTrackingEvent(id: number, residentId: number) {
  const db = getDb();
  db.prepare('DELETE FROM tracking_events WHERE id = ?').run(id);
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

// ─── PHOTOS ──────────────────────────────────────────────────────────────────

export async function createPhoto(residentId: number, formData: FormData) {
  const db = getDb();
  db.prepare(`
    INSERT INTO photos (resident_id, published_date, notes)
    VALUES (?, ?, ?)
  `).run(
    residentId,
    formData.get('published_date') as string,
    formData.get('notes') as string || null,
  );
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/photos');
  revalidatePath('/');
}

export async function deletePhoto(id: number, residentId: number) {
  const db = getDb();
  db.prepare('DELETE FROM photos WHERE id = ?').run(id);
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/photos');
  revalidatePath('/');
}

// ─── BULK UPDATES ────────────────────────────────────────────────────────────

export async function bulkCreateTrackingEvents(
  residentIds: number[],
  eventType: string,
  eventDate: string,
  notes: string,
  loggedBy: string,
) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO tracking_events (resident_id, event_type, event_date, notes, logged_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const id of residentIds) {
    insert.run(id, eventType, eventDate, notes || null, loggedBy || null);
  }
  revalidatePath('/tracking');
  revalidatePath('/');
}

export async function bulkCreatePhotos(
  residentIds: number[],
  publishedDate: string,
  notes: string,
) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO photos (resident_id, published_date, notes)
    VALUES (?, ?, ?)
  `);
  for (const id of residentIds) {
    insert.run(id, publishedDate, notes || null);
  }
  revalidatePath('/photos');
  revalidatePath('/tracking');
  revalidatePath('/');
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

export async function createDocument(formData: FormData) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO group_documents (title, description, document_date, deadline)
    VALUES (?, ?, ?, ?)
  `).run(
    formData.get('title') as string,
    formData.get('description') as string || null,
    formData.get('document_date') as string || null,
    formData.get('deadline') as string || null,
  );

  const docId = result.lastInsertRowid;
  const residents = db.prepare('SELECT id FROM residents WHERE is_active = 1 ORDER BY name').all() as { id: number }[];
  const insertRecipient = db.prepare('INSERT INTO document_recipients (document_id, resident_id) VALUES (?, ?)');
  for (const r of residents) {
    insertRecipient.run(docId, r.id);
  }

  revalidatePath('/documents');
  redirect(`/documents/${docId}`);
}

export async function deleteDocument(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM group_documents WHERE id = ?').run(id);
  revalidatePath('/documents');
  redirect('/documents');
}

export async function toggleRecipientField(
  id: number,
  field: 'sent' | 'responded' | 'registered',
  currentValue: boolean,
  documentId: number,
) {
  const db = getDb();
  const newValue = currentValue ? 0 : 1;
  const dateField = field === 'sent' ? 'sent_date' : field === 'responded' ? 'response_date' : null;

  if (dateField) {
    db.prepare(`UPDATE document_recipients SET ${field} = ?, ${dateField} = ? WHERE id = ?`).run(
      newValue,
      newValue ? new Date().toISOString().split('T')[0] : null,
      id,
    );
  } else {
    db.prepare(`UPDATE document_recipients SET ${field} = ? WHERE id = ?`).run(newValue, id);
  }

  revalidatePath(`/documents/${documentId}`);
}

export async function updateRecipientNotes(id: number, notes: string, documentId: number) {
  const db = getDb();
  db.prepare('UPDATE document_recipients SET response_notes = ? WHERE id = ?').run(notes || null, id);
  revalidatePath(`/documents/${documentId}`);
}
