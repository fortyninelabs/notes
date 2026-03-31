You are an expert full‑stack engineer and product designer.  
Build a complete, production‑ready full‑stack Notes App with the following requirements.  
Use modern, clean, premium UX inspired by Notion, Craft, Bear, and macOS design principles.

====================================================
🔶 1) GENERAL PRODUCT REQUIREMENTS
====================================================

- The app is a 3‑column layout.
- All three columns have fixed widths.
- The layout must feel premium, minimal, and clean.
- Typography uses Inter.
- The editor is centered, with a white writing surface and subtle border.
- The app supports light mode first (dark mode optional later).

Columns:
1. Sidebar (left)
2. Note List (middle)
3. Editor (right)

====================================================
🔶 2) SIDEBAR REQUIREMENTS
====================================================

The sidebar contains two sections:

A) SYSTEM SECTIONS (fixed)
- Notes
- Favorites
- Deleted

B) USER CATEGORIES (dynamic)
- A section below system notes
- Users can create new categories
- Each category has:
  - name
  - color (used for badges)
  - id

Sidebar behavior:
- Clicking a system item filters notes
- Clicking a category filters notes
- Category creation uses a modal or inline input
- Categories are stored persistently

====================================================
🔶 3) NOTE LIST REQUIREMENTS
====================================================

Each note item must include:

- Title (first line of note)
- Subtext (first paragraph or truncated content)
- Bottom-left: creation date or last edited date
- Next to the date: category badge
  - badge shows category name
  - badge background uses category color
  - badge text is white or dark depending on contrast

Note list behavior:
- Clicking a note opens it in the editor
- Active note is highlighted
- Notes are sorted by last edited
- Deleted notes appear only in Deleted section
- Favorites appear only in Favorites section

====================================================
🔶 4) EDITOR REQUIREMENTS
====================================================

The editor must support:

- Real H1 title at the top (always enforced)
- Cursor automatically focuses the title when creating a new note
- Enter after title creates a paragraph
- Rich text formatting:
  - Bold
  - Italic
  - Heading 1
  - Heading 2
  - Bullet list
  - Numbered list
  - Code block
  - Text color
  - Text highlight color
- Category dropdown inside the toolbar
- Favorite button inside the toolbar
- Move to trash button inside the toolbar
- Undo / Redo

Editor UX:
- White writing surface
- Centered container
- Subtle border
- Generous padding
- Smooth cursor behavior
- No flickering or reinitialization issues

====================================================
🔶 5) TOOLBAR REQUIREMENTS
====================================================

Toolbar includes:

Left group:
- Bold
- Italic
- H1
- H2
- Bullet list
- Numbered list
- Code block

Middle group:
- Text color dots
- Highlight color dots

Right group:
- Category dropdown
- Favorite toggle
- Move to trash
- Undo
- Redo

Toolbar design:
- macOS‑inspired
- Subtle hover
- Active state with border + background
- Clean spacing

====================================================
🔶 6) DATA MODEL REQUIREMENTS
====================================================

Notes:
- id
- title
- content (HTML or JSON)
- categoryId
- favorite: boolean
- deleted: boolean
- createdAt
- updatedAt

Categories:
- id
- name
- color

====================================================
🔶 7) BACKEND REQUIREMENTS
====================================================

- Provide a simple backend (Node.js, Express, or Next.js API routes)
- CRUD for notes
- CRUD for categories
- Soft delete for notes
- Restore from trash
- Permanent delete
- Search endpoint (optional)
- Use SQLite or PostgreSQL

====================================================
🔶 8) FRONTEND REQUIREMENTS
====================================================

- Use React or Next.js
- Use Zustand or Redux for state
- Use Tiptap for the editor
- Use TailwindCSS for styling
- Use lucide-react for icons

====================================================
🔶 9) UX PRINCIPLES
====================================================

- Minimalistic
- Premium spacing
- macOS‑inspired
- Smooth transitions
- No clutter
- Everything feels intentional and calm

====================================================
🔶 10) DELIVERABLES
====================================================

Provide:

1. Full folder structure
2. All React components
3. All backend routes
4. Database schema
5. Zustand/Redux store
6. Full Editor implementation with Tiptap
7. Full Toolbar implementation
8. Sidebar + Categories implementation
9. Note list implementation
10. Styling (Tailwind)
11. Example seed data
12. Instructions to run the app

====================================================

Build the entire app end‑to‑end.

# Task Produktion
- [x] Prepare Project for Production Build <!-- id: 4 -->
    - [x] Update `next.config.mjs` for static export (relative paths, unoptimized images) <!-- id: 5 -->
    - [x] Migrate database logic from API routes to Electron IPC <!-- id: 6 -->
    - [x] Fix Dev & Prod Synchronization <!-- id: 12 -->
        - [x] Make `next.config.mjs` conditional (Dev vs Prod) <!-- id: 13 -->
        - [x] Add try/catch and logging to all IPC handlers in `main.js` <!-- id: 14 -->
        - [x] Explicitly handle Booelan-to-Integer for SQLite in IPC <!-- id: 15 -->
        - [x] Update `src/lib/store.js` with error handling for IPC calls <!-- id: 16 -->
    - [ ] Update `package.json` build and dist scripts <!-- id: 10 -->
    - [ ] Verify production build (npm run dist) <!-- id: 11 -->

ich habe ein logo für meine app erstellt. unter public die dateien erstellt die ich brauche. ich habe in package.json die befehle für die produktion hinzugefügt. ich habe in main.js die befehle für die produktion hinzugefügt. ich habe in preload.js die befehle für die produktion hinzugefügt. ich habe in next.config.mjs die befehle für die produktion hinzugefügt. Es kann sein das irgend etwas nicht korrekt ist. 
DIe app habe ich installiert aber die app bleibt weiss beim starten der app. ich glaube es ist das Problem weil im main.js:

====================================================
🔶 Version 1.0.0 - Production Build 30.3.2026
====================================================

Neue Anpassung:

## Notelist / Toolbar:
- [x] wenn notelist von rechts nach links verkleinert wird, sollte die toolbar auch kleiner werden und mit einem dropdown button die ganze toolbar anzeigen.
- [x] ich habe es in einem bild eingefügt. Outlook macht das auch so. sobald das Fenster nach links verkleinert wird toolbar weniger und zeigt alles mit einem dropdown button an.

## Settings
- [x] Im settingsscreen gibt gibt es "General" dort sollte man die Möglichkleit haben die app auf dark umzustellen
- [x] bitte button einfügen und beim klick light und dark mode zur Verfügung stellen

## Anpassung im Darkmode:
- [x] notelist sollte nicht ganz schwarzen Hintergrund haben. er soll die Hintergrundfarbe der Sidebar haben.
- [x] schrift farbe sollte wie die Schriftfarbe der NoteItems haben. Titel weiss, schrift die selbe wie in der schrift des Noteitem.
- [x] trennlinien zwischen sidebar, item und Notelist einbisschen dunkler light gray
- [x] text "Justnotes" entfernen
- [x] icon library von lucide react entfernen

# Anpassung 31.3.2026
## Notelist Editor
- [x] beim erstellen einer neuen notiz spring der Focus nicht auf die Notelist. 
- [x] der Titel soll weiss sein und mit dem ItemNote Titel aktualisieren
- bei jeder Note kann man den Titel nicht auswählen und text einfügen
- start writing texfeld im input sollte immer der Titel sein


# Prepare Language
Prepare my application so that all UI text is not hard‑coded in the source code.  
Instead, implement a clean internationalization (i18n) system with the following requirements:

## 1. Language files
- Create two language files: `de.json` and `en.json`.
- Each file should contain all UI strings as key–value pairs.
- Example:
  - `"newNote": "Neue Notiz"`
  - `"delete": "Löschen"`
  - `"favorites": "Favoriten"`

## 2. Centralized access
- The code must access all UI text through a single localization class or function, for example:
  `Strings.current.newNote`
- No UI text should appear directly in the code.

## 3. Language switching
- Add a “Language” setting in the app settings, similar to my Dark Mode toggle.
- The user should be able to switch between German and English.
- The language change should apply immediately without restarting the app.
- Default behavior: use the system language.

## 4. Architecture
- All code, variables, classes, and functions must remain in English.
- Only UI text comes from the localization files.
- The structure must allow adding more languages later without refactoring.

## 5. Dark Mode reference
- Implement the language toggle using the same pattern as my Dark Mode setting (local preference, instant update).

**Goal:**  
Ship version 1.0.0 with German UI, but with full technical support for multilingual UI so that English can be added easily in a future update.
