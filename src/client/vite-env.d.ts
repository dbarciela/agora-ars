/// <reference types="svelte" />
/// <reference types="vite/client" />

import type { IpcApi } from '../types/global-types';

declare global {
  interface Window {
    agoraAPI?: IpcApi;
  }
}
