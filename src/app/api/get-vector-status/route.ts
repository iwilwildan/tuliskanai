// /api/load-vector

import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { documents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { convertToAscii } from '@/lib/utils';
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { documentId } = body;
    const _documents = await db
      .select()
      .from(documents)
      .where(eq(documents.id, parseInt(documentId)));

    if (_documents.length != 1) return NextResponse.json({ status: 400 });
    const index = pc.index('learnpdf');
    const stats = await index.describeIndexStats();
    const namespaceKey = convertToAscii(_documents[0].documentKey);
    const namespace = stats.namespaces![namespaceKey];

    if (!namespace || namespace.recordCount <= 0)
      return NextResponse.json({ status: 400 });
    return NextResponse.json(
      { message: 'success', isLoaded: true },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}
