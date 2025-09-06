<script lang="ts">
  import './host.css';
  import './electroncontrols.css';
  import {
    estadoParticipantes,
    totalRespostas,
    respostas,
    isLiveMode,
    totalParticipantes,
    percentProntos,
  } from '../stores';
  import { ClientApi } from '../services/socket-api';
  import { get } from 'svelte/store';
  import { toastStore } from '../stores/toastStore';
  import ElectronControls from './ElectronControls.svelte';
  import Respostas from './Respostas.svelte';

  let perguntaInput = '';
  
  // Lista local de respostas reveladas (apenas para o host)
  let respostasReveladas: string[] = [];

  // Em modo live, copia automaticamente todas as respostas para reveladas
  $: if ($isLiveMode) {
    respostasReveladas = $respostas || [];
  }

  // Mostrar botão "Próxima Pergunta" quando:
  // - Modo live e todos estão prontos
  // - Modo normal e todas as respostas foram reveladas
  $: mostrarBotaoLimpar =
    ($isLiveMode && $estadoParticipantes.prontos === $totalParticipantes) ||
    (!$isLiveMode && respostasReveladas.length > 0 && respostasReveladas.length === $respostas.length && $estadoParticipantes.prontos === $totalParticipantes);
  // counting and ordering of respostas moved into Respostas.svelte

  // Drag-and-drop moved into `Respostas.svelte` (component now owns DnD behaviors)

  // --- Handlers de Ações ---
  function handleToggleLive() {
    isLiveMode.update((v) => {
      const newValue = !v;
      // Emitir evento para notificar participantes sobre mudança do modo live
      ClientApi.toggleLiveMode(newValue);
      return newValue;
    });
  }

  function handleNextQuestionClick() {
    // Antes de começar a próxima pergunta, submeter o texto atual como pergunta/contexto
    const valor = (perguntaInput || '').trim();
    ClientApi.setQuestion(valor);
    // Limpar respostas reveladas localmente
    respostasReveladas = [];
    
    ClientApi.clearResponses();
    console.log(
      '🎯 HostView - Próxima pergunta: submetida pergunta e limpadas respostas'
    );
  }

  function handleDefinirPergunta() {
    const valor = (perguntaInput || '').trim();
    ClientApi.setQuestion(valor);
  }

  // Copiar todas as respostas visíveis (texto + contagem) para a área de transferência
  function copyAllResponses() {
    try {
      const current = get(respostas) || [];
      const map: Record<string, number> = {};
      for (const r of current) {
        const key = (r || '').toString().trim();
        if (!key) continue;
        map[key] = (map[key] || 0) + 1;
      }
      const entries = Object.entries(map).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      );
      if (entries.length === 0) {
        toastStore.info('Nenhuma resposta para copiar');
        return;
      }
      const lines = [
        'Resposta\tContagem',
        ...entries.map(([k, v]) => `${k}\t${v}`),
      ];
      const payload = lines.join('\n');
      // Tentar usar a API de clipboard do navegador
      navigator.clipboard
        .writeText(payload)
        .then(() => {
          toastStore.success(
            'Todas as respostas copiadas para a área de transferência',
            2500
          );
        })
        .catch((err) => {
          console.error('Falha ao copiar para clipboard:', err);
          // fallback: mostrar erro
          toastStore.error('Falha ao copiar as respostas');
        });
    } catch (err) {
      console.error('Erro a copiar respostas:', err);
      toastStore.error('Erro ao copiar respostas');
    }
  }

  // === Funções de Revelação ===
  function handleRevealBest() {
    if (!$isLiveMode) {
      // Fazer diferença entre todas as respostas e as já reveladas
      const todasRespostas = $respostas || [];
      const naoReveladas = todasRespostas.filter(resposta => !respostasReveladas.includes(resposta));
      
      if (naoReveladas.length === 0) {
        console.log('🏆 Todas as respostas já foram reveladas');
        return;
      }
      
      // Agrupar e ordenar por popularidade apenas as não reveladas
      const map: Record<string, number> = {};
      for (const r of naoReveladas) {
        const key = (r || '').toString().trim();
        if (!key) continue;
        map[key] = (map[key] || 0) + 1;
      }
      const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
      
      if (entries.length > 0) {
        const melhorResposta = entries[0][0];
        // Adicionar todas as instâncias desta resposta às reveladas
        const novasReveladas = todasRespostas.filter(r => r === melhorResposta);
        respostasReveladas = [...respostasReveladas, ...novasReveladas];
        
        // Enviar evento para bloquear participantes
        ClientApi.revealResponses();
        
        console.log('🏆 Revelou melhor resposta:', melhorResposta, `(${novasReveladas.length} instâncias)`);
      }
    }
  }

  function handleRevealRandom() {
    if (!$isLiveMode) {
      // Fazer diferença entre todas as respostas e as já reveladas
      const todasRespostas = $respostas || [];
      const naoReveladas = todasRespostas.filter(resposta => !respostasReveladas.includes(resposta));
      
      if (naoReveladas.length === 0) {
        console.log('🎲 Todas as respostas já foram reveladas');
        return;
      }
      
      // Obter respostas únicas não reveladas
      const respostasUnicasNaoReveladas = [...new Set(naoReveladas.filter(r => r && r.trim()))];
      
      if (respostasUnicasNaoReveladas.length > 0) {
        // Selecionar uma resposta aleatória
        const randomIndex = Math.floor(Math.random() * respostasUnicasNaoReveladas.length);
        const respostaAleatoria = respostasUnicasNaoReveladas[randomIndex];
        
        // Adicionar todas as instâncias desta resposta às reveladas
        const novasReveladas = todasRespostas.filter(r => r === respostaAleatoria);
        respostasReveladas = [...respostasReveladas, ...novasReveladas];
        
        // Enviar evento para bloquear participantes
        ClientApi.revealResponses();
        
        console.log('🎲 Revelou resposta aleatória:', respostaAleatoria, `(${novasReveladas.length} instâncias)`);
      }
    }
  }

  function handleRevealAll() {
    if (!$isLiveMode) {
      // Revelar todas as respostas
      respostasReveladas = $respostas || [];
      
      // Enviar evento para bloquear participantes
      ClientApi.revealResponses();
      // Ao revelar respostas, limpar também o contexto/pergunta atual
      ClientApi.setQuestion('');
      perguntaInput = '';
      console.log('🎯 HostView - Revelando todas as respostas');
    }
  }
</script>

<div id="host-view">
  <!-- Controles de janela (extraídos para componente) -->

  <ElectronControls isLiveMode={$isLiveMode} onToggleLive={handleToggleLive} />

  <!-- Campo discreto para definir o contexto/pergunta atual (estilo semelhante ao participante) -->
  <div class="pergunta-container" style="margin: 8px 0;">
    <div class="input-container">
      <input
        type="text"
        bind:value={perguntaInput}
        placeholder="Contexto / pergunta (opcional)"
        autocomplete="off"
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleDefinirPergunta();
          }
        }}
      />
      <button
        class="submit-arrow"
        title="Definir pergunta"
        aria-label="Definir pergunta"
        on:click={handleDefinirPergunta}
      >
        <i class="fa-solid fa-pen"></i>
      </button>
    </div>
  </div>

  <!-- botão de cópia movido para o componente Respostas.svelte -->

  {#if mostrarBotaoLimpar}
    <button id="reveal-btn" class="next-btn" on:click={handleNextQuestionClick}>
      <span class="reveal-btn-text">Próxima Pergunta</span>
    </button>
  {:else}
    <!-- Botão Original com Sobreposição Transparente -->
    <div class="reveal-button-wrapper">
      <button
        id="reveal-btn"
        on:click={!$isLiveMode && respostasReveladas.length < $respostas.length ? handleRevealAll : undefined}
        disabled={$totalRespostas === 0}
      >
        <div
          class="reveal-btn-fill"
          style:width="{$percentProntos}%"
          style:background-color={$percentProntos === 100
            ? 'var(--success)'
            : 'var(--warning)'}
        ></div>
        <span
          class="reveal-btn-text"
          style:color={$percentProntos === 100 ? 'var(--surface)' : 'var(--text)'}
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

      <!-- Sobreposições transparentes laterais -->
      {#if $percentProntos === 100 && !$isLiveMode && respostasReveladas.length < $respostas.length && $totalRespostas > 0}
        <button
          class="overlay-button overlay-left"
          aria-label="Revelar melhor resposta"
          title="Revela apenas a resposta mais popular"
          on:click={handleRevealBest}
        >
          <i class="fas fa-trophy"></i>
        </button>

        <button
          class="overlay-button overlay-right"
          aria-label="Revelar resposta aleatória"
          title="Revela uma resposta aleatória"
          on:click={handleRevealRandom}
        >
          <i class="fas fa-dice"></i>
        </button>

        <!-- Linhas de separação -->
        <div class="separator separator-left"></div>
        <div class="separator separator-right"></div>
      {/if}
    </div>
  {/if}

  <Respostas
    totalRespostas={$totalRespostas}
    respostasParaMostrar={respostasReveladas}
    isLiveMode={$isLiveMode}
    respostasReveladas={respostasReveladas.length === $respostas.length}
  />
</div>
