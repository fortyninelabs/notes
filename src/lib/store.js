import { create } from 'zustand';

const useStore = create((set, get) => ({
  notes: [],
  categories: [],
  selectedNoteId: null,
  activeFilter: 'all', // 'all', 'favorites', 'deleted'
  selectedCategoryId: null,
  isLoading: false,
  error: null,
  editorFontSize: 'base', // 'sm', 'base', 'lg'
  isSidebarOpen: true,
  searchQuery: '',
  sortOrder: 'newest', // 'newest', 'oldest', 'a-z'
  shouldFocusEditor: false,
  theme: 'system', // 'light', 'dark', 'system'
  language: 'system', // 'de', 'en', 'system'

  // Fetching
  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      let data;
      if (typeof window !== 'undefined' && window.electronAPI) {
        data = await window.electronAPI.notes.getAll();
      } else {
        const resp = await fetch('/api/notes');
        if (!resp.ok) throw new Error("API Fetch failed");
        data = await resp.json();
      }
      set({ notes: data || [], isLoading: false });
    } catch (error) {
      console.error("Store fetchNotes Error:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      let data;
      if (typeof window !== 'undefined' && window.electronAPI) {
        data = await window.electronAPI.categories.getAll();
      } else {
        const resp = await fetch('/api/categories');
        if (!resp.ok) throw new Error("API Fetch failed");
        data = await resp.json();
      }
      set({ categories: data || [] });
    } catch (error) {
      console.error("Store fetchCategories Error:", error);
      set({ error: error.message });
    }
  },

  // Note Actions
  setNotes: (notes) => set({ notes }),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setEditorFontSize: (size) => set({ editorFontSize: size }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setShouldFocusEditor: (val) => set({ shouldFocusEditor: val }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  
  addNote: async (noteData = {}) => {
    try {
      let newNote;
      if (typeof window !== 'undefined' && window.electronAPI) {
        newNote = await window.electronAPI.notes.create(noteData);
      } else {
        const resp = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });
        newNote = await resp.json();
      }

      if (!newNote) throw new Error("Creation failed: No data returned");

      set((state) => ({ 
        notes: [newNote, ...state.notes],
        selectedNoteId: newNote.id
      }));
      return newNote;
    } catch (error) {
      console.error("Store addNote Error:", error);
      set({ error: error.message });
    }
  },

  updateNote: async (id, noteData) => {
    try {
      let updatedNote;
      if (typeof window !== 'undefined' && window.electronAPI) {
        updatedNote = await window.electronAPI.notes.update(id, noteData);
      } else {
        const resp = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });
        updatedNote = await resp.json();
      }

      if (!updatedNote) throw new Error("Update failed: No data returned");

      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...updatedNote } : n)),
      }));
    } catch (error) {
      console.error("Store updateNote Error:", error, { id, noteData });
      set({ error: error.message });
    }
  },

  deleteNote: async (id, soft = true) => {
    if (soft) {
      // Clear category when moving to trash
      await get().updateNote(id, { deleted: true, categoryId: null });
    } else {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          await window.electronAPI.notes.delete(id);
        } else {
          await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        }
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
        }));
      } catch (error) {
        console.error("Store deleteNote Error:", error);
        set({ error: error.message });
      }
    }
  },

  restoreNote: async (id) => {
    await get().updateNote(id, { deleted: false });
  },

  permanentDeleteNote: async (id) => {
    await get().deleteNote(id, false);
  },

  // Category Actions
  addCategory: async (name, color) => {
    try {
      let newCategory;
      if (typeof window !== 'undefined' && window.electronAPI) {
        newCategory = await window.electronAPI.categories.create({ name, color });
      } else {
        const resp = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, color }),
        });
        newCategory = await resp.json();
      }

      if (!newCategory) throw new Error("Category creation failed");

      set((state) => ({ categories: [...state.categories, newCategory] }));
    } catch (error) {
      console.error("Store addCategory Error:", error);
      set({ error: error.message });
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      let updatedCategory;
      if (typeof window !== 'undefined' && window.electronAPI) {
        updatedCategory = await window.electronAPI.categories.update(id, categoryData);
      } else {
        const resp = await fetch(`/api/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
        updatedCategory = await resp.json();
      }

      if (!updatedCategory) throw new Error("Category update failed");

      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...updatedCategory } : c)),
      }));
    } catch (error) {
      console.error("Store updateCategory Error:", error);
      set({ error: error.message });
    }
  },

  deleteCategory: async (id) => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.categories.delete(id);
      } else {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      }
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        notes: state.notes.map(n => n.categoryId === id ? { ...n, categoryId: null } : n)
      }));
    } catch (error) {
      console.error("Store deleteCategory Error:", error);
      set({ error: error.message });
    }
  },

  // Filtering
  setActiveFilter: (filter) => set({ activeFilter: filter, selectedCategoryId: null, searchQuery: '' }),
  setSelectedCategory: (id) => set({ selectedCategoryId: id, activeFilter: 'category', searchQuery: '' }),

  getFilteredNotes: () => {
    const { notes, activeFilter, selectedCategoryId, searchQuery, sortOrder } = get();
    
    // 1. Apply Filtering
    let filtered = [];
    if (searchQuery.trim().length > 0) {
      // Global Search: Search across all notes
      const query = searchQuery.toLowerCase();
      filtered = notes.filter(n => 
        (n.title && n.title.toLowerCase().includes(query)) || 
        (n.content && n.content.toLowerCase().includes(query))
      );
    } else {
      // Normal filtering by view
      switch (activeFilter) {
        case 'favorites':
          filtered = notes.filter(n => n.favorite && !n.deleted);
          break;
        case 'deleted':
          filtered = notes.filter(n => n.deleted);
          break;
        case 'category':
          filtered = notes.filter(n => n.categoryId === selectedCategoryId && !n.deleted);
          break;
        default:
          filtered = notes.filter(n => !n.deleted && !n.categoryId);
          break;
      }
    }

    // 2. Apply Sorting
    filtered.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOrder === 'a-z') {
        const titleA = (a.title || 'Untitled').toLowerCase();
        const titleB = (b.title || 'Untitled').toLowerCase();
        return titleA.localeCompare(titleB);
      } else {
        // Default: 'newest'
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }
}));

export default useStore;
