import { DrizzleDocument } from '@/lib/db/schema';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import { MessageCircle, MessageCirclePlus, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  documents: DrizzleDocument[];
  documentId: number;
};

const DocumentSideBar = ({ documents, documentId }: Props) => {
  return (
    <div className="w-full h-full p-4 text-gray-200 bg-gray-900">
      <Link href={'/'}>
        <Button className="w-full border-dashed border-gray-300 border">
          <PlusCircle className="mr-2" />
          Add Document
        </Button>
      </Link>

      <div className="flex flex-col mt-4 gap-2">
        {documents.map((document) => (
          <Link key={document.id} href={`/document/${document.id}`}>
            <div
              className={cn('rounded-lg p-3 text-slate-300 flex items-start', {
                'bg-blue-400 text-white': documentId === document.id,
                'hover:text-white': documentId !== document.id,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden truncate whitespace-nowrap text-ellipsis">
                {document.documentKey}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href={'/'}>Home</Link>
          <Link href={'/'}>Source</Link>
        </div>
      </div>
    </div>
  );
};

export default DocumentSideBar;
