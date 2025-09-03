// Definição dos tipos de dados para a lógica do servidor e cliente
export interface Participante {
  respostas: string[];
  pronto: boolean;
}

export interface EstadoParticipantes {
  prontos: number;
  aResponder: number;
}

// Tipos para os eventos Socket.IO para garantir a segurança de ponta a ponta
export interface ServerToClientEvents {
  isHost: () => void;
  hostAlreadyExists: () => void;
  estadoParticipantes: (estado: EstadoParticipantes) => void;
  respostas: (respostas: string[]) => void;
  respostasReveladas: (respostas: string[]) => void;
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
  getEnderecosRede: () => Promise<{ nome: string; endereco: string }[]>;
  windowClose: () => Promise<void>;
  windowToggleAlwaysOnTop: () => Promise<boolean>;
  autoResizeHeight: () => Promise<void>;
}
