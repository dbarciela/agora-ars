<script lang="ts">
  import { onMount } from 'svelte';

  export let isLiveMode: boolean = false;

  // Internal state management
  let isElectron = false;
  let isAlwaysOnTop = false;

  // Verificar se está rodando no Electron e configurar
  onMount(async () => {
    if (window.agoraAPI) {
      try {
        isElectron = await window.agoraAPI.isElectronHost();
        if (isElectron) {
          document.body.classList.add('electron-host');
        }
      } catch (error) {
        console.error('Erro ao verificar Electron:', error);
        isElectron = false;
      }
    }
  });

  // Funções internas para controlar a janela
  function closeWindow() {
    if (window.agoraAPI) {
      window.agoraAPI.windowClose();
    }
  }

  async function toggleAlwaysOnTop() {
    if (window.agoraAPI) {
      isAlwaysOnTop = await window.agoraAPI.windowToggleAlwaysOnTop();
      return isAlwaysOnTop;
    }
    return false;
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

  // Toggle live mode handler
  export let onToggleLive: () => void;
</script>

<div class="electron-controls">
  <div class="window-buttons left">
    <button
      class="window-btn help"
      title="Informação de Acesso"
      aria-label="Informação de Acesso"
      on:click={handleInfoButtonClick}
    >
      <i class="fas fa-qrcode"></i>
    </button>
    <button
      class="window-btn eye"
      class:active={isLiveMode}
      on:click={onToggleLive}
      title="Modo ao vivo"
      aria-label="Modo ao vivo"
    >
      <i class="fas fa-eye"></i>
    </button>
  </div>

  {#if isElectron}
    <div class="drag-area">
      <span id="main-title">ἀγορά</span>
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
