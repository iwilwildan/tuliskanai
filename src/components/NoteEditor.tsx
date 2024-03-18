'use client';
import React, { useEffect, useState } from 'react';
import TipTapEditor from './TipTapEditor';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Note } from '@/lib/db/schema';
import { Loader2 } from 'lucide-react';
import { useNote } from './NoteProvider';
import toast from 'react-hot-toast';

type Props = {
  documentId: number;
};

const NoteEditor = ({ documentId }: Props) => {
  const { note, updateNote } = useNote();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(
    function () {
      async function fetchNote() {
        try {
          setIsLoading(true);
          const response = await axios.post<Note>('/api/get-note', {
            documentId,
          });

          updateNote(response.data);
        } catch (error) {
          toast.error('Error fetching the files');
        } finally {
          setIsLoading(false);
        }
      }

      fetchNote();
    },
    [documentId]
  );

  return (
    <div className="h-full p-2">
      <div className="w-full mx-auto">
        <div className="border-stone-200 shadow-xl border rounded-lg px-16 py-8">
          {isLoading && (
            <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {!isLoading && note?.id && <TipTapEditor note={note} />}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
