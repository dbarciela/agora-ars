<script lang="ts">
  import './info.css';
  import { onMount } from 'svelte';
  
  export let onClose: () => void;
  
  let enderecos: { nome: string; endereco: string; porta: number }[] = [];
  let isLoading = true;
  let error = '';

  function debugLog(message: string, data?: any) {
    console.log(`[InfoPanel] ${message}`, data);
  }

  onMount(async () => {
    try {
      debugLog('Component mounted, starting to fetch enderecos...');
      debugLog('Fetching from /api/enderecos...');
      
      const response = await fetch('/api/enderecos');
      debugLog('Response received:', { ok: response.ok, status: response.status, statusText: response.statusText });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const responseData = await response.json();
      debugLog('Response data parsed:', responseData);
      
      enderecos = responseData;
      debugLog('Enderecos assigned:', enderecos);
      
      isLoading = false;
      debugLog('Loading complete');
      
    } catch (error) {
      debugLog('Error occurred:', error);
      console.error('Full error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      isLoading = false;
    }
  });

  function handleClose() {
    debugLog('Close button clicked');
    if (typeof onClose === 'function') {
      debugLog('Calling onClose function');
      onClose();
    } else {
      debugLog('onClose is not a function, closing window directly');
      window.close();
    }
  }
</script>

<!-- Versão simples para popup -->
<div class="info-panel-popup">
  <div id="info-acesso-container">
    <button
      id="close-info-btn"
      class="close-btn"
      title="Fechar"
      aria-label="Fechar"
      on:click={handleClose}
      tabindex="0"
    >
      <i class="fa-solid fa-xmark"></i>
    </button>
    <h3>Partilhe este endereço com a audiência:</h3>
    <div id="enderecos-lista">
      {#if isLoading}
        <p>A carregar endereços de rede...</p>
      {:else if enderecos.length === 0}
        <p>Nenhum endereço encontrado</p>
      {:else}
        {#each enderecos as net}
          <div class="endereco-item">
            <img
              class="qr-code"
              width="128"
              height="128"
              src={`/api/qrcode?url=${encodeURIComponent(`http://${net.endereco}:${net.porta}`)}`}
              alt="QR Code"
            />
            <div class="endereco-info">
              <h3>{net.nome}</h3>
              <a href={`http://${net.endereco}:${net.porta}`} target="_blank"
                >{`http://${net.endereco}:${net.porta}`}</a
              >
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
