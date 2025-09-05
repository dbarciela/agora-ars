import { writable, derived, type Writable } from 'svelte/store';
import type { EstadoParticipantes } from '../types/global-types';

// Estado da aplicação
export const isHost: Writable<boolean> = writable(false);
export const isLiveMode: Writable<boolean> = writable(false);
export const minhasRespostas: Writable<string[]> = writable([]);
export const isReady: Writable<boolean> = writable(false);
export const respostas: Writable<string[]> = writable([]);
export const respostasReveladas: Writable<boolean> = writable(false);

// Texto opcional com o contexto/pergunta atual (visível a todos os clientes)
export const perguntaAtual: Writable<string> = writable('');

// Estado do servidor recebido via Socket.IO
export const estadoParticipantes: Writable<EstadoParticipantes> = writable({
  prontos: 0,
  aResponder: 0,
});

// Stores derivadas para simplificar lógicas
export const totalRespostas = derived(
  respostas,
  ($respostas) => $respostas.length
);

export const totalParticipantes = derived(
  estadoParticipantes,
  ($estado) => $estado.prontos + $estado.aResponder
);

export const percentProntos = derived(
  [estadoParticipantes, totalParticipantes],
  ([$estado, $total]) =>
    $total === 0 ? 0 : Math.round(($estado.prontos / $total) * 100)
);

export const isConnected: Writable<boolean> = writable(true);
