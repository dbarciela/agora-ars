import type { Server, Socket } from 'socket.io';
import { EVENTS } from '../../types/events';

export function createServerApi(io: Server) {
  return {
    emitToAll<T extends any>(event: string, payload?: T) {
      if (payload === undefined) io.emit(event as any);
      else io.emit(event as any, payload);
    },

    emitToSocket<T extends any>(socket: Socket, event: string, payload?: T) {
      if (payload === undefined) socket.emit(event as any);
      else socket.emit(event as any, payload);
    },

    emitUpdateResponses(respostas: string[]) {
      this.emitToAll(EVENTS.UPDATE_RESPONSES, respostas);
    },

    emitUpdateParticipantState(estado: unknown) {
      this.emitToAll(EVENTS.UPDATE_PARTICIPANT_STATE, estado);
    },

    emitUpdateQuestion(pergunta: string) {
      this.emitToAll(EVENTS.UPDATE_QUESTION, pergunta);
    },

    emitResponsesRevealed(respostas: string[]) {
      this.emitToAll(EVENTS.RESPONSES_REVEALED, respostas);
    },

    emitLiveModeChanged(isLiveMode: boolean) {
      this.emitToAll(EVENTS.LIVE_MODE_CHANGED, isLiveMode);
    },

    emitIsHost(socket: Socket) {
      this.emitToSocket(socket, EVENTS.IS_HOST);
    },

    emitHostExists(socket: Socket) {
      this.emitToSocket(socket, EVENTS.HOST_EXISTS);
    },
  } as const;
}
