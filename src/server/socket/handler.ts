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
    const estadoParticipantes = estadoAplicacao.obterEstadoParticipantes();
    io.emit(EVENTS.UPDATE_RESPONSES, estadoAplicacao.obterTodasAsRespostas());
    io.emit(EVENTS.UPDATE_PARTICIPANT_STATE, estadoParticipantes);
  };

  io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log('🔌 Nova conexão Socket.IO:', socket.id);
      console.log('🔌 URL de origem:', socket.handshake.headers.origin);
      console.log('🔌 Referer:', socket.handshake.headers.referer);
      
      socket.on(EVENTS.REGISTER_HOST, () => {
        console.log('👑 Tentativa de registro como host por:', socket.id);
        console.log('👑 Host atual:', estadoAplicacao.hostSocketId);
        if (estadoAplicacao.definirAnfitriao(socket.id)) {
          console.log('✅ Host registrado com sucesso:', socket.id);
          socket.emit(EVENTS.IS_HOST);
          emitirAtualizacoesGlobais();
        } else {
          console.log('❌ Host já existe, rejeitando:', socket.id);
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

        const respostasExistentes = participante.respostas.map((r) =>
          r.toLowerCase()
        );
        if (respostasExistentes.includes(respostaSanitizada.toLowerCase()))
          return;

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
          console.log('🎯 Host revelou respostas - Notificando todos os participantes');
          const respostas = estadoAplicacao.obterTodasAsRespostas();
          io.emit(EVENTS.RESPONSES_REVEALED, respostas);
          emitirAtualizacoesGlobais();
        }
      });

      socket.on(EVENTS.CLEAR_RESPONSES, () => {
        if (socket.id === estadoAplicacao.hostSocketId) {
          estadoAplicacao.limparRespostas();
          emitirAtualizacoesGlobais();
        }
      });

      socket.on('disconnect', () => {
        estadoAplicacao.removerParticipante(socket.id);
        emitirAtualizacoesGlobais();
      });
    }
  );
}
