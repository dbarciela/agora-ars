<script lang="ts">
  import './respostas.css';
  import { ClientApi } from '../services/socket-api';
  import { toastStore } from '../stores/toastStore';

  // Simplified props interface - only what's actually needed
  export let totalRespostas: number = 0;
  export let respostasParaMostrar: Array<any> = [];
  export let isLiveMode: boolean = false;
  export let respostasReveladas: boolean = false;

  // Internal state management - component owns all its behavior
  let ordenarPor: string = 'popularidade';
  let respostasDestacadas: string[] = [];
  let respostaDestacada: string = '';
  
  // DnD state
  let draggedItemId: string | null = null;
  let dragOverId: string | null = null;

  // DnD handlers
  function onDragStart(e: DragEvent, item: any) {
    e.dataTransfer!.setData('text/plain', item.id);
    draggedItemId = item.id;
  }
  function onDragOver(e: DragEvent) { e.preventDefault(); }
  function onDragEnter(item: any) { if (draggedItemId !== item.id) dragOverId = item.id; }
  function onDragLeave(item: any) { if (dragOverId === item.id) dragOverId = null; }
  function onDrop(e: DragEvent, targetItem: any) {
    e.preventDefault();
    const respostaArrastada = e.dataTransfer!.getData('text/plain');
    const respostaAlvo = targetItem.id;
    draggedItemId = null;
    dragOverId = null;
    if (respostaArrastada && respostaAlvo && respostaArrastada !== respostaAlvo) {
      ClientApi.mergeResponses(respostaArrastada, respostaAlvo);
    }
  }
  function onDragEnd() { draggedItemId = null; dragOverId = null; }

  // Simplified ordering toggle
  function toggleOrdenacao() {
    ordenarPor = ordenarPor === 'popularidade' ? 'alfabetica' : 'popularidade';
  }

  // Multi-selection handler
  function handleInternalDestacar(resposta: string, isCtrlClick: boolean = false) {
    if (isCtrlClick) {
      // Ctrl+click: toggle multiple selections
      if (respostasDestacadas.includes(resposta)) {
        respostasDestacadas = respostasDestacadas.filter(r => r !== resposta);
      } else {
        respostasDestacadas = [...respostasDestacadas, resposta];
      }
      // Clear single selection when using multiple selection
      respostaDestacada = '';
    } else {
      // Normal click: single selection
      respostaDestacada = respostaDestacada === resposta ? '' : resposta;
      // Clear multiple selections when using single selection
      respostasDestacadas = [];
    }
  }

  // Derived state - consolidated ordering logic
  $: contagemRespostas = respostasParaMostrar.reduce(
    (acc: { [key: string]: number }, resposta: any) => {
      const respostaNormalizada = (resposta || '').toString().trim();
      if (!respostaNormalizada) return acc;
      acc[respostaNormalizada] = (acc[respostaNormalizada] || 0) + 1;
      return acc;
    },
    {}
  );

  $: respostasOrdenadas = [...Object.entries(contagemRespostas)].sort((a, b) => {
    if (ordenarPor === 'popularidade') {
      if (b[1] !== a[1]) return (b[1] as number) - (a[1] as number);
      return (a[0] as string).localeCompare(b[0], 'pt', { sensitivity: 'base' });
    }
    return (a[0] as string).localeCompare(b[0], 'pt', { sensitivity: 'base' });
  });

  $: dndItems = respostasOrdenadas
    .filter(([resposta]) => typeof resposta === 'string' && resposta.trim() !== '')
    .map(([resposta, contagem]) => ({ id: resposta, resposta, contagem }));

  $: totalCount = dndItems.reduce((s, r) => s + (r.contagem || 0), 0);

  // Função para copiar todas as respostas visíveis com contagem em formato TSV
  function copyAllResponses() {
    try {
      const entries = dndItems.map((i) => [i.resposta, i.contagem]);
      if (!entries || entries.length === 0) {
        toastStore.info('Nenhuma resposta para copiar');
        return;
      }
      const lines = ['Resposta\tContagem', ...entries.map(([k, v]) => `${k}\t${v}`)];
      const payload = lines.join('\n');
      navigator.clipboard.writeText(payload).then(() => {
        toastStore.success('Todas as respostas copiadas para a área de transferência', 2500);
      }).catch((err) => {
        console.error('Falha ao copiar para clipboard:', err);
        toastStore.error('Falha ao copiar as respostas');
      });
    } catch (err) {
      console.error('Erro a copiar respostas:', err);
      toastStore.error('Erro ao copiar respostas');
    }
  }
</script>

<h2 id="contador-respostas">Respostas Recebidas: {totalRespostas}</h2>
<div id="respostas-container">
  <div class="respostas-controls">
    <button
      class="copy-icon-btn"
      title="Copiar todas as respostas"
      on:click={copyAllResponses}
      aria-label="Copiar todas as respostas"
    >
      <i class="fa-solid fa-copy"></i>
    </button>

    <button
      class="sort-icon-btn"
      title="Alternar ordem"
      on:click={toggleOrdenacao}
      aria-label="Alternar ordem"
    >
      {#if ordenarPor === 'alfabetica'}
        <i class="fa-solid fa-arrow-down-wide-short"></i>
      {:else}
        <i class="fas fa-arrow-down-a-z"></i>
      {/if}
    </button>
  </div>
  {#if respostasParaMostrar.length === 0}
    <p>As respostas aparecerão aqui quando as revelar.</p>
  {:else}
  <div class="respostas-list" role="list">
  {#each dndItems as item (item.id)}
  <button
          type="button"
          class="resposta-grafico-item {draggedItemId === item.id ? 'is-dragging' : ''} {dragOverId === item.id ? 'is-dragged-over' : ''} {(item.resposta === respostaDestacada || respostasDestacadas.includes(item.resposta)) ? 'destacada' : ''}"
          draggable={isLiveMode || respostasReveladas}
          on:click={(e) => handleInternalDestacar(item.resposta, e.ctrlKey)}
          on:dragstart={(e) => onDragStart(e, item)}
          on:dragover={(e) => onDragOver(e)}
          on:dragenter={() => onDragEnter(item)}
          on:dragleave={() => onDragLeave(item)}
          on:drop={(e) => onDrop(e, item)}
          on:dragend={() => onDragEnd()}
        >
          <div class="barra-container">
            <div
              class="barra-preenchimento"
              style={"width: " + (totalCount > 0 ? ((item.contagem / totalCount) * 100).toFixed(1) : 0) + "%"}
              aria-hidden="true"
            ></div>
            <span class="resposta-texto">{item.resposta}</span>
          </div>
          <span class="resposta-contagem">{item.contagem}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
