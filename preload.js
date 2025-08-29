const { contextBridge, ipcRenderer } = require('electron');

// Expõe um objeto `agoraAPI` à janela do renderer (frontend) de forma segura.
contextBridge.exposeInMainWorld('agoraAPI', {
  // Expõe uma função que invoca o evento 'is-electron-host' no processo principal.
  // Isto permite que o cliente verifique se está a ser executado no modo anfitrião do Electron.
  isElectronHost: () => ipcRenderer.invoke('is-electron-host'),
});