import type {
  Participante,
  EstadoParticipantes,
} from '../../types/global-types';

/**
 * Classe para gerir o estado da aplicação de forma centralizada e modular.
 * Encapsula toda a lógica de manipulação de participantes e respostas.
 * Implementada como um Singleton para garantir uma única instância de estado.
 */
class ApplicationState {
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
