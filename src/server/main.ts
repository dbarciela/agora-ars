import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { PORT } from './config';

// Inicia o servidor web e Socket.IO em segundo plano.
import './server';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.setSize(430, 600);
  mainWindow.setMinimumSize(430, 600);

  // Esconde a barra de menus
  mainWindow.setMenuBarVisibility(false);

  // Carrega o frontend a partir do servidor local.
  mainWindow.loadURL(`http://localhost:${PORT}/?host=true`);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Responde ao pedido do preload script
ipcMain.handle('is-electron-host', () => true);
