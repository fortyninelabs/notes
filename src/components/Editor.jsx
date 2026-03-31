'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import useStore from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import Toolbar from './Toolbar';
import { Plus } from 'lucide-react';

export default function Editor() {
  const { notes, selectedNoteId, updateNote, addNote, editorFontSize, shouldFocusEditor, setShouldFocusEditor } = useStore();
  const strings = useStrings();
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return strings.editor.placeholderTitle;
          }
          return strings.editor.placeholderBody;
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none h-full',
      },
    },
    onUpdate: ({ editor }) => {
      if (selectedNoteId && !selectedNote?.deleted) {
        const html = editor.getHTML();
        // Extract title from H1 if possible
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        const titleText = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        const title = titleText || strings.noteList.untitled;
        updateNote(selectedNoteId, { content: html, title });
      }
    },
    editable: !selectedNote?.deleted,
  }, [selectedNoteId, selectedNote?.deleted]); // Re-initialize when selectedNoteId or deleted status changes

  useEffect(() => {
    if (editor && selectedNote) {
      // Only set content if the editor is completely empty and should have content
      // or if we are switching to a different note.
      const currentHtml = editor.getHTML();
      const isEmptyEditor = currentHtml === '<p></p>' || currentHtml === '' || editor.isEmpty;
      
      if (isEmptyEditor) {
        editor.commands.setContent(selectedNote.content || '<h1></h1><p></p>');
      }

      if (shouldFocusEditor) {
        // Use a slightly longer timeout and ensure we target the title
        setTimeout(() => {
          if (editor) {
            editor.commands.focus('start');
            // Move cursor inside H1 specifically
            editor.commands.setTextSelection(0);
          }
        }, 150);
        setShouldFocusEditor(false);
      }
    }
  }, [selectedNoteId, editor, shouldFocusEditor, setShouldFocusEditor]); // Depend on ID change

  if (!selectedNoteId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 transition-colors">
        <div className="p-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col items-center gap-4 transition-colors">
          <p className="text-sm font-medium">{strings.editor.selectNote}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 z-10 w-full">
        <Toolbar editor={editor} note={selectedNote} />
      </div>

      {/* Editor Content Box */}
      <div className="flex-1 p-8 sm:p-12 print:p-0 overflow-y-auto bg-white dark:bg-gray-900 transition-colors">
        <div className={`editor-size-${editorFontSize} prose dark:prose-invert prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-2 dark:prose-h1:text-white prose-h2:text-xl dark:prose-h2:text-gray-200 prose-p:my-0 prose-p:leading-relaxed dark:prose-p:text-gray-400 dark:prose-li:text-gray-400 text-gray-800 dark:text-gray-400 max-w-none min-h-[50vh] print:max-w-full focus:outline-none`}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
