'use client';

import { useEffect } from 'react';
import useStore from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import NoteList from '@/components/NoteList';
import Editor from '@/components/Editor';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const { fetchNotes, fetchCategories, isSidebarOpen } = useStore();

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [fetchNotes, fetchCategories]);

  return (
    <main className="flex h-[calc(100vh-40px)] overflow-hidden bg-gray-50/50 print:block print:h-auto print:overflow-visible print:bg-white">
      {/* Sidebar - Collapsible Width */}
      <div 
        className={cn(
          "flex-shrink-0 border-r border-gray-200 transition-[width,padding] duration-300 print:hidden overflow-hidden",
          isSidebarOpen ? "w-[260px]" : "w-0 border-r-0"
        )}
      >
        <div className="w-[260px] h-full">
          <Sidebar />
        </div>
      </div>

      {/* Note List - Fixed Width */}
      <div className="w-[340px] flex-shrink-0 border-r border-gray-200 print:hidden">
        <NoteList />
      </div>

      {/* Editor - Flexible Width */}
      <div className="flex-1 overflow-y-auto print:overflow-visible bg-white">
        <Editor />
      </div>
    </main>
  );
}
