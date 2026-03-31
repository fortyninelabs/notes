'use client';

import React from 'react';
import useStore from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Plus, PanelLeft, Search, ArrowUpDown, Check } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Helper to get contrast text color
function getContrastColor(hexColor) {
  if (!hexColor) return 'text-white';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'text-gray-900' : 'text-white';
}

export default function NoteList() {
  const { 
    notes,
    getFilteredNotes, 
    selectedNoteId, 
    setSelectedNoteId, 
    categories,
    activeFilter,
    selectedCategoryId,
    addNote,
    isSidebarOpen,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    setShouldFocusEditor
  } = useStore();

  const strings = useStrings();
  const language = useStore((state) => state.language);

  const filteredNotes = getFilteredNotes();
  const [isMounted, setIsMounted] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [draggingNoteId, setDraggingNoteId] = React.useState(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const getCategory = (id) => categories.find(c => c.id === id);

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const getTitle = (content) => {
    if (!content) return strings.noteList.untitled;
    const text = stripHtml(content);
    const firstLine = text.split('\n')[0];
    return firstLine || strings.noteList.untitled;
  };

  const getSubtext = (content) => {
    if (!content) return strings.noteList.noContent;
    const text = stripHtml(content);
    const lines = text.split('\n');
    return lines[1] || lines[0].slice(0, 60) || strings.noteList.noContent;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative z-0 border-r border-gray-200 dark:border-gray-700 transition-colors">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4 bg-white dark:bg-gray-900 relative z-20 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button 
                onClick={toggleSidebar}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
                title={strings.sidebar.openSidebar}
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize px-1">
              {searchQuery ? strings.noteList.searchResults : (activeFilter === 'all' ? strings.noteList.notes : activeFilter === 'category' ? categories.find(c => c.id === selectedCategoryId)?.name || strings.noteList.category : strings.sidebar[activeFilter] || activeFilter)}
            </h2>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors flex items-center justify-center",
                  showSortMenu ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                title={strings.noteList.sortOptions}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              
              {/* Sort Menu Dropdown */}
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 origin-top-right animate-in fade-in zoom-in duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{strings.noteList.sortOptions}</div>
                    {[
                      { id: 'newest', label: strings.noteList.sortNewest },
                      { id: 'oldest', label: strings.noteList.sortOldest },
                      { id: 'a-z', label: strings.noteList.sortAz }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => { setSortOrder(option.id); setShowSortMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        {option.label}
                        {sortOrder === option.id && <Check className="w-4 h-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={async () => {
                const categoryId = activeFilter === 'category' ? selectedCategoryId : null;
                const emptyNote = notes.find(n => 
                  (n.title === 'Untitled' || n.title === '') && 
                  (n.content === '<h1></h1><p></p>' || n.content === '' || n.content === '<p></p>') && 
                  !n.deleted &&
                  (n.categoryId ?? null) === categoryId
                );
                
                if (emptyNote) {
                  setSelectedNoteId(emptyNote.id);
                  setTimeout(() => setShouldFocusEditor(true), 50);
                } else {
                  await addNote({ title: strings.noteList.untitled, content: '<h1></h1><p></p>', ...(categoryId ? { categoryId } : {}) });
                  setTimeout(() => setShouldFocusEditor(true), 50);
                }
              }}
              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 active:scale-95 group ml-1"
              title={strings.noteList.newNote}
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={strings.noteList.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
            <p className="text-sm">{strings.noteList.noNotesFound}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
            {filteredNotes.map((note, index) => {
              const category = getCategory(note.categoryId);
              const isActive = selectedNoteId === note.id;

              return (
                <button
                  key={note.id || index}
                  onClick={() => setSelectedNoteId(note.id)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('noteId', note.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggingNoteId(note.id);
                  }}
                  onDragEnd={() => setDraggingNoteId(null)}
                  className={cn(
                    "w-full text-left px-6 py-5 transition-all group relative cursor-grab active:cursor-grabbing",
                    isActive ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    draggingNoteId === note.id && "opacity-40 scale-[0.98]"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                  
                  <h3 className={cn(
                    "text-[15px] font-semibold mb-1 truncate",
                    isActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-900 dark:text-white"
                  )}>
                    {note.title || strings.noteList.untitled}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {(note.content?.replace(/<h1[^>]*>.*?<\/h1>/s, '') ?? '').replace(/<[^>]*>/g, ' ').trim().slice(0, 80) || 'No additional text'}
                  </p>

                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                      {isMounted ? format(new Date(note.updatedAt || note.createdAt), language === 'de' ? 'dd.MM.yyyy' : 'MMM d, yyyy', { locale: language === 'de' ? de : enUS }) : '...'}
                    </span>

                    {category && !note.deleted && (
                      <span 
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          getContrastColor(category.color)
                        )}
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
