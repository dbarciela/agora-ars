import { io, type Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../types/global-types';
import { UIController } from './ui';
import { state, atualizarEstadoLocal } from '../state';
import { AppController } from '../client';
import { EVENTS } from '../../types/events';

/**
 * SocketService gere a instância do socket e o envio de eventos para o servidor.
 */
export const SocketService = {
  socket: null as Socket<ServerToClientEvents, ClientToServerEvents> | null,

  init() {
    this.socket = io();
  },

  emit<T extends keyof ClientToServerEvents>(
    evento: T,
    ...dados: Parameters<ClientToServerEvents[T]>
  ) {
    this.socket?.emit(evento, ...dados);
  },
};

/**
 * Configura todos os listeners para eventos recebidos do servidor.
 */
export function setupSocketListeners() {
  if (!SocketService.socket) return;

  const { socket } = SocketService;

  socket.on('connect', () => UIController.updateConnectionStatus(true));
  socket.on('disconnect', () => UIController.updateConnectionStatus(false));
  socket.on('connect_error', () => UIController.updateConnectionStatus(false));

  socket.on(EVENTS.IS_HOST, () => {
    AppController.isHost = true;
    UIController.mostrarVistaAnfitriao();
    UIController.setRevealClearButtons(false);
  });

  socket.on(EVENTS.HOST_EXISTS, () => {
    document.body.innerHTML = '<h1>Já existe um anfitrião ativo.</h1>';
  });

  socket.on(EVENTS.UPDATE_PARTICIPANT_STATE, (estado) => {
    UIController.atualizarEstadoParticipantes(estado);
  });

  socket.on(EVENTS.UPDATE_COUNTER, (num) => {
    UIController.atualizarContador(num);
  });

  socket.on(EVENTS.UPDATE_RESPONSES_LIVE, (respostas: string[]) => {
    AppController.respostasLive = respostas;
    if (AppController.isLiveMode) {
      UIController.mostrarRespostasReveladas(AppController.respostasLive);
    }
  });

  socket.on(EVENTS.RESPONSES_REVEALED, (respostas) => {
    UIController.mostrarRespostasReveladas(respostas);
    UIController.setRevealClearButtons(respostas.length > 0);

    // Se não for anfitrião, bloqueia/desbloqueia controlos
    if (!AppController.isHost) {
      UIController.setParticipantControls(respostas.length > 0);
    }
    
    // Se as respostas foram limpas, reinicia o estado local do participante
    if (respostas.length === 0) {
      atualizarEstadoLocal([], false);
    }
    
    // Limpa as respostas em tempo real ao revelar as oficiais
    AppController.respostasLive = [];
  });
}
