export const EVENTS = {
  // Eventos do Cliente para o Servidor
  REGISTER_HOST: 'registerAsHost',
  SUBMIT_RESPONSE: 'submeterResposta',
  REMOVE_RESPONSE: 'removerResposta',
  PARTICIPANT_READY: 'participantePronto',
  CANCEL_READY: 'cancelarPronto',
  REVEAL_RESPONSES: 'revelarRespostas',
  CLEAR_RESPONSES: 'limparRespostas',
  MERGE_RESPONSES: 'fundirRespostas',
  TOGGLE_LIVE_MODE: 'alternarModoLive',

  // Eventos do Servidor para o Cliente
  // Evento para enviar/atualizar o contexto/pergunta atual
  SET_QUESTION: 'definirPergunta',
  UPDATE_QUESTION: 'atualizarPergunta',

  IS_HOST: 'isHost',
  HOST_EXISTS: 'hostAlreadyExists',
  UPDATE_PARTICIPANT_STATE: 'estadoParticipantes',
  UPDATE_RESPONSES: 'respostas',
  RESPONSES_REVEALED: 'respostasReveladas',
  LIVE_MODE_CHANGED: 'modoLiveAlterado',
} as const;
