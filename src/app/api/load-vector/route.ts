// /api/load-vector

import { loadS3BatchIntoPinecone } from '@/lib/pinecone';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { pdfData, documentKey } = body.data;

    const fileKeys = pdfData.map(
      (obj: { file_key: string; file_name: string }) => obj.file_key
    );

    await loadS3BatchIntoPinecone(fileKeys, documentKey);

    return NextResponse.json({ message: 'success' }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}
