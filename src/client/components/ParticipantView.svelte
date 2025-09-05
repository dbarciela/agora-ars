<script lang="ts">
  import { toastStore } from '../stores/toastStore';

  let hasHadResponses = false;

  // Deteta quando o participante já submeteu respostas
  $: if ($minhasRespostas.length > 0) {
    hasHadResponses = true;
  }

  // Se o participante já tinha respostas e a lista fica vazia,
  // significa que o anfitrião limpou a sessão.
  $: if (hasHadResponses && $minhasRespostas.length === 0) {
    mostrarFeedback(
      'O anfitrião iniciou uma nova ronda. Pode submeter novas respostas.',
      true
    );
    hasHadResponses = false; // Reset para a próxima ronda
  }
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import './participant.css';
  import { minhasRespostas, isReady, respostas, respostasReveladas, perguntaAtual } from '../stores';
  import { SocketService } from '../services/socket';
  import { EVENTS } from '../../types/events';

  let respostaInput = '';


  // O input só fica desabilitado quando está pronto
  $: inputDisabled = $isReady;
  // O botão fica desabilitado apenas quando as respostas são reveladas
  $: buttonDisabled = $respostasReveladas;

  function handleEditarResposta(index: number) {
    if ($isReady) return;
    respostaInput = $minhasRespostas[index];
    handleRemoverResposta(index); // Remove a resposta antiga para ser submetida novamente
  }


  function mostrarFeedback(mensagem: string, sucesso = true) {
    if (sucesso) {
      toastStore.success(mensagem);
    } else {
      toastStore.error(mensagem);
    }
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
  {#if $perguntaAtual}
    <h2 class="pergunta-contexto">{$perguntaAtual}</h2>
  {/if}
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
  


  <h3>As suas respostas</h3>
  <div id="minhas-respostas-container">
    {#if $minhasRespostas.length === 0}
      <p>As suas respostas aparecerão aqui.</p>
    {:else}
      {#each $minhasRespostas as resposta, idx (resposta)}
        <div class="resposta-item" on:click={() => handleEditarResposta(idx)} title="Clique para editar" animate:flip={{ duration: 300 }} transition:slide>
          <span>{resposta}</span>
          {#if !$isReady}
            <button class="delete-icon" title="Apagar resposta" aria-label="Apagar resposta" on:click|stopPropagation={() => handleRemoverResposta(idx)}>
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
