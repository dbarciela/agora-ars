import { SocketService } from './socket';
import { EVENTS } from '../../types/events';
import { isHost } from '../stores';

export const ClientApi = {
  mergeResponses(respostaArrastada: string, respostaAlvo: string) {
    SocketService.emit(EVENTS.MERGE_RESPONSES, {
      respostaArrastada,
      respostaAlvo,
    });
  },

  setQuestion(valor: string) {
    SocketService.emit(EVENTS.SET_QUESTION, valor);
  },

  clearResponses() {
    SocketService.emit(EVENTS.CLEAR_RESPONSES);
  },

  revealResponses() {
    SocketService.emit(EVENTS.REVEAL_RESPONSES);
  },

  submitResponse(resposta: string) {
    SocketService.emit(EVENTS.SUBMIT_RESPONSE, resposta);
  },

  removeResponse(index: number) {
    SocketService.emit(EVENTS.REMOVE_RESPONSE, index);
  },

  setReady(pronto: boolean) {
    SocketService.emit(pronto ? EVENTS.PARTICIPANT_READY : EVENTS.CANCEL_READY);
  },

  toggleLiveMode(isLiveMode: boolean) {
    SocketService.emit(EVENTS.TOGGLE_LIVE_MODE, isLiveMode);
  },

  registerAsHost() {
    SocketService.emit(EVENTS.REGISTER_HOST);
  },
} as const;
