import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import ChatMessages from './ChatMessages';

type Props = { documentId: number };

const ChatSheet = ({ documentId }: Props) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-blue-400" size="sm">
          Chat PDF
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full">
        <SheetHeader>
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>
        <ChatMessages documentId={documentId} />
      </SheetContent>
    </Sheet>
  );
};

export default ChatSheet;
