import { db } from '@/lib/db';
import { $notes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const POST = async (req: Request) => {
  const { documentId } = await req.json();
  const notes = await db
    .select()
    .from($notes)
    .where(eq($notes.documentId, parseInt(documentId)));

  if (notes.length != 1) return NextResponse.json({ status: 400 });
  return NextResponse.json(notes[0]);
};
