import type {
  Participante,
  EstadoParticipantes,
} from '../../types/global-types';
import { logger } from '../utils/logger';

/**
 * Classe para gerir o estado da aplicação de forma centralizada e modular.
 * Encapsula toda a lógica de manipulação de participantes e respostas.
 * Implementada como um Singleton para garantir uma única instância de estado.
 */
class ApplicationState {
  // Texto opcional com o contexto ou pergunta atual mostrado a todos os participantes
  public perguntaAtual: string = '';
  // Estado do modo live
  public isLiveMode: boolean = false;

  definirPergunta(novaPergunta: string): void {
    this.perguntaAtual = novaPergunta;
  }

  alterarModoLive(novoModoLive: boolean): void {
    this.isLiveMode = novoModoLive;
  }

  fundirRespostas(respostaArrastada: string, respostaAlvo: string): void {
    logger.debug('Antes do merge', {
      respostaArrastada,
      respostaAlvo,
      participantes: Object.keys(this.participantes),
    });
    Object.entries(this.participantes).forEach(([id, p]) => {
      logger.debug(`participante`, { id, respostas: p.respostas });
    });
    let alterou = false;
    Object.values(this.participantes).forEach((p) => {
      const antes = [...p.respostas];
      p.respostas = p.respostas.map((r) =>
        r === respostaArrastada ? respostaAlvo : r
      );
      if (JSON.stringify(antes) !== JSON.stringify(p.respostas)) alterou = true;
    });
    logger.info(`Respostas fundidas`, { respostaArrastada, respostaAlvo });
    logger.debug('Depois do merge', {
      participantes: Object.keys(this.participantes),
    });
    Object.entries(this.participantes).forEach(([id, p]) => {
      logger.debug(`participante`, { id, respostas: p.respostas });
    });
    if (!alterou) {
      logger.info('Nenhuma resposta foi alterada no merge.');
    }
  }
  private static instance: ApplicationState;
  public participantes: { [socketId: string]: Participante } = {};
  public hostSocketId: string | null = null;

  private constructor() {}

  static getInstance(): ApplicationState {
    if (!ApplicationState.instance) {
      ApplicationState.instance = new ApplicationState();
    }
    return ApplicationState.instance;
  }

  adicionarParticipante(id: string): void {
    if (id !== this.hostSocketId && !this.participantes[id]) {
      this.participantes[id] = { respostas: [], pronto: false };
    }
  }

  removerParticipante(id: string): void {
    if (id === this.hostSocketId) {
      this.hostSocketId = null;
    } else if (this.participantes[id]) {
      delete this.participantes[id];
    }
  }

  definirAnfitriao(id: string): boolean {
    if (this.hostSocketId === null || this.hostSocketId === id) {
      this.hostSocketId = id;
      if (this.participantes[id]) {
        delete this.participantes[id];
      }
      return true;
    }
    return false;
  }

  obterTodasAsRespostas(): string[] {
    return Object.values(this.participantes).flatMap(
      (p: Participante) => p.respostas
    );
  }

  obterEstadoParticipantes(): EstadoParticipantes {
    const ids = Object.keys(this.participantes);
    const prontos = ids.filter((id) => this.participantes[id].pronto).length;
    const aResponder = ids.length - prontos;
    return { prontos, aResponder };
  }

  limparRespostas(): void {
    Object.values(this.participantes).forEach((p) => {
      p.respostas = [];
      p.pronto = false;
    });
  }
}

export const estadoAplicacao = ApplicationState.getInstance();
