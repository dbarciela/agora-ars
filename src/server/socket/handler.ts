import type { Server, Socket } from 'socket.io';
import { estadoAplicacao } from '../state/ApplicationState';
import { EVENTS } from '../../types/events';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../types/global-types';

function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  const emitirAtualizacoesGlobais = () => {
    const totalRespostas = estadoAplicacao.obterTodasAsRespostas().length;
    const estadoParticipantes = estadoAplicacao.obterEstadoParticipantes();
    io.emit(EVENTS.UPDATE_COUNTER, totalRespostas);
    io.emit(EVENTS.UPDATE_RESPONSES_LIVE, estadoAplicacao.obterTodasAsRespostas());
    io.emit(EVENTS.UPDATE_PARTICIPANT_STATE, estadoParticipantes);
  };

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on(EVENTS.REGISTER_HOST, () => {
      if (estadoAplicacao.definirAnfitriao(socket.id)) {
        socket.emit(EVENTS.IS_HOST);
        emitirAtualizacoesGlobais();
      } else {
        socket.emit(EVENTS.HOST_EXISTS);
      }
    });

    estadoAplicacao.adicionarParticipante(socket.id);
    emitirAtualizacoesGlobais();

    socket.on(EVENTS.SUBMIT_RESPONSE, (resposta) => {
      const participante = estadoAplicacao.participantes[socket.id];
      if (!participante || participante.pronto) return;
      if (typeof resposta !== 'string' || resposta.trim() === '') return;
      const respostaSanitizada = escapeHtml(resposta.trim());
      if (respostaSanitizada.length > 500) return;
      const respostasExistentes = new Set(
        participante.respostas.map((r) => r.toLowerCase())
      );
      if (respostasExistentes.has(respostaSanitizada.toLowerCase())) return;
      participante.respostas.push(respostaSanitizada);
      emitirAtualizacoesGlobais();
    });

    socket.on(EVENTS.REMOVE_RESPONSE, (index) => {
      const participante = estadoAplicacao.participantes[socket.id];
      if (!participante || participante.pronto) return;
      if (participante.respostas[index]) {
        participante.respostas.splice(index, 1);
        emitirAtualizacoesGlobais();
      }
    });

    socket.on(EVENTS.PARTICIPANT_READY, () => {
      if (estadoAplicacao.participantes[socket.id]) {
        estadoAplicacao.participantes[socket.id].pronto = true;
        emitirAtualizacoesGlobais();
      }
    });

    socket.on(EVENTS.CANCEL_READY, () => {
      if (estadoAplicacao.participantes[socket.id]) {
        estadoAplicacao.participantes[socket.id].pronto = false;
        emitirAtualizacoesGlobais();
      }
    });

    socket.on(EVENTS.REVEAL_RESPONSES, () => {
      if (socket.id === estadoAplicacao.hostSocketId) {
        io.emit(EVENTS.RESPONSES_REVEALED, estadoAplicacao.obterTodasAsRespostas());
      }
    });

    socket.on(EVENTS.CLEAR_RESPONSES, () => {
      if (socket.id === estadoAplicacao.hostSocketId) {
        estadoAplicacao.limparRespostas();
        io.emit(EVENTS.RESPONSES_REVEALED, []);
        emitirAtualizacoesGlobais();
      }
    });

    socket.on('disconnect', () => {
      estadoAplicacao.removerParticipante(socket.id);
      emitirAtualizacoesGlobais();
    });
  });
}
