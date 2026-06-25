import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resident_id, event_type, event_date, notes, logged_by } = body;

    if (!resident_id || !event_type || !event_date) {
      return NextResponse.json({ error: 'חסרים שדות חובה', body }, { status: 400 });
    }

    await sql`
      INSERT INTO tracking_events (resident_id, event_type, event_date, notes, logged_by)
      VALUES (${resident_id}, ${event_type}, ${event_date}, ${notes || null}, ${logged_by || null})
    `;

    revalidatePath('/tracking');
    revalidatePath('/');

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
