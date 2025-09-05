<script lang="ts">
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import './host.css';
  import {
    estadoParticipantes,
    totalRespostas,
    respostas,
    isLiveMode,
    totalParticipantes,
    percentProntos,
    respostasReveladas,
  } from '../stores';
  import { SocketService } from '../services/socket';
  import { EVENTS } from '../../types/events';
  import { onMount } from 'svelte';

  let ordenarPor = 'popularidade'; // 'popularidade' ou 'alfabetica'
  let isElectron = false;
  let isAlwaysOnTop = false;
  let respostaDestacada = '';
  let perguntaInput = '';

  // Verificar se está rodando no Electron
  onMount(async () => {
    if (window.agoraAPI) {
      try {
        isElectron = await window.agoraAPI.isElectronHost();
        if (isElectron) {
          document.body.classList.add('electron-host');
          // Auto-resize inicial após carregamento completo
          setTimeout(() => {
            if (window.agoraAPI?.autoResizeHeight) {
              console.log('🔧 Initial resize on mount');
              window.agoraAPI.autoResizeHeight();
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Erro ao verificar Electron:', error);
        isElectron = false;
      }
    }
  });

  // Funções para controlar a janela
  function closeWindow() {
    if (window.agoraAPI) {
      window.agoraAPI.windowClose();
    }
  }

  async function toggleAlwaysOnTop() {
    if (window.agoraAPI) {
      isAlwaysOnTop = await window.agoraAPI.windowToggleAlwaysOnTop();
    }
  }

  function handleInfoButtonClick() {
    const popup = window.open(
      '/info.html',
      'infoWindow',
      'width=800,height=600,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no'
    );

    if (popup) {
      popup.focus();
    } else {
      // Fallback se popup for bloqueado
      window.open('/info.html', '_blank');
    }
  }

  $: mostrarBotaoLimpar =
    ($isLiveMode && $estadoParticipantes.prontos === $totalParticipantes) ||
    (!$isLiveMode && $respostasReveladas);

  $: respostasParaMostrar =
    $isLiveMode || $respostasReveladas ? $respostas : [];
  $: contagemRespostas = respostasParaMostrar.reduce(
    (acc: { [key: string]: number }, resposta: string) => {
      const respostaNormalizada = resposta.trim();
      acc[respostaNormalizada] = (acc[respostaNormalizada] || 0) + 1;
      return acc;
    },
    {}
  );
  $: respostasOrdenadas = [...Object.entries(contagemRespostas)].sort(
    (a, b) => {
      if (ordenarPor === 'popularidade') {
        // Sort by count descending, then alphabetically ascending
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0], 'pt', { sensitivity: 'base' });
      }
      // Alphabetical order
      return a[0].localeCompare(b[0], 'pt', { sensitivity: 'base' });
    }
  );

  // Auto-resize sempre que o array de respostas original muda (modo live)
  $: if (isElectron && $respostas && $respostas.length > 0) {
    setTimeout(() => {
      if (window.agoraAPI?.autoResizeHeight) {
        console.log(
          `🔧 Resize triggered by $respostas change: ${$respostas.length} respostas`
        );
        window.agoraAPI.autoResizeHeight();
      }
    }, 300);
  }

  // Auto-resize altura quando revelamos respostas (só no Electron)
  $: if (isElectron && !$isLiveMode && respostasParaMostrar.length > 0) {
    setTimeout(() => {
      if (window.agoraAPI?.autoResizeHeight) {
        console.log(
          `🔧 Resize triggered by reveal: ${respostasParaMostrar.length} respostas mostradas`
        );
        window.agoraAPI.autoResizeHeight();
      }
    }, 300);
  }

  // --- Drag-and-Drop Nativo ---
  type RespostaDndItem = { id: string; resposta: string; contagem: number };
  $: dndItems = respostasOrdenadas
    .filter(([resposta]) => typeof resposta === 'string' && resposta.trim() !== '')
    .map(([resposta, contagem]) => ({ id: resposta, resposta, contagem }));

  let draggedItemId: string | null = null;
  let dragOverId: string | null = null;

  function handleDragStart(event: DragEvent, item: RespostaDndItem) {
    event.dataTransfer!.setData('text/plain', item.id);
    draggedItemId = item.id;
  }
  function handleDragOver(event: DragEvent) { event.preventDefault(); }
  function handleDragEnter(targetItem: RespostaDndItem) { if (draggedItemId !== targetItem.id) dragOverId = targetItem.id; }
  function handleDragLeave(targetItem: RespostaDndItem) { if (dragOverId === targetItem.id) dragOverId = null; }
  function handleDrop(event: DragEvent, targetItem: RespostaDndItem) {
    event.preventDefault();
    const respostaArrastada = event.dataTransfer!.getData('text/plain');
    const respostaAlvo = targetItem.id;
    draggedItemId = null;
    dragOverId = null;
    if (respostaArrastada && respostaAlvo && respostaArrastada !== respostaAlvo) {
      SocketService.emit(EVENTS.MERGE_RESPONSES, { respostaArrastada, respostaAlvo });
    }
  }
  function handleDragEnd() { draggedItemId = null; dragOverId = null; }

  // --- Handlers de Ações ---
  function handleToggleLive() {
    isLiveMode.update((v) => !v);
    // Não fazer auto-resize aqui - será feito automaticamente pelo reactive statement
  }

  function handleRevealClick() {
    if (!$isLiveMode) {
      // Enviar evento para o servidor para notificar participantes
      SocketService.emit(EVENTS.REVEAL_RESPONSES);
      // Ao revelar respostas, limpar também o contexto/pergunta atual
      SocketService.emit(EVENTS.SET_QUESTION, '');
      perguntaInput = '';
      console.log('🎯 HostView - Enviando REVEAL_RESPONSES e limpando pergunta atual');
      // Auto-resize será feito automaticamente quando respostasReveladas mudar
    }
    // Em modo live, não faz nada
  }

  function handleNextQuestionClick() {
    // Antes de começar a próxima pergunta, submeter o texto atual como pergunta/contexto
    const valor = (perguntaInput || '').trim();
    SocketService.emit(EVENTS.SET_QUESTION, valor);
    // Limpar respostas e estado local de revelação
    respostasReveladas.set(false);
    SocketService.emit(EVENTS.CLEAR_RESPONSES);
    console.log('🎯 HostView - Próxima pergunta: submetida pergunta e limpadas respostas');
  }

  function handleDestacar(resposta: string) {
    respostaDestacada = respostaDestacada === resposta ? '' : resposta;
  }

  function handleDefinirPergunta() {
    const valor = (perguntaInput || '').trim();
    SocketService.emit(EVENTS.SET_QUESTION, valor);
  }
</script>

<div id="host-view">
  <!-- Controles de janela -->
  <div class="electron-controls">
    <div class="window-buttons left">
      <button
        class="window-btn help"
        title="Informação de Acesso"
        aria-label="Informação de Acesso"
        on:click={handleInfoButtonClick}
      >
        <i class="fas fa-question"></i>
      </button>
      <button
        class="window-btn eye"
        class:active={$isLiveMode}
        on:click={handleToggleLive}
        title="Modo ao vivo"
        aria-label="Modo ao vivo"
      >
        <i class="fas fa-eye"></i>
      </button>
    </div>
    {#if isElectron}
      <div class="drag-area">
        <i class="fas fa-bars"></i>
      </div>
      <div class="window-buttons right">
        <button
          class="window-btn pin"
          class:active={isAlwaysOnTop}
          on:click={toggleAlwaysOnTop}
          title="Manter sempre visível"
          aria-label="Manter sempre visível"
        >
          <i class="fas fa-thumbtack"></i>
        </button>
        <button class="window-btn close" on:click={closeWindow} title="Fechar" aria-label="Fechar">
          <i class="fas fa-times"></i>
        </button>
      </div>
    {/if}
  </div>

  <p>
    Você é o anfitrião. Aguarde as submissões e revele quando estiver pronto.
  </p>

  <!-- Campo discreto para definir o contexto/pergunta atual (estilo semelhante ao participante) -->
  <div class="pergunta-container" style="margin: 8px 0;">
    <div class="input-container">
      <input
        type="text"
        bind:value={perguntaInput}
        placeholder="Contexto / pergunta (opcional)"
        autocomplete="off"
        on:keydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleDefinirPergunta(); } }}
      />
      <button class="submit-arrow" title="Definir pergunta" aria-label="Definir pergunta" on:click={handleDefinirPergunta}>
        <i class="fa-solid fa-pen"></i>
      </button>
    </div>
  </div>

  {#if mostrarBotaoLimpar}
    <button
      id="reveal-btn"
      class="next-btn"
  on:click={handleNextQuestionClick}
    >
      <span class="reveal-btn-text">Próxima Pergunta</span>
    </button>
  {:else}
    <button
      id="reveal-btn"
      on:click={!$isLiveMode && !$respostasReveladas
        ? handleRevealClick
        : undefined}
      disabled={$totalRespostas === 0}
    >
      <div
        class="reveal-btn-fill"
        style:width="{$percentProntos}%"
        style:background-color={$percentProntos === 100 ? '#28a745' : '#ffc107'}
      ></div>
      <span
        class="reveal-btn-text"
        style:color={$percentProntos === 100 ? 'white' : '#333'}
      >
        {#if $totalParticipantes === 0}
          A aguardar...
        {:else if $estadoParticipantes.prontos < $totalParticipantes}
          Prontos: {$estadoParticipantes.prontos} de {$totalParticipantes}
        {:else}
          Revelar Respostas
        {/if}
      </span>
    </button>
  {/if}

  <h2 id="contador-respostas" style="margin: 0;">
    Respostas Recebidas: {$totalRespostas}
  </h2>

  <div id="respostas-container" style="position: relative;">
    <button
      class="sort-icon-btn"
      title={ordenarPor === 'alfabetica'
        ? 'Ordenar por Popularidade'
        : 'Ordenar Alfabeticamente'}
      on:click={() =>
        (ordenarPor =
          ordenarPor === 'alfabetica' ? 'popularidade' : 'alfabetica')}
      aria-label={ordenarPor === 'alfabetica'
        ? 'Ordenar por Popularidade'
        : 'Ordenar Alfabeticamente'}
    >
      {#if ordenarPor === 'alfabetica'}
        <i class="fa-solid fa-arrow-up-wide-short"></i>
      {:else}
        <i class="fas fa-arrow-up-a-z"></i>
      {/if}
    </button>

    {#if respostasParaMostrar.length === 0}
      <p>As respostas aparecerão aqui quando as revelar.</p>
    {:else}
      <div style="min-height: 40px;">
        {#each dndItems as item (item.id)}
      <div
            class="resposta-grafico-item"
        animate:flip={{ duration: 300 }}
        transition:slide
            class:is-dragging={draggedItemId === item.id}
        class:is-dragged-over={dragOverId === item.id}
        class:destacada={item.resposta === respostaDestacada}
            id={item.id}
            role="listitem"
        draggable={$isLiveMode || $respostasReveladas}
        on:click={() => handleDestacar(item.resposta)}
            on:dragstart={(e) => handleDragStart(e, item)}
            on:dragover={handleDragOver}
            on:dragenter={() => handleDragEnter(item)}
            on:dragleave={() => handleDragLeave(item)}
            on:drop={(e) => handleDrop(e, item)}
            on:dragend={handleDragEnd}
          >
            <div class="barra-container">
              <div
                class="barra-preenchimento"
                style="width: {(item.contagem / respostasParaMostrar.length) * 100}%"
              ></div>
              <span class="resposta-texto">{item.resposta}</span>
            </div>
            <span class="resposta-contagem">{item.contagem}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

