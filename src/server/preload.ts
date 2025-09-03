import { contextBridge, ipcRenderer } from 'electron';
import type { IpcApi } from '../types/global-types';

const agoraAPI: IpcApi = {
  isElectronHost: () => ipcRenderer.invoke('is-electron-host'),
  getEnderecosRede: () => ipcRenderer.invoke('get-enderecos-rede'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowToggleAlwaysOnTop: () => ipcRenderer.invoke('window-toggle-always-on-top'),
  autoResizeHeight: () => ipcRenderer.invoke('auto-resize-height'),
};

contextBridge.exposeInMainWorld('agoraAPI', agoraAPI);

declare global {
  interface Window {
    // Informa ao TypeScript que o objeto `window` global
    // pode ter uma propriedade `agoraAPI` do tipo `IpcApi`.
    agoraAPI?: IpcApi;
  }
}
