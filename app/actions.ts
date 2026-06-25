'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';

// ─── RESIDENTS ───────────────────────────────────────────────────────────────

export async function createResident(formData: FormData) {
  const [row] = await sql`
    INSERT INTO residents (name, id_number, birth_date, gender, housing_group, employment_group, health_fund, notes)
    VALUES (
      ${formData.get('name') as string},
      ${(formData.get('id_number') as string) || null},
      ${(formData.get('birth_date') as string) || null},
      ${(formData.get('gender') as string) || null},
      ${(formData.get('housing_group') as string) || null},
      ${(formData.get('employment_group') as string) || null},
      ${(formData.get('health_fund') as string) || null},
      ${(formData.get('notes') as string) || null}
    )
    RETURNING id
  `;
  revalidatePath('/residents');
  redirect(`/residents/${row.id}`);
}

export async function updateResident(id: number, formData: FormData) {
  await sql`
    UPDATE residents SET
      name = ${formData.get('name') as string},
      id_number = ${(formData.get('id_number') as string) || null},
      birth_date = ${(formData.get('birth_date') as string) || null},
      gender = ${(formData.get('gender') as string) || null},
      housing_group = ${(formData.get('housing_group') as string) || null},
      employment_group = ${(formData.get('employment_group') as string) || null},
      health_fund = ${(formData.get('health_fund') as string) || null},
      notes = ${(formData.get('notes') as string) || null},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  revalidatePath(`/residents/${id}`);
  revalidatePath('/residents');
  redirect(`/residents/${id}`);
}

export async function deactivateResident(id: number) {
  await sql`UPDATE residents SET is_active = 0, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath('/residents');
  redirect('/residents');
}

// ─── GUARDIANS ───────────────────────────────────────────────────────────────

export async function createGuardian(residentId: number, formData: FormData) {
  await sql`
    INSERT INTO guardians (resident_id, name, relationship, phone, email, address, notes)
    VALUES (
      ${residentId},
      ${(formData.get('name') as string) || null},
      ${(formData.get('relationship') as string) || null},
      ${(formData.get('phone') as string) || null},
      ${(formData.get('email') as string) || null},
      ${(formData.get('address') as string) || null},
      ${(formData.get('notes') as string) || null}
    )
  `;
  revalidatePath(`/residents/${residentId}`);
}

export async function updateGuardian(id: number, residentId: number, formData: FormData) {
  await sql`
    UPDATE guardians SET
      name = ${(formData.get('name') as string) || null},
      relationship = ${(formData.get('relationship') as string) || null},
      phone = ${(formData.get('phone') as string) || null},
      email = ${(formData.get('email') as string) || null},
      address = ${(formData.get('address') as string) || null},
      notes = ${(formData.get('notes') as string) || null}
    WHERE id = ${id}
  `;
  revalidatePath(`/residents/${residentId}`);
}

export async function deleteGuardian(id: number, residentId: number) {
  await sql`DELETE FROM guardians WHERE id = ${id}`;
  revalidatePath(`/residents/${residentId}`);
}

// ─── TRACKING EVENTS ─────────────────────────────────────────────────────────

export async function createTrackingEvent(residentId: number, formData: FormData) {
  await sql`
    INSERT INTO tracking_events (resident_id, event_type, event_date, notes, logged_by)
    VALUES (
      ${residentId},
      ${formData.get('event_type') as string},
      ${formData.get('event_date') as string},
      ${(formData.get('notes') as string) || null},
      ${(formData.get('logged_by') as string) || null}
    )
  `;
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

export async function deleteTrackingEvent(id: number, residentId: number) {
  await sql`DELETE FROM tracking_events WHERE id = ${id}`;
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

// ─── PHOTOS ──────────────────────────────────────────────────────────────────

export async function createPhoto(residentId: number, formData: FormData) {
  await sql`
    INSERT INTO photos (resident_id, published_date, notes)
    VALUES (
      ${residentId},
      ${formData.get('published_date') as string},
      ${(formData.get('notes') as string) || null}
    )
  `;
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/photos');
  revalidatePath('/');
}

export async function deletePhoto(id: number, residentId: number) {
  await sql`DELETE FROM photos WHERE id = ${id}`;
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
  const queries = residentIds.map((id) =>
    sql`INSERT INTO tracking_events (resident_id, event_type, event_date, notes, logged_by)
        VALUES (${id}, ${eventType}, ${eventDate}, ${notes || null}, ${loggedBy || null})`
  );
  await sql.transaction(queries);
  revalidatePath('/tracking');
  revalidatePath('/');
}

export async function bulkCreatePhotos(
  residentIds: number[],
  publishedDate: string,
  notes: string,
) {
  const queries = residentIds.map((id) =>
    sql`INSERT INTO photos (resident_id, published_date, notes)
        VALUES (${id}, ${publishedDate}, ${notes || null})`
  );
  await sql.transaction(queries);
  revalidatePath('/photos');
  revalidatePath('/tracking');
  revalidatePath('/');
}

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────

export async function createDocument(formData: FormData) {
  const [doc] = await sql`
    INSERT INTO group_documents (title, description, document_date, deadline)
    VALUES (
      ${formData.get('title') as string},
      ${(formData.get('description') as string) || null},
      ${(formData.get('document_date') as string) || null},
      ${(formData.get('deadline') as string) || null}
    )
    RETURNING id
  `;

  const residents = await sql`SELECT id FROM residents WHERE is_active = 1 ORDER BY name`;
  const queries = residents.map((r) =>
    sql`INSERT INTO document_recipients (document_id, resident_id) VALUES (${doc.id}, ${r.id})`
  );
  if (queries.length) await sql.transaction(queries);

  revalidatePath('/documents');
  redirect(`/documents/${doc.id}`);
}

export async function deleteDocument(id: number) {
  await sql`DELETE FROM group_documents WHERE id = ${id}`;
  revalidatePath('/documents');
  redirect('/documents');
}

export async function toggleRecipientField(
  id: number,
  field: 'sent' | 'responded' | 'registered',
  currentValue: boolean,
  documentId: number,
) {
  const newValue = currentValue ? 0 : 1;
  const dateField = field === 'sent' ? 'sent_date' : field === 'responded' ? 'response_date' : null;
  const today = newValue ? new Date().toISOString().split('T')[0] : null;

  if (field === 'sent') {
    await sql`UPDATE document_recipients SET sent = ${newValue}, sent_date = ${today} WHERE id = ${id}`;
  } else if (field === 'responded') {
    await sql`UPDATE document_recipients SET responded = ${newValue}, response_date = ${today} WHERE id = ${id}`;
  } else {
    await sql`UPDATE document_recipients SET registered = ${newValue} WHERE id = ${id}`;
  }

  revalidatePath(`/documents/${documentId}`);
}

export async function updateRecipientNotes(id: number, notes: string, documentId: number) {
  await sql`UPDATE document_recipients SET response_notes = ${notes || null} WHERE id = ${id}`;
  revalidatePath(`/documents/${documentId}`);
}

// ─── FAMILY CALLS ─────────────────────────────────────────────────────────────

export async function createFamilyCall(residentId: number, formData: FormData) {
  await sql`
    INSERT INTO family_calls (resident_id, call_date, call_time, notes, logged_by)
    VALUES (
      ${residentId},
      ${formData.get('call_date') as string},
      ${(formData.get('call_time') as string) || null},
      ${(formData.get('notes') as string) || null},
      ${(formData.get('logged_by') as string) || null}
    )
  `;
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

export async function deleteFamilyCall(id: number, residentId: number) {
  await sql`DELETE FROM family_calls WHERE id = ${id}`;
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

// ─── SOCIAL WORKER MEETINGS ───────────────────────────────────────────────────

export async function createSocialWorkerMeeting(residentId: number, formData: FormData) {
  await sql`
    INSERT INTO social_worker_meetings (resident_id, meeting_date, meeting_time, notes, logged_by)
    VALUES (
      ${residentId},
      ${formData.get('meeting_date') as string},
      ${(formData.get('meeting_time') as string) || null},
      ${(formData.get('notes') as string) || null},
      ${(formData.get('logged_by') as string) || null}
    )
  `;
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

export async function deleteSocialWorkerMeeting(id: number, residentId: number) {
  await sql`DELETE FROM social_worker_meetings WHERE id = ${id}`;
  revalidatePath(`/residents/${residentId}`);
  revalidatePath('/');
}

// ─── FUNCTIONAL REPORTS ───────────────────────────────────────────────────────

export async function createFunctionalReport(residentId: number, formData: FormData) {
  await sql`
    INSERT INTO functional_reports (resident_id, written_date, sent_date, sent_to, notes)
    VALUES (
      ${residentId},
      ${formData.get('written_date') as string},
      ${(formData.get('sent_date') as string) || null},
      ${(formData.get('sent_to') as string) || null},
      ${(formData.get('notes') as string) || null}
    )
  `;
  revalidatePath(`/residents/${residentId}`);
}

export async function deleteFunctionalReport(id: number, residentId: number) {
  await sql`DELETE FROM functional_reports WHERE id = ${id}`;
  revalidatePath(`/residents/${residentId}`);
}
