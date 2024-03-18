import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const POST = async (req: Request) => {
  const { documentId } = await req.json();
  const _files = await db
    .select()
    .from(files)
    .where(eq(files.documentId, parseInt(documentId)));
  return NextResponse.json(_files);
};
