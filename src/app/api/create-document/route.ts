// /api/create-chat

import { db } from '@/lib/db';
import { $notes, documents, files } from '@/lib/db/schema';
import { loadS3BatchIntoPinecone } from '@/lib/pinecone';
import { getS3Url } from '@/lib/s3';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { data } = body;
    const fileKeys = data.map(
      (obj: { file_key: string; file_name: string }) => obj.file_key
    );
    const documentKey = `Document-${Date.now().toString()}-${Math.random()
      .toString(36)
      .substr(2, 4)}`;
    await loadS3BatchIntoPinecone(fileKeys, documentKey);
    const document_id = await db
      .insert(documents)
      .values({
        documentKey: documentKey,
        userId: userId,
      })
      .returning({ insertedId: documents.id });

    //insert files
    data.forEach(async (obj: { file_key: string; file_name: string }) => {
      await db.insert(files).values({
        documentId: document_id[0].insertedId,
        fileKey: obj.file_key,
        fileName: obj.file_name,
        fileUrl: getS3Url(obj.file_key),
      });
    });

    //create note
    await db.insert($notes).values({
      documentId: document_id[0].insertedId,
    });

    return NextResponse.json(
      { document_id: document_id[0].insertedId },
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
