<script lang="ts">
  import './participant.css';
  import { minhasRespostas, isReady, respostas, respostasReveladas } from '../stores';
  import { SocketService } from '../services/socket';
  import { EVENTS } from '../../types/events';

  let respostaInput = '';
  let feedbackMessage = '';
  let feedbackSuccess = true;
  let feedbackTimeout: number;

  // O input só fica desabilitado quando está pronto
  $: inputDisabled = $isReady;
  // O botão fica desabilitado apenas quando as respostas são reveladas
  $: buttonDisabled = $respostasReveladas;

  function mostrarFeedback(mensagem: string, sucesso = true) {
    clearTimeout(feedbackTimeout);
    feedbackMessage = mensagem;
    feedbackSuccess = sucesso;
    feedbackTimeout = window.setTimeout(() => {
      feedbackMessage = '';
    }, 2500);
  }

  function handleSubmeterResposta() {
    const resposta = respostaInput.trim();
    if (!resposta || $isReady) return;
    
    const respostaLower = resposta.toLowerCase();
    const jaExiste = $minhasRespostas.some(r => r.toLowerCase() === respostaLower);
    
    if (jaExiste) {
      mostrarFeedback('Já submeteu esta resposta.', false);
      return;
    }
    
    SocketService.emit(EVENTS.SUBMIT_RESPONSE, resposta);
    minhasRespostas.update(respostas => [...respostas, resposta]);
    respostaInput = '';
  }

  function handleRemoverResposta(index: number) {
    SocketService.emit(EVENTS.REMOVE_RESPONSE, index);
    minhasRespostas.update(respostas => respostas.filter((_, i) => i !== index));
  }

  function handleProntoClick() {
    if (!$isReady && respostaInput.trim().length > 0) {
      handleSubmeterResposta();
    }

    if ($minhasRespostas.length === 0) {
      mostrarFeedback('Por favor, submeta uma resposta antes de continuar.', false);
      return;
    }

    const novoEstadoPronto = !$isReady;
    SocketService.emit(novoEstadoPronto ? EVENTS.PARTICIPANT_READY : EVENTS.CANCEL_READY);
    isReady.set(novoEstadoPronto);
  }
</script>

<div id="participant-view">
  <div class="input-container">
    <input
      bind:value={respostaInput}
      type="text"
      placeholder="Escreva aqui..."
      autocomplete="off"
      disabled={inputDisabled}
      on:keydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmeterResposta(); } }}
    />
    <button class="submit-arrow" title="Submeter resposta" aria-label="Submeter resposta" on:click={handleSubmeterResposta} disabled={inputDisabled}>
      <i class="fa-solid fa-paper-plane"></i>
    </button>
  </div>
  
  {#if feedbackMessage}
    <p class="feedback" class:success={feedbackSuccess} class:error={!feedbackSuccess} style="opacity: 1;">
      {feedbackMessage}
    </p>
  {/if}

  <h3>As suas respostas</h3>
  <div id="minhas-respostas-container">
    {#if $minhasRespostas.length === 0}
      <p>As suas respostas aparecerão aqui.</p>
    {:else}
      {#each $minhasRespostas as resposta, idx}
        <div class="resposta-item">
          <span>{resposta}</span>
          {#if !$isReady}
            <button class="delete-icon" title="Apagar resposta" aria-label="Apagar resposta" on:click={() => handleRemoverResposta(idx)}>
              <i class="fa-solid fa-trash"></i>
            </button>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
  <button on:click={handleProntoClick} class:cancel-state={$isReady} disabled={buttonDisabled}>
    {$isReady ? 'Cancelar' : 'Pronto'}
  </button>
</div>
