<script lang="ts">
  import { slide } from 'svelte/transition';
  import { isLiveModeFromHost, isReady, minhasRespostas, respostasReveladas } from '../stores';
  import { ClientApi } from '../services/socket-api';
  import './resposta-item.css';

  export let resposta: string;
  export let index: number;
  export let onEditStart: (respostaText: string) => void;

  function handleEdit() {
    if ($isReady) return;
    onEditStart(resposta);
    handleRemove(); // Remove a resposta antiga para ser submetida novamente
  }

  function handleRemove() {
    ClientApi.removeResponse(index);
    minhasRespostas.update(respostas => respostas.filter((_, i) => i !== index));
  }

  function handleRemoveClick(event: Event) {
    event.stopPropagation();
    handleRemove();
  }
</script>

<div 
  class="resposta-item" 
  on:click={handleEdit} 
  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEdit(); } }}
  title="Clique para editar" 
  transition:slide
  role="button"
  tabindex="0"
>
  <span>{resposta}</span>
  {#if !$isReady && !$respostasReveladas}
    <button 
      class="delete-icon" 
      title="Apagar resposta" 
      aria-label="Apagar resposta" 
      on:click={handleRemoveClick}
    >
      <i class="fa-solid fa-trash"></i>
    </button>
  {/if}
</div>
