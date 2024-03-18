import { cn } from '@/lib/utils';
import { Message } from 'ai/react';
import { Loader2 } from 'lucide-react';
import React from 'react';

type Props = {
  messages: Message[];
  isLoading: boolean;
};

const MessagesList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!messages) return <></>;

  return (
    <div className="flex flex-col px-4 gap-2">
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={cn('flex', {
              'justify-start pr-10': message.role === 'assistant',
              'justify-end pl-10': message.role === 'user',
            })}
          >
            <div
              className={cn(
                'rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10',
                { 'text-white bg-blue-400': message.role === 'user' }
              )}
            >
              <p>{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesList;
