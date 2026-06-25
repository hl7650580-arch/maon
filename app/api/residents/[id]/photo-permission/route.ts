import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { photo_permission } = await request.json();
    await sql`UPDATE residents SET photo_permission = ${photo_permission || null} WHERE id = ${parseInt(params.id)}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
