<script lang="ts">
import './host.css';
import { estadoParticipantes, totalRespostas, respostas, isLiveMode, totalParticipantes, percentProntos, respostasReveladas } from '../stores';
import { SocketService } from '../services/socket';
import { EVENTS } from '../../types/events';
import { onMount } from 'svelte';

let isElectron = false;
let isAlwaysOnTop = false;

// Verificar se está rodando no Electron
onMount(async () => {
  if (window.agoraAPI) {
    try {
      isElectron = await window.agoraAPI.isElectronHost();
      if (isElectron) {
        document.body.classList.add('electron-host');
        // Auto-resize inicial após carregamento completo - delay maior
        setTimeout(() => {
          if (window.agoraAPI?.autoResizeHeight) {
            console.log('🔧 Initial resize on mount');
            window.agoraAPI.autoResizeHeight();
          }
        }, 1000); // Delay maior para garantir renderização completa
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
  // Simples abertura de popup - funciona em browser e Electron
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

$: mostrarBotaoLimpar = ($isLiveMode && $estadoParticipantes.prontos === $totalParticipantes) || (!$isLiveMode && $respostasReveladas);

$: respostasParaMostrar = $isLiveMode || $respostasReveladas ? $respostas : [];
$: contagemRespostas = respostasParaMostrar.reduce((acc: { [key: string]: number }, resposta: string) => {
  const respostaNormalizada = resposta.trim();
  acc[respostaNormalizada] = (acc[respostaNormalizada] || 0) + 1;
  return acc;
}, {});
$: respostasOrdenadas = Object.entries(contagemRespostas).sort(([, a], [, b]) => b - a);

// Auto-resize sempre que o array de respostas original muda (modo live)
$: if (isElectron && $respostas && $respostas.length > 0) {
  setTimeout(() => {
    if (window.agoraAPI?.autoResizeHeight) {
      console.log(`🔧 Resize triggered by $respostas change: ${$respostas.length} respostas`);
      window.agoraAPI.autoResizeHeight();
    }
  }, 300);
}

// Auto-resize altura quando revelamos respostas (só no Electron)
$: if (isElectron && !$isLiveMode && respostasParaMostrar.length > 0) {
  setTimeout(() => {
    if (window.agoraAPI?.autoResizeHeight) {
      console.log(`🔧 Resize triggered by reveal: ${respostasParaMostrar.length} respostas mostradas`);
      window.agoraAPI.autoResizeHeight();
    }
  }, 300);
}

function handleToggleLive() {
  isLiveMode.update(v => !v);
  // Não fazer auto-resize aqui - será feito automaticamente pelo reactive statement
}

function handleRevealClick() {
  if (!$isLiveMode) {
    // Enviar evento para o servidor para notificar participantes
    SocketService.emit(EVENTS.REVEAL_RESPONSES);
    console.log('🎯 HostView - Enviando REVEAL_RESPONSES para servidor');
    // Auto-resize será feito automaticamente quando respostasReveladas mudar
  }
  // Em modo live, não faz nada
}
</script>

<div id="host-view">
  <!-- Controles de janela (apenas no Electron) -->

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
        title="Olho"
        aria-label="Olho"
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
          aria-label="Alternar sempre no topo"
        >
          <i class="fas fa-thumbtack"></i>
        </button>
        <button
          class="window-btn close"
          on:click={closeWindow}
          title="Fechar"
          aria-label="Fechar janela"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    {/if}
  </div>

  <!-- Botão flutuante removido, ação transferida para o botão de interrogação na barra -->

  <p>
    Você é o anfitrião. Aguarde as submissões e revele quando estiver pronto.
  </p>

  {#if mostrarBotaoLimpar}
    <button
      id="clear-btn"
      on:click={() => {
        respostasReveladas.set(false);
        SocketService.emit(EVENTS.CLEAR_RESPONSES);
      }}>Limpar Respostas</button
    >
  {:else}
    <button
      id="reveal-btn"
      on:click={!$isLiveMode && !$respostasReveladas
        ? handleRevealClick
        : undefined}
      disabled={$totalRespostas == 0}
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
    {#if respostasParaMostrar.length === 0}
      <p>As respostas aparecerão aqui quando as revelar.</p>
    {:else}
      {#each respostasOrdenadas as [resposta, contagem]}
        <div class="resposta-grafico-item">
          <div class="barra-container">
            <div
              class="barra-preenchimento"
              style="width: {(contagem / respostasParaMostrar.length) * 100}%"
            ></div>
            <span class="resposta-texto">{resposta}</span>
          </div>
          <span class="resposta-contagem">{contagem}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>
