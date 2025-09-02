// Definição dos tipos de dados para a lógica do servidor e cliente
export interface Participante {
  respostas: string[];
  pronto: boolean;
}

export interface EstadoParticipantes {
  prontos: number;
  aResponder: number;
}

// Definição da interface para o objeto de estado do servidor, incluindo os seus métodos.
export interface EstadoAplicacao {
  participantes: { [socketId: string]: Participante };
  hostSocketId: string | null;
  adicionarParticipante(id: string): void;
  removerParticipante(id: string): void;
  definirAnfitriao(id: string): boolean;
  obterTodasAsRespostas(): string[];
  obterEstadoParticipantes(): EstadoParticipantes;
  limparRespostas(): void;
}

// Definição da interface para o estado da aplicação do cliente.
export interface ClientState {
  minhasRespostas: string[];
  isReady: boolean;
}

// Tipos para os eventos Socket.IO para garantir a segurança de ponta a ponta
export interface ServerToClientEvents {
  isHost: () => void;
  hostAlreadyExists: () => void;
  estadoParticipantes: (estado: EstadoParticipantes) => void;
  atualizarContador: (num: number) => void;
  respostasReveladas: (respostas: string[]) => void;
  atualizarRespostasLive: (respostas: string[]) => void;
}

export interface ClientToServerEvents {
  registerAsHost: () => void;
  submeterResposta: (resposta: string) => void;
  removerResposta: (index: number) => void;
  participantePronto: () => void;
  cancelarPronto: () => void;
  revelarRespostas: () => void;
  limparRespostas: () => void;
}

// Tipos para a comunicação IPC do Electron
export interface IpcApi {
  isElectronHost: () => Promise<boolean>;
}
