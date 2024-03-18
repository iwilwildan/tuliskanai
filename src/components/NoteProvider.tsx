'use client';
import { Note } from '@/lib/db/schema';
import React, { ReactNode, createContext, useContext, useState } from 'react';

interface NoteContextType {
  note: Note;
  updateNote: (newNote: Note) => void;
}
type Props = {
  children: ReactNode;
};

const NoteContext = createContext<NoteContextType | undefined>(undefined);
const NoteProvider: React.FC<Props> = ({ children }) => {
  const [note, setNote] = useState<Note>({ documentId: 0 });

  const updateNote = (newNote: Note) => {
    setNote(newNote);
  };

  return (
    <NoteContext.Provider value={{ note, updateNote }}>
      {children}
    </NoteContext.Provider>
  );
};

function useNote() {
  const context = useContext(NoteContext);
  if (context === undefined)
    throw new Error('NoteContext is used outside the NoteProvider');
  return context;
}

export { NoteProvider, useNote };
