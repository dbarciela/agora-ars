import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as os from 'os';
import { PORT, VITE_DEV_PORT } from './config';
import { logger } from './utils/logger';

// Inicia o servidor web e Socket.IO em segundo plano.
import './server';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    resizable: true,
    frame: false, // Remove a moldura da janela
    transparent: true, // Volta para transparente para semitransparência
    backgroundColor: 'rgba(255,255,255,0)', // Fundo mais transparente (85% opaco)
    width: 430,
    roundedCorners: true,
    height: 500, // Altura inicial maior
    minWidth: 350,
    minHeight: 500,
    useContentSize: true, // Usa o tamanho do conteúdo
    center: true, // Centralizar a janela
    x: undefined, // Deixar o Electron escolher a posição inicial
    y: undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      zoomFactor: 1.0, // Zoom inicial
    },
  });

  // Carrega o frontend a partir do servidor local.
  const isDev = process.env.NODE_ENV === 'development';
  const url = isDev
    ? `http://localhost:${VITE_DEV_PORT}/?host=true`
    : `http://localhost:${PORT}/?host=true`;

  logger.info(`Carregando URL no Electron: ${url}`, { isDev, VITE_DEV_PORT });

  mainWindow.loadURL(url);

  // Ativar zoom após carregar
  mainWindow.webContents.once('did-finish-load', () => {
    if (!mainWindow) return;
    // Permitir zoom explicitamente
    mainWindow.webContents.setZoomLevel(0); // Reset para zoom padrão
  });

  // Abrir dev tools automaticamente em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Habilitar zoom básico com teclado
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key === '0') {
      mainWindow?.webContents.setZoomLevel(0);
    }
    if (input.control && (input.key === '=' || input.key === '+')) {
      const currentZoom = mainWindow?.webContents.getZoomLevel() || 0;
      mainWindow?.webContents.setZoomLevel(currentZoom + 0.5);
    }
    if (input.control && input.key === '-') {
      const currentZoom = mainWindow?.webContents.getZoomLevel() || 0;
      mainWindow?.webContents.setZoomLevel(currentZoom - 0.5);
    }
  });

  // Adicionar área de redimensionamento invisível e habilitar zoom com scroll wheel
  mainWindow.webContents.once('dom-ready', () => {
    if (!mainWindow) return;

    mainWindow.webContents.insertCSS(`
      body {
        box-sizing: border-box;
      }
      body:hover {
        border-color: rgba(0, 123, 255, 0.3);
      }
    `);

    // Habilitar zoom com Ctrl + roda do rato
    mainWindow.webContents.executeJavaScript(`
      let currentZoom = 1.0;
      const MIN_ZOOM = 0.5;
      const MAX_ZOOM = 3.0;
      const ZOOM_STEP = 0.1;
      
      document.addEventListener('wheel', (event) => {
        if (event.ctrlKey) {
          event.preventDefault();
          
          if (event.deltaY < 0) {
            // Zoom in
            currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
          } else {
            // Zoom out
            currentZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
          }
          
          document.body.style.zoom = currentZoom;
          // keep a lightweight debug log in renderer context
          console.log('🔍 Zoom alterado para:', Math.round(currentZoom * 100) + '%');
        }
      }, { passive: false });
      
      // Suporte para Ctrl + 0 (reset zoom)
      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === '0') {
          event.preventDefault();
          currentZoom = 1.0;
          document.body.style.zoom = currentZoom;
          console.log('🔍 Zoom resetado para: 100%');
        }
      });
    `);
  });

  // Handler para novas janelas (popups) abrirem sem frame
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('/info.html')) {
      // Ou qualquer condição para filtrar
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          frame: true, // Mantém a barra de título nativa
          menuBarVisible: false, // Remove a barra de menu (File, Edit, etc.)
          width: 570,
          height: 700,
          resizable: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        },
      };
    }
    return { action: 'deny' }; // Bloquear outras se necessário
  });
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

// Controles de janela personalizados
ipcMain.handle('window-close', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.close();
  }
});

ipcMain.handle('window-toggle-always-on-top', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    const isAlwaysOnTop = focusedWindow.isAlwaysOnTop();
    focusedWindow.setAlwaysOnTop(!isAlwaysOnTop);
    return !isAlwaysOnTop;
  }
  return false;
});

//TODO Atualizar altura da janela quando há mudanças nas respostas
ipcMain.handle('auto-resize-height', async (event) => {});
