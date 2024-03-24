'use client';
import React, { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Divide, Send } from 'lucide-react';
import MessagesList from './MessagesList';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Message } from 'ai';
import { ScrollArea } from './ui/scroll-area';
import { auth } from '@clerk/nextjs';
import { CreditValues } from '@/constants';
import { useUserBalance } from './UserBalanceProvider';

type Props = {
  documentId: number;
  userId: string;
};
type balanceParams = {
  userId: string;
  increment: number;
};

const ChatMessages = ({ documentId, userId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ['messages', documentId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', {
        documentId,
      });

      return response.data;
    },
  });
  const { userBalance, updateUserBalance } = useUserBalance();
  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading: answering,
  } = useChat({
    api: '/api/chat',
    body: { documentId },
    initialMessages: data || [],
    onFinish() {
      if (userBalance.id) updateUserBalance(-CreditValues.chat);
    },
  });
  const parentEl = useRef(null);
  useEffect(
    function () {
      if (parentEl.current) {
        const container = parentEl.current as HTMLElement;
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    },
    [messages]
  );
  return (
    <div className="flex flex-col h-full py-5">
      {/* useChat from vercel ai will handle the chat  */}
      <div className="w-full h-full overflow-auto" ref={parentEl}>
        <MessagesList messages={messages} isLoading={isLoading} />
      </div>
      <div className="h-2"></div>
      <form
        onSubmit={handleSubmit}
        className="flex sticky bottom-0 inset-x-0 px-2 py-4 bg-white h-fit"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder={
            answering
              ? 'AI sedang menjawab...'
              : 'tanyakan apapun tentang PDF nya...'
          }
          disabled={answering}
          className="w-full"
        />
        <Button className="bg-blue-400 ml-2">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatMessages;
