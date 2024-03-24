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

type Props = { documentId: number; userId: string };

const ChatSheet = ({ documentId, userId }: Props) => {
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
        <ChatMessages documentId={documentId} userId={userId} />
      </SheetContent>
    </Sheet>
  );
};

export default ChatSheet;
