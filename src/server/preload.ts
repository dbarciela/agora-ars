import type { IpcApi } from '../types/global-types';

declare global {
  interface Window {
    // Informa ao TypeScript que o objeto `window` global
    // pode ter uma propriedade `agoraAPI` do tipo `IpcApi`.
    agoraAPI?: IpcApi;
  }
}
