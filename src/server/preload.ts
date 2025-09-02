import { contextBridge, ipcRenderer } from 'electron';
import { IpcApi } from '../types/global-types';

// Expõe um objeto `agoraAPI` à janela do renderer (frontend) de forma segura.
const api: IpcApi = {
  isElectronHost: () => ipcRenderer.invoke('is-electron-host'),
};

contextBridge.exposeInMainWorld('agoraAPI', api);
