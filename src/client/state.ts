import type { ClientState } from '../types/global-types';
import { UIController } from './services/ui';
import { handleRemoverResposta } from './components/participant-view';

/**
 * Armazena o estado da aplicação do lado do cliente.
 * - minhasRespostas: Array com as respostas submetidas pelo utilizador.
 * - isReady: Booleano que indica se o utilizador marcou o seu estado como "Pronto".
 */
export const state: ClientState = {
  minhasRespostas: [],
  isReady: false,
};

/**
 * Atualiza o estado local do participante e renderiza novamente a sua lista de respostas.
 * Esta função centraliza as mutações de estado do cliente.
 */
export function atualizarEstadoLocal(
  novasRespostas: string[],
  novoEstadoPronto: boolean
) {
  state.minhasRespostas = novasRespostas;
  state.isReady = novoEstadoPronto;

  UIController.setParticipantReadyState(state.isReady);
  UIController.renderizarMinhasRespostas(
    state.minhasRespostas,
    state.isReady,
    handleRemoverResposta // Passa a função de handler diretamente
  );
}
