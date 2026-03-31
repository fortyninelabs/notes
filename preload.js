const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window Controls
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  onWindowMaximized: (cb) => ipcRenderer.on("window:maximized", cb),
  onWindowUnmaximized: (cb) => ipcRenderer.on("window:unmaximized", cb),

  // Database: Notes
  notes: {
    getAll: () => ipcRenderer.invoke('notes:get-all'),
    create: (noteData) => ipcRenderer.invoke('notes:create', noteData),
    update: (id, noteData) => ipcRenderer.invoke('notes:update', id, noteData),
    delete: (id) => ipcRenderer.invoke('notes:delete', id),
  },

  // Database: Categories
  categories: {
    getAll: () => ipcRenderer.invoke('categories:get-all'),
    create: (categoryData) => ipcRenderer.invoke('categories:create', categoryData),
    update: (id, categoryData) => ipcRenderer.invoke('categories:update', id, categoryData),
    delete: (id) => ipcRenderer.invoke('categories:delete', id),
  }
});
