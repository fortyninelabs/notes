const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let mainWindow;

// Import Database (Must be in Main Process for Electron)
const db = require('./src/lib/db');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: "hidden",
    icon: path.join(__dirname, 'public/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Menüleiste unsichtbar machen
  mainWindow.setMenuBarVisibility(false);

  // DEV vs PROD
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // Standard Electron way to load a local file
    mainWindow.loadFile(path.join(__dirname, 'out/index.html'));
  }
}

app.whenReady().then(() => {
  // DB PATH wird in db.js bereits gehandelt, aber wir setzen sie hier für Konsistenz
  const userDataPath = app.getPath('userData');
  process.env.DB_PATH = path.join(userDataPath, 'notes.db');

  console.log("Electron userDataPath:", userDataPath);
  console.log("Electron DB PATH:", process.env.DB_PATH);

  // IPC Handlers for Database
  // Helper to convert Booleans to Integers for SQLite
  const sanitize = (obj) => {
    const result = { ...obj };
    for (const key in result) {
      if (typeof result[key] === 'boolean') result[key] = result[key] ? 1 : 0;
    }
    return result;
  };

  // Notes
  ipcMain.handle('notes:get-all', async () => {
    try {
      return db.prepare('SELECT * FROM notes ORDER BY updatedAt DESC').all();
    } catch (err) {
      console.error("[IPC Error] notes:get-all", err);
      throw err;
    }
  });

  ipcMain.handle('notes:create', async (event, noteData) => {
    try {
      const id = uuidv4();
      const sanitized = sanitize(noteData);
      const { title = 'Neue Notiz', content = '', categoryId = null, favorite = 0, deleted = 0 } = sanitized;
      
      console.log(`[IPC] Creating note ${id}`, sanitized);
      db.prepare('INSERT INTO notes (id, title, content, categoryId, favorite, deleted) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, title, content, categoryId, favorite, deleted);
      
      return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    } catch (err) {
      console.error("[IPC Error] notes:create", err);
      throw err;
    }
  });

  ipcMain.handle('notes:update', async (event, id, noteData) => {
    try {
      const sanitized = sanitize(noteData);
      const fields = Object.keys(sanitized);
      if (fields.length === 0) return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);

      const sets = fields.map(f => `${f} = ?`).join(', ');
      const values = Object.values(sanitized);
      
      console.log(`[IPC] Updating note ${id}`, sanitized);
      db.prepare(`UPDATE notes SET ${sets}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(...values, id);
      
      return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    } catch (err) {
      console.error("[IPC Error] notes:update", err, { id, noteData });
      throw err;
    }
  });

  ipcMain.handle('notes:delete', async (event, id) => {
    try {
      console.log(`[IPC] Permanent delete note ${id}`);
      return db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    } catch (err) {
      console.error("[IPC Error] notes:delete", err);
      throw err;
    }
  });

  // Categories
  ipcMain.handle('categories:get-all', async () => {
    try {
      return db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    } catch (err) {
      console.error("[IPC Error] categories:get-all", err);
      throw err;
    }
  });

  ipcMain.handle('categories:create', async (event, { name, color }) => {
    try {
      const id = uuidv4();
      console.log(`[IPC] Creating category ${id}`, { name, color });
      db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)')
        .run(id, name, color);
      return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    } catch (err) {
      console.error("[IPC Error] categories:create", err);
      throw err;
    }
  });

  ipcMain.handle('categories:update', async (event, id, categoryData) => {
    try {
      const { name, color } = categoryData;
      console.log(`[IPC] Updating category ${id}`, categoryData);
      db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ?')
        .run(name, color, id);
      return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    } catch (err) {
      console.error("[IPC Error] categories:update", err);
      throw err;
    }
  });

  ipcMain.handle('categories:delete', async (event, id) => {
    try {
      console.log(`[IPC] Deleting category ${id}`);
      // Also clear category for notes
      db.prepare('UPDATE notes SET categoryId = NULL WHERE categoryId = ?').run(id);
      return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    } catch (err) {
      console.error("[IPC Error] categories:delete", err);
      throw err;
    }
  });

  // Window Controls
  ipcMain.on("window:minimize", () => mainWindow.minimize());
  ipcMain.on("window:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      mainWindow.webContents.send("window:unmaximized");
    } else {
      mainWindow.maximize();
      mainWindow.webContents.send("window:maximized");
    }
  });
  ipcMain.on("window:close", () => mainWindow.close());

  // Menu Definition
  const template = [
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

