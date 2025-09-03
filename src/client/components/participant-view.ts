import { SocketService } from '../services/socket';
import { UIController } from '../services/ui';
import { state, atualizarEstadoLocal } from '../state';
import { EVENTS } from '../../types/events';

export function handleSubmeterResposta() {
  const resposta = UIController.obterValorInputResposta();
  if (resposta && !state.isReady) {
    if (state.minhasRespostas.includes(resposta)) {
      UIController.mostrarFeedback('Já submeteu esta resposta.', false);
      return;
    }
    SocketService.emit(EVENTS.SUBMIT_RESPONSE, resposta);
    const novasRespostas = [...state.minhasRespostas, resposta];
    atualizarEstadoLocal(novasRespostas, state.isReady);
    UIController.limparInputResposta();
  }
}

export function handleRemoverResposta(index: number) {
  SocketService.emit(EVENTS.REMOVE_RESPONSE, index);
  const novasRespostas = state.minhasRespostas.filter((_, i) => i !== index);
  atualizarEstadoLocal(novasRespostas, state.isReady);
}

export function handleProntoClick() {
  if (!state.isReady && UIController.obterValorInputResposta().length > 0) {
    handleSubmeterResposta();
  }

  // se não houver respostas temos de devolver erro para o user
  if (state.minhasRespostas.length === 0) {
    UIController.mostrarFeedback('Por favor, submeta uma resposta antes de continuar.', false);
    return;
  }

  const novoEstadoPronto = !state.isReady;
  if (novoEstadoPronto) {
    SocketService.emit(EVENTS.PARTICIPANT_READY);
  } else {
    SocketService.emit(EVENTS.CANCEL_READY);
  }
  atualizarEstadoLocal(state.minhasRespostas, novoEstadoPronto);
}

/**
 * Associa os eventos do DOM aos seus respetivos handlers para a vista de participante.
 */
export function bindParticipantDOMEvents() {
  UIController.elements.respostaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmeterResposta();
    }
  });

  UIController.elements.submitBtn.addEventListener(
    'click',
    handleSubmeterResposta
  );
  UIController.elements.prontoBtn.addEventListener('click', handleProntoClick);
}
