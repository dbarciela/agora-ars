<script lang="ts">
  import Toast from './components/Toast.svelte';
  import './style.css';
  import { onMount } from 'svelte';
  import { isHost, isConnected } from './stores';
  import { SocketService } from './services/socket';
  import { ClientApi } from './services/socket-api';
  import ParticipantView from './components/ParticipantView.svelte';
  import HostView from './components/HostView.svelte';

  onMount(() => {
    SocketService.init();
    verificarModoAnfitriao();
  });

  async function verificarModoAnfitriao() {
    const isHostFromUrl = new URLSearchParams(window.location.search).has('host');
    const isElectronHost = window.agoraAPI ? await window.agoraAPI.isElectronHost().catch(() => false) : false;

    if (isHostFromUrl || isElectronHost) {
      ClientApi.registerAsHost();
    }
  }
</script>

<Toast />
<div class="container">
  {#if $isHost}
    <HostView />
  {:else}
    <ParticipantView />
  {/if}
</div>

<div class="connection-status" style:display={$isConnected ? 'none' : 'block'}>
  A ligar ao servidor...
</div>