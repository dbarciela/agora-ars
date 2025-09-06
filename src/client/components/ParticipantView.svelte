<script lang="ts">
  import { toastStore } from '../stores/toastStore';
  import { flip } from 'svelte/animate';
  import './participant.css';
  import { minhasRespostas, isReady, respostasReveladas, perguntaAtual, isLiveModeFromHost } from '../stores';
  import { ClientApi } from '../services/socket-api';
  import RespostaItem from './RespostaItem.svelte';

  let respostaInput = '';
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

  // O input fica desabilitado quando está pronto OU quando respostas foram reveladas (exceto em modo live)
  $: inputDisabled = $isReady || (!$isLiveModeFromHost && $respostasReveladas);
  // O botão fica desabilitado quando as respostas são reveladas, EXCETO se estiver em modo live
  $: buttonDisabled = !$isLiveModeFromHost && $respostasReveladas;

  function handleEditStart(respostaText: string) {
    respostaInput = respostaText;
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

    ClientApi.submitResponse(resposta);
    minhasRespostas.update(respostas => [...respostas, resposta]);
    respostaInput = '';
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
    ClientApi.setReady(novoEstadoPronto);
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
        <div animate:flip={{ duration: 300 }}>
          <RespostaItem 
            {resposta}
            index={idx}
            onEditStart={handleEditStart}
          />
        </div>
      {/each}
    {/if}
  </div>
  <button on:click={handleProntoClick} class:cancel-state={$isReady} disabled={buttonDisabled}>
    {$isReady ? 'Cancelar' : 'Pronto'}
  </button>
</div>
