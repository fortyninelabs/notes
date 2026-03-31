'use client';

import React, { useState } from 'react';
import useStore from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import {
  FileText,
  Star,
  Trash2,
  Plus,
  ChevronRight,
  MoreHorizontal,
  Folder,
  PanelLeftClose,
  Settings,
  X,
  Edit2,
  Moon,
  Sun,
  Monitor,
  Check,
  Languages
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const {
    notes,
    categories,
    activeFilter,
    selectedCategoryId,
    setActiveFilter,
    setSelectedCategory,
    addCategory,
    deleteCategory,
    updateCategory,
    toggleSidebar,
    updateNote,
    theme,
    setTheme,
    language,
    setLanguage
  } = useStore();

  const strings = useStrings();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [dragOverId, setDragOverId] = useState(null); // 'notes' | category.id | null

  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleDrop = (e, categoryId) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      updateNote(noteId, { categoryId: categoryId ?? null });
    }
    setDragOverId(null);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDragLeave = (e) => {
    // only reset if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverId(null);
    }
  };

  const systemItems = [
    { id: 'all', label: strings.sidebar.notes, icon: FileText },
    { id: 'favorites', label: strings.sidebar.favorites, icon: Star },
    { id: 'deleted', label: strings.sidebar.deleted, icon: Trash2 },
  ];

  const getNoteCount = (filterType, categoryId = null) => {
    switch (filterType) {
      case 'all':
        return notes.filter(n => !n.deleted).length;
      case 'favorites':
        return notes.filter(n => n.favorite && !n.deleted).length;
      case 'deleted':
        return notes.filter(n => n.deleted).length;
      case 'category':
        return notes.filter(n => n.categoryId === categoryId && !n.deleted).length;
      default:
        return 0;
    }
  };

  const handleAddCategory = async (e) => {
    if (e.key === 'Enter' && newCategoryName.trim()) {
      await addCategory(newCategoryName, '#3b82f6');
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleContextMenu = (e, category) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, categoryId: category.id });
  };

  const startEditing = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setContextMenu(null);
  };

  const handleRename = async (e) => {
    if (e.key === 'Enter') {
      if (editingCategoryName.trim()) {
        await updateCategory(editingCategoryId, { name: editingCategoryName.trim() });
      }
      setEditingCategoryId(null);
    } else if (e.key === 'Escape') {
      setEditingCategoryId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFB] dark:bg-gray-900 py-6 px-3 border-r border-gray-200 dark:border-gray-700 transition-colors">
      {/* Top Header - Kept for close sidebar button positioning */}
      <div className="px-3 mb-8 flex items-center justify-end">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
          title={strings.sidebar.closeSidebar}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* System Sections */}
      <nav className="space-y-1 mb-10">
        {systemItems.map((item) => {
          const count = getNoteCount(item.id);
          const isDropTarget = item.id === 'all' && dragOverId === 'notes';
          return (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              onDragOver={item.id === 'all' ? (e) => handleDragOver(e, 'notes') : undefined}
              onDragLeave={item.id === 'all' ? handleDragLeave : undefined}
              onDrop={item.id === 'all' ? (e) => handleDrop(e, null) : undefined}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                activeFilter === item.id
                  ? "bg-gray-200/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                isDropTarget && "bg-blue-100 text-blue-700 ring-2 ring-blue-400 ring-inset"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-4 h-4",
                  activeFilter === item.id ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                )} />
                {item.label}
              </div>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full transition-colors",
                activeFilter === item.id
                  ? "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Categories Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-3">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase">{strings.sidebar.categories}</h2>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Plus className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-1 relative">
          {categories.map((cat) => {
            const count = getNoteCount('category', cat.id);
            const isEditing = editingCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                className="group flex items-center gap-1 relative"
                onContextMenu={(e) => handleContextMenu(e, cat)}
              >
                <button
                  onClick={() => !isEditing && setSelectedCategory(cat.id)}
                  onDragOver={(e) => handleDragOver(e, cat.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  className={cn(
                    "flex-1 flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors overflow-hidden",
                    selectedCategoryId === cat.id
                      ? "bg-gray-200/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                    dragOverId === cat.id && "bg-green-100 text-green-700 ring-2 ring-green-400 ring-inset"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyDown={handleRename}
                        onBlur={() => setEditingCategoryId(null)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-sm outline-none ring-2 ring-blue-500/20 w-fit text-gray-900 dark:text-gray-100 absolute left-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{cat.name}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full transition-colors",
                    selectedCategoryId === cat.id
                      ? "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  )}>
                    {count}
                  </span>
                </button>
              </div>
            );
          })}

          {isAddingCategory && (
            <div className="px-3 py-1 mt-1 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleAddCategory}
                onBlur={() => setIsAddingCategory(false)}
                placeholder={strings.sidebar.categoryNamePlaceholder}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded px-2 py-1 text-sm outline-none ring-2 ring-blue-500/20 group-hover:border-gray-300 transition-all font-medium"
              />
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => startEditing(categories.find(c => c.id === contextMenu.categoryId))}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            {strings.sidebar.rename}
          </button>
          <button
            onClick={() => {
              deleteCategory(contextMenu.categoryId);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {strings.sidebar.delete}
          </button>
        </div>
      )}

      {/* Settings at the bottom */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 transition-colors">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
        >
          <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
          {strings.sidebar.settings}
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[400px] max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-transparent dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0 transition-colors">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{strings.settings.title}</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors border border-transparent">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{strings.settings.general}</h3>
                
                {/* Theme Toggle Settings */}
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{strings.settings.theme}</h4>
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-lg w-full border border-transparent dark:border-gray-700/50 transition-colors mb-6">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all shadow-sm",
                      theme === 'light' ? "bg-white text-gray-900 dark:text-gray-900 ring-1 ring-gray-900/5" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shadow-none"
                    )}
                  >
                    <Sun className="w-3.5 h-3.5" /> {strings.settings.light}
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all shadow-sm",
                      theme === 'dark' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-900/5 dark:ring-white/10" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shadow-none"
                    )}
                  >
                    <Moon className="w-3.5 h-3.5" /> {strings.settings.dark}
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all shadow-sm",
                      theme === 'system' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-900/5 dark:ring-white/10" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shadow-none"
                    )}
                  >
                    <Monitor className="w-3.5 h-3.5" /> {strings.settings.system}
                  </button>
                </div>

                {/* Language Toggle Settings */}
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{strings.settings.language}</h4>
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-lg w-full border border-transparent dark:border-gray-700/50 transition-colors">
                  <button
                    onClick={() => setLanguage('de')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all shadow-sm",
                      language === 'de' ? "bg-white text-gray-900 dark:text-gray-900 ring-1 ring-gray-900/5" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shadow-none"
                    )}
                  >
                    DE
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all shadow-sm",
                      language === 'en' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-900/5 dark:ring-white/10" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shadow-none"
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('system')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all shadow-sm",
                      language === 'system' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-900/5 dark:ring-white/10" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shadow-none"
                    )}
                  >
                    <Languages className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{strings.settings.shortcuts}</h3>
                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  {[
                    { label: strings.noteList.newNote, keys: ['Strg', 'N'] },
                    { label: strings.toolbar.bold, keys: ['Strg', 'B'] },
                    { label: strings.toolbar.italic, keys: ['Strg', 'I'] },
                    { label: strings.toolbar.strike, keys: ['Strg', 'Shift', 'X'] },
                    { label: strings.toolbar.heading1, keys: ['Strg', 'Alt', '1'] },
                    { label: strings.toolbar.heading2, keys: ['Strg', 'Alt', '2'] },
                    { label: strings.toolbar.bulletList, keys: ['Strg', 'Shift', '8'] },
                    { label: strings.toolbar.numberedList, keys: ['Strg', 'Shift', '7'] },
                    { label: strings.toolbar.codeBlock, keys: ['Strg', 'Alt', 'C'] },
                    { label: strings.toolbar.highlight, keys: ['Strg', 'Shift', 'H'] },
                    { label: strings.toolbar.insertDate, keys: ['Strg', 'Shift', 'D'] },
                    { label: strings.toolbar.print, keys: ['Strg', 'P'] },
                    { label: strings.toolbar.undo, keys: ['Strg', 'Z'] },
                    { label: strings.toolbar.redo, keys: ['Strg', 'Shift', 'Z'] },
                  ].map(({ label, keys }, i, arr) => (
                    <div key={label} className={cn("flex justify-between items-center py-1.5", i < arr.length - 1 ? 'border-b border-gray-50 dark:border-gray-800/60' : '')}>
                      <span>{label}</span>
                      <div className="flex items-center gap-1">
                        {keys.map((k, ki) => (
                          <React.Fragment key={ki}>
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono font-bold text-gray-600 dark:text-gray-400">{k}</kbd>
                            {ki < keys.length - 1 && <span className="text-gray-300 dark:text-gray-600 text-xs">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 transition-colors">
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{strings.settings.about}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Version 1.0.0 &copy; 2026. A beautiful React-based note taking application.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
