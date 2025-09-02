export const EVENTS = {
  // Eventos do Cliente para o Servidor
  REGISTER_HOST: 'registerAsHost',
  SUBMIT_RESPONSE: 'submeterResposta',
  REMOVE_RESPONSE: 'removerResposta',
  PARTICIPANT_READY: 'participantePronto',
  CANCEL_READY: 'cancelarPronto',
  REVEAL_RESPONSES: 'revelarRespostas',
  CLEAR_RESPONSES: 'limparRespostas',

  // Eventos do Servidor para o Cliente
  IS_HOST: 'isHost',
  HOST_EXISTS: 'hostAlreadyExists',
  UPDATE_PARTICIPANT_STATE: 'estadoParticipantes',
  UPDATE_COUNTER: 'atualizarContador',
  RESPONSES_REVEALED: 'respostasReveladas',
  UPDATE_RESPONSES_LIVE: 'atualizarRespostasLive',
} as const;
