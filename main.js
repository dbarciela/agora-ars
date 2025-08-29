const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PORT } = require('./config');

// Informa o server.js que está a ser executado pelo Electron.
process.env.AGORA_MODE = 'electron';

// Inicia o servidor web e Socket.IO em segundo plano.
require('./server.js');

function createWindow() {
  const mainWindow = new BrowserWindow({
    resizable: true,
    webPreferences: {
      // --- MELHORIA DE SEGURANÇA ---
      // contextIsolation é ativado para isolar o contexto do frontend do backend.
      // nodeIntegration é desativado para impedir o acesso direto ao Node.js no frontend.
      // Um preload script é usado para expor funcionalidades de forma segura.
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, 
    }
  });
  mainWindow.setSize(480, 1024);
  mainWindow.setMinimumSize(480, 680);

  // Carrega o frontend a partir do servidor local.
  mainWindow.loadURL(`http://localhost:${PORT}`);
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

// Responde ao pedido do preload script para saber se é o anfitrião.
ipcMain.handle('is-electron-host', () => true);