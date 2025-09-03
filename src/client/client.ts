import { bindParticipantDOMEvents } from './components/participant-view';
import { bindHostDOMEvents } from './components/host-view';
import { SocketService, setupSocketListeners } from './services/socket';
import { UIController } from './services/ui';
import { EVENTS } from '../types/events';

/**
 * AppController serve como o ponto central de controlo do cliente,
 * mantendo um estado mínimo necessário para a orquestração.
 */
export const AppController = {
  isHost: false,
  isLiveMode: false,
  respostasLive: [] as string[],
  respostasReveladas: [] as string[],

  async init() {
    SocketService.init();
    setupSocketListeners();
    bindParticipantDOMEvents();
    bindHostDOMEvents();
    this.verificarModoAnfitriao();
    UIController.setRevealClearButtons(false);
  },

  async verificarModoAnfitriao() {
    const urlParams = new URLSearchParams(window.location.search);
    const isHostFromUrl = urlParams.has('host');

    let isElectronHost = false;
    if (window.agoraAPI?.isElectronHost) {
      try {
        isElectronHost = await window.agoraAPI.isElectronHost();
      } catch (e) {
        console.error('Erro ao verificar o modo anfitrião do Electron:', e);
      }
    }

    if (isHostFromUrl || isElectronHost) {
      SocketService.emit(EVENTS.REGISTER_HOST);
    }
  },
};

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});

