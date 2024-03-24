import ChatSheet from '@/components/ChatSheet';
import DocumentSideBar from '@/components/DocumentSideBar';
import DocumentTemplateDialog from '@/components/DocumentTemplateDialog';
import NoteEditor from '@/components/NoteEditor';
import { NoteProvider } from '@/components/NoteProvider';
import PDFViewer from '@/components/PDFViewer';
import TipTapEditor from '@/components/TipTapEditor';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { db } from '@/lib/db';
import { $notes, File, documents } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import axios from 'axios';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  params: { documentId: string };
};

const documentPage = async ({ params: { documentId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect('/sign-in');
  }

  const _documents = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId));
  if (!_documents) {
    return redirect('/');
  }
  if (!_documents.find((document) => document.id === parseInt(documentId))) {
    return redirect('/');
  }
  const currentdocument = _documents.find(
    (document) => document.id === parseInt(documentId)
  )!;

  return (
    <ResizablePanelGroup direction="horizontal" className="flex">
      <div className="flex w-full min-h-screen">
        {/* {document side bar} */}
        <ResizablePanel defaultSize={15}>
          <div className="h-full overflow-auto">
            <DocumentSideBar
              documentId={parseInt(documentId)}
              documents={_documents}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        {/* {pdf viewer} */}
        <ResizablePanel defaultSize={25}>
          <div className="h-full p-4 overflow-scroll">
            <PDFViewer documentId={parseInt(documentId)} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        {/* {mesages} */}
        <ResizablePanel defaultSize={60}>
          <div className="h-screen border-l-4 border-l-slate-200 overflow-scroll">
            <NoteProvider>
              <div className="p-2">
                <div className="border shadow-xl border-stone-200 rounded-lg p-4 flex justify-between">
                  <DocumentTemplateDialog />
                  <ChatSheet
                    documentId={parseInt(documentId)}
                    userId={userId}
                  />
                </div>
              </div>
              <NoteEditor documentId={parseInt(documentId)} />
            </NoteProvider>
          </div>
        </ResizablePanel>
      </div>
    </ResizablePanelGroup>
  );
};

export default documentPage;
