import type { Server, Socket } from 'socket.io';
import { estadoAplicacao } from '../state/ApplicationState';
import { EVENTS } from '../../types/events';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../types/global-types';
import { logger } from '../utils/logger';
import { createServerApi } from '../services/server-api';

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
  const ServerApi = createServerApi(io);
  const emitirAtualizacoesGlobais = () => {
    const estadoParticipantes = estadoAplicacao.obterEstadoParticipantes();
    ServerApi.emitUpdateResponses(estadoAplicacao.obterTodasAsRespostas());
    ServerApi.emitUpdateParticipantState(estadoParticipantes);
  };

  io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      logger.info('Nova conexão Socket.IO', {
        socketId: socket.id,
        origin: socket.handshake.headers.origin,
        referer: socket.handshake.headers.referer,
      });

      socket.on(EVENTS.REGISTER_HOST, () => {
        logger.info('Tentativa de registro como host', {
          socketId: socket.id,
          currentHost: estadoAplicacao.hostSocketId,
        });
        if (estadoAplicacao.definirAnfitriao(socket.id)) {
          logger.info('Host registrado com sucesso', { socketId: socket.id });
          ServerApi.emitIsHost(socket);
          emitirAtualizacoesGlobais();
        } else {
          logger.info('Host já existe, rejeitando', { socketId: socket.id });
          ServerApi.emitHostExists(socket);
        }
      });

      estadoAplicacao.adicionarParticipante(socket.id);
      // Enviar pergunta atual ao cliente que se liga
      ServerApi.emitToSocket(
        socket,
        EVENTS.UPDATE_QUESTION,
        estadoAplicacao.perguntaAtual
      );
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
          logger.info(
            'Host revelou respostas - Notificando todos os participantes',
            { hostId: socket.id }
          );
          const respostas = estadoAplicacao.obterTodasAsRespostas();
          ServerApi.emitResponsesRevealed(respostas);
          emitirAtualizacoesGlobais();
        }
      });

      socket.on(EVENTS.CLEAR_RESPONSES, () => {
        if (socket.id === estadoAplicacao.hostSocketId) {
          estadoAplicacao.limparRespostas();
          emitirAtualizacoesGlobais();
        }
      });

      // Host define/atualiza a pergunta/contexto
      socket.on(EVENTS.SET_QUESTION, (pergunta) => {
        if (socket.id === estadoAplicacao.hostSocketId) {
          const perguntaSanitizada = escapeHtml((pergunta || '').trim()).slice(
            0,
            200
          );
          estadoAplicacao.definirPergunta(perguntaSanitizada);
          ServerApi.emitUpdateQuestion(estadoAplicacao.perguntaAtual);
        }
      });

      socket.on(
        EVENTS.MERGE_RESPONSES,
        ({ respostaArrastada, respostaAlvo }) => {
          if (socket.id === estadoAplicacao.hostSocketId) {
            estadoAplicacao.fundirRespostas(respostaArrastada, respostaAlvo);
            emitirAtualizacoesGlobais();
          }
        }
      );

      // Host altera o modo live
      socket.on(EVENTS.TOGGLE_LIVE_MODE, (isLiveMode: boolean) => {
        if (socket.id === estadoAplicacao.hostSocketId) {
          estadoAplicacao.alterarModoLive(isLiveMode);
          ServerApi.emitLiveModeChanged(isLiveMode);
          logger.info('Modo live alterado', { isLiveMode, hostId: socket.id });
        }
      });

      socket.on('disconnect', () => {
        estadoAplicacao.removerParticipante(socket.id);
        emitirAtualizacoesGlobais();
      });
    }
  );
}
