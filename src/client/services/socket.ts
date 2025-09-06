import { io, type Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../types/global-types';
import { EVENTS } from '../../types/events';
import {
  isHost,
  estadoParticipantes,
  respostas,
  isConnected,
  minhasRespostas,
  isReady,
  respostasReveladas,
  perguntaAtual,
  isLiveModeFromHost,
} from '../stores';

export const SocketService = {
  socket: null as Socket<ServerToClientEvents, ClientToServerEvents> | null,

  init() {
    console.log('🔌 Inicializando Socket.IO...');
    this.socket = io();
    setupSocketListeners();
  },

  emit<T extends keyof ClientToServerEvents>(
    evento: T,
    ...dados: Parameters<ClientToServerEvents[T]>
  ) {
    this.socket?.emit(evento, ...dados);
  },
};

export function setupSocketListeners() {
  if (!SocketService.socket) return;

  const { socket } = SocketService;

  socket.on('connect', () => {
    console.log('🔌 Socket conectado');
    isConnected.set(true);
  });
  socket.on('disconnect', () => {
    console.log('🔌 Socket desconectado');
    isConnected.set(false);
  });
  socket.on('connect_error', () => {
    isConnected.set(false);
  });

  socket.on(EVENTS.IS_HOST, () => {
    console.log('🎯 Recebido evento IS_HOST - Definindo como host');
    isHost.set(true);
  });

  socket.on(EVENTS.HOST_EXISTS, () => {
    // Em desenvolvimento, pode haver múltiplas conexões devido ao hot reload
    // If host exists, ensure this client is not marked as host.
    isHost.set(false);
    if (import.meta.env.DEV) {
      return;
    }
    document.body.innerHTML = '<h1>Já existe um anfitrião ativo.</h1>';
  });

  socket.on(EVENTS.UPDATE_PARTICIPANT_STATE, (estado) =>
    estadoParticipantes.set(estado)
  );
  socket.on(EVENTS.UPDATE_RESPONSES, (respostasArr) => {
    respostas.set(respostasArr);
    if (respostasArr.length === 0) {
      minhasRespostas.set([]);
      isReady.set(false);
      respostasReveladas.set(false);
    }
  });

  // Registrar o evento de atualização da pergunta usando a constante tipada
  socket.on(EVENTS.UPDATE_QUESTION, (pergunta: string) => {
    perguntaAtual.set(pergunta || '');
  });

  socket.on(EVENTS.RESPONSES_REVEALED, (respostas) => {
    console.log(
      '🎯 Recebido evento RESPONSES_REVEALED com respostas:',
      respostas
    );
    // Bloqueia participantes apenas se há respostas reveladas
    const shouldBlock = respostas && respostas.length > 0;
    respostasReveladas.set(shouldBlock);
  });

  socket.on(EVENTS.LIVE_MODE_CHANGED, (isLiveMode: boolean) => {
    console.log('🎯 Recebido evento LIVE_MODE_CHANGED:', isLiveMode);
    isLiveModeFromHost.set(isLiveMode);
  });
}
