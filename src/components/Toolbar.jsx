'use client';

import React, { useState, useEffect, useRef } from 'react';
import useStore from '@/lib/store';
import { useStrings } from '@/lib/i18n';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Code, 
  Undo, 
  Redo, 
  Star, 
  Trash2, 
  ChevronDown,
  Palette,
  Highlighter,
  RefreshCcw,
  XCircle,
  Type,
  Printer,
  Strikethrough,
  CalendarDays,
  MoreHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'White', value: '#ffffff' },
];

export default function Toolbar({ editor, note }) {
  const { categories, updateNote, editorFontSize, setEditorFontSize, restoreNote, permanentDeleteNote, language } = useStore();
  const strings = useStrings();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  
  const [isCompact, setIsCompact] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (!toolbarRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width < 750) {
          setIsCompact(true);
        } else {
          setIsCompact(false);
          setShowMoreMenu(false);
        }
      }
    });
    observer.observe(toolbarRef.current);
    return () => observer.disconnect();
  }, []);

  if (!editor || !note) return null;

  const toggleFavorite = () => updateNote(note.id, { favorite: !note.favorite });
  const moveToTrash = () => updateNote(note.id, { deleted: true });
  const setCategory = (categoryId) => {
    updateNote(note.id, { categoryId });
    setShowCategoryMenu(false);
  };

  const ToolbarButton = ({ onClick, active, disabled, children, title, activeClass = "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600", className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-all duration-200 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-30",
        active && activeClass,
        className
      )}
    >
      {children}
    </button>
  );

  // Custom keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editor) return;
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyH') {
        e.preventDefault();
        editor.chain().focus().setHighlight({ color: '#fef08a' }).run();
      }
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        const now = new Date();
        const formatted = now.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
          weekday: 'long', day: 'numeric', month: 'numeric', year: '2-digit',
        });
        editor.chain().focus().insertContent(formatted).run();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (note.deleted) {
    return (
      <div className="flex items-center justify-between px-6 py-2 bg-red-50/30 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 shadow-sm sticky top-0 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-400 dark:text-red-500 uppercase tracking-widest px-2 py-1 bg-white dark:bg-gray-900 rounded-md border border-red-100 dark:border-red-900/50">
            {strings.toolbar.noteInTrash}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => restoreNote(note.id)}
            className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm active:scale-95"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            {strings.toolbar.restore}
          </button>
          
          <button
            onClick={() => {
              if (confirm(strings.toolbar.confirmPermanentDelete)) permanentDeleteNote(note.id);
            }}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all shadow-md active:scale-95"
          >
            <XCircle className="w-3.5 h-3.5" />
            {strings.toolbar.deletePermanently}
          </button>
        </div>
      </div>
    );
  }

  // --- Subcomponents for Menus ---
  const FontSizeDropdown = () => (
    <div className="relative mr-1">
      <button 
        onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
        className={cn(
          "p-1.5 rounded transition-all duration-200 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 text-gray-700 dark:text-gray-300",
          showFontSizeMenu && "bg-gray-100 dark:bg-gray-800 shadow-inner"
        )}
        title={strings.toolbar.textSize}
      >
        <Type className="w-4 h-4" />
        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
      </button>
      
      {showFontSizeMenu && (
        <div className="absolute left-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2 py-1.5 tracking-wider">{strings.toolbar.textSize}</div>
          {['sm', 'base', 'lg'].map(size => (
            <button
              key={size}
              onClick={() => { setEditorFontSize(size); setShowFontSizeMenu(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors mb-1 capitalize",
                editorFontSize === size ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              {size === 'sm' ? strings.toolbar.small : size === 'base' ? strings.toolbar.medium : strings.toolbar.large}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const ColorDropdown = () => (
    <div className="relative mr-2">
      <button 
        onClick={() => setShowColorMenu(!showColorMenu)}
        className={cn(
          "p-1.5 rounded transition-all duration-200 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 text-gray-700 dark:text-gray-300",
          showColorMenu && "bg-gray-100 dark:bg-gray-800 shadow-inner"
        )}
        title={strings.toolbar.textColor}
      >
        <Palette className="w-4 h-4" />
        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
      </button>
      
      {showColorMenu && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2 py-1.5 tracking-wider">{strings.toolbar.textColor}</div>
          <div className="grid grid-cols-5 gap-2 p-1">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => { editor.chain().focus().setColor(color.value).run(); setShowColorMenu(false); }}
                className={cn(
                  "w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform relative group",
                  editor.isActive('textStyle', { color: color.value }) && "ring-2 ring-offset-1 dark:ring-offset-gray-800 ring-blue-500"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                <div className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
          <div className="h-px bg-gray-50 dark:bg-gray-700 my-2 mx-1" />
          <button
            onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorMenu(false); }}
            className="w-full text-left px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
          >
            {strings.toolbar.resetDefault}
          </button>
        </div>
      )}
    </div>
  );

  const HighlightMenu = () => (
    <div className="relative">
      <button
        onClick={() => setShowHighlightMenu(!showHighlightMenu)}
        className={cn(
          "p-1.5 rounded transition-all duration-200 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 text-gray-700 dark:text-gray-300",
          showHighlightMenu && "bg-gray-100 dark:bg-gray-800 shadow-inner"
        )}
        title={strings.toolbar.highlight}
      >
        <Highlighter className="w-4 h-4" />
        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
      </button>

      {showHighlightMenu && (
        <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2 py-1.5 tracking-wider">{strings.toolbar.highlight}</div>
          {[
            { name: 'Gelb', val: '#fef08a', colorClass: 'bg-yellow-300 border-yellow-400', hoverClass: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20' },
            { name: 'Grün', val: '#86efac', colorClass: 'bg-green-300 border-green-400', hoverClass: 'hover:bg-green-50 dark:hover:bg-green-900/20' },
            { label: strings.toolbar.red, val: '#fca5a5', colorClass: 'bg-red-300 border-red-400', hoverClass: 'hover:bg-red-50 dark:hover:bg-red-900/20' },
          ].map(c => (
            <button
              key={c.val}
              onClick={() => { editor.chain().focus().setHighlight({ color: c.val }).run(); setShowHighlightMenu(false); }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 rounded-lg transition-colors ${c.hoverClass}`}
            >
              <span className={`w-4 h-4 rounded-full border flex-shrink-0 ${c.colorClass}`} />
              {c.val === '#fef08a' ? strings.toolbar.yellow : c.val === '#86efac' ? strings.toolbar.green : strings.toolbar.red}
            </button>
          ))}
          <div className="h-px bg-gray-50 dark:bg-gray-700 my-2 mx-1" />
          <button
            onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightMenu(false); }}
            className="w-full text-left px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors"
          >
            {strings.toolbar.removeHighlight}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div ref={toolbarRef} className="flex items-center justify-between px-6 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 print:hidden transition-colors min-h-[52px]">
      {/* Left: Formatting & Colors */}
      <div className="flex items-center gap-1">
        <FontSizeDropdown />
        <ColorDropdown />

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title={strings.toolbar.bold}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title={strings.toolbar.italic}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        {/* Compact Mode Divider */}
        {!isCompact && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title={strings.toolbar.heading1}>
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title={strings.toolbar.heading2}>
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title={strings.toolbar.bulletList}>
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title={strings.toolbar.numberedList}>
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title={strings.toolbar.codeBlock}>
              <Code className="w-4 h-4" />
            </ToolbarButton>
            
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title={strings.toolbar.strike}>
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            
            <HighlightMenu />
            
            <ToolbarButton
              onClick={() => {
                const now = new Date();
                const formatted = now.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'numeric', year: '2-digit' });
                editor.chain().focus().insertContent(formatted).run();
              }}
              title={strings.toolbar.insertDate}
            >
              <CalendarDays className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Compact More Menu */}
        {isCompact && (
          <div className="relative mr-2">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={cn(
                "p-1.5 rounded transition-all duration-200 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                showMoreMenu && "bg-gray-100 dark:bg-gray-800 shadow-inner"
              )}
              title={strings.toolbar.moreOptions}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200 flex flex-col gap-1">
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2 py-1 tracking-wider">{strings.toolbar.formatting}</div>
                <div className="flex gap-1 px-1">
                  <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough className="w-4 h-4" /></ToolbarButton>
                </div>
                <div className="flex gap-1 px-1 mt-1">
                  <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="w-4 h-4" /></ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" /></ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}><Code className="w-4 h-4" /></ToolbarButton>
                </div>
                <div className="h-px bg-gray-50 dark:bg-gray-700 my-1 mx-2" />
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2 py-1 tracking-wider">{strings.toolbar.highlight}</div>
                <HighlightMenu />
                <div className="h-px bg-gray-50 dark:bg-gray-700 my-1 mx-2" />
                <button
                  onClick={() => {
                    const now = new Date();
                    const formatted = now.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'numeric', year: '2-digit' });
                    editor.chain().focus().insertContent(formatted).run();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                >
                  <CalendarDays className="w-4 h-4" /> {strings.toolbar.insertDate}
                </button>
                <div className="flex gap-1 px-1 mt-1 justify-between">
                  <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo className="w-4 h-4" /></ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo className="w-4 h-4" /></ToolbarButton>
                  <ToolbarButton onClick={() => window.print()}><Printer className="w-4 h-4" /></ToolbarButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
          >
            {note.categoryId ? categories.find(c => c.id === note.categoryId)?.name : strings.noteList.category}
            <ChevronDown className="w-3 h-3 mt-0.5" />
          </button>
          
          {showCategoryMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-2 py-1.5 tracking-wider">{strings.toolbar.selectCategory}</div>
              <button 
                onClick={() => setCategory(null)}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors mb-1"
              >
                {strings.toolbar.none}
              </button>
              <div className="h-px bg-gray-50 dark:bg-gray-700 my-1 mx-2" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        
        {!isCompact && (
          <ToolbarButton onClick={() => window.print()} title={strings.toolbar.print}>
            <Printer className="w-4 h-4 hover:text-blue-500" />
          </ToolbarButton>
        )}

        <ToolbarButton 
          onClick={toggleFavorite} 
          active={note.favorite}
          activeClass="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50"
          title={strings.toolbar.favorite}
        >
          <Star className={cn("w-4 h-4", note.favorite && "fill-current")} />
        </ToolbarButton>

        <ToolbarButton onClick={moveToTrash} title={strings.toolbar.moveToTrash}>
          <Trash2 className="w-4 h-4 hover:text-red-500" />
        </ToolbarButton>

        {!isCompact && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={strings.toolbar.undo}>
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={strings.toolbar.redo}>
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}
      </div>
    </div>
  );
}
