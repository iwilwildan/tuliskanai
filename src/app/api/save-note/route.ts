import { db } from '@/lib/db';
import { $notes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { noteId, content } = body;
    if (!noteId || !content) {
      return new NextResponse('missing URL params', { status: 400 });
    }
    noteId = parseInt(noteId);
    //get db note object
    const notes = await db.select().from($notes).where(eq($notes.id, noteId));

    if (notes.length != 1) {
      return new NextResponse('failed to update', { status: 500 });
    }
    const note = notes[0];
    if (note.content != content) {
      await db.update($notes).set({ content }).where(eq($notes.id, noteId));
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log(err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
