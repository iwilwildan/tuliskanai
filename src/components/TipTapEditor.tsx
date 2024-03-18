'use client';
import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import TipTapMenuBar from './TipTapMenuBar';
import { Button } from './ui/button';
import { useMutation } from '@tanstack/react-query';
import Text from '@tiptap/extension-text';
import axios from 'axios';
import { useCompletion } from 'ai/react';
import { Note } from '@/lib/db/schema';
import { useDebounce } from '@/lib/useDebounce';
import { useNote } from './NoteProvider';

type Props = {
  note: Note;
};

const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = useState(note.content || '');
  const { complete, completion } = useCompletion({
    api: '/api/completion',
  });
  const saveNote = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/save-note', {
        noteId: note.id,
        content: editorState,
      });
      return response.data;
    },
  });
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        'Shift-a': () => {
          // take the last 30 words
          const prompt = this.editor.getText().split(' ').slice(-30).join(' ');
          complete(prompt);
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, customText],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
  });
  const lastCompletion = useRef('');

  useEffect(() => {
    if (!completion || !editor) return;
    const diff = completion.slice(lastCompletion.current.length);
    lastCompletion.current = completion;
    editor.commands.insertContent(diff);
  }, [completion, editor]);

  const debouncedEditorState = useDebounce(editorState, 500);
  useEffect(() => {
    // save to db
    if (debouncedEditorState === '') return;
    saveNote.mutate(undefined, {
      onSuccess: (data) => {
        console.log('success update!', data);
      },
      onError: (err) => {
        console.error(err);
      },
    });
  }, [debouncedEditorState]);

  useEffect(() => {
    if (!note || !editor) return;
    editor.commands.clearContent();
    editor.commands.insertContent(note.content || '');
  }, [note, editor]);

  return (
    <>
      <div className="flex w-full">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button disabled variant={'outline'}>
          {saveNote.isPending ? 'Saving...' : 'Saved'}
        </Button>
      </div>

      <div className="w-full prose prose-sm mt-4">
        <EditorContent editor={editor} />
      </div>
      <div className="h-4"></div>
      <span className="text-sm">
        Tip: Press{' '}
        <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
          Shift + A
        </kbd>{' '}
        for AI autocomplete
      </span>
    </>
  );
};

export default TipTapEditor;
