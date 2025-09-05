<script lang="ts">
  import Toast from './components/Toast.svelte';
  import './style.css';
  import { onMount } from 'svelte';
  import { isHost, isConnected } from './stores';
  import { SocketService } from './services/socket';
  import { EVENTS } from '../types/events';
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
      SocketService.emit(EVENTS.REGISTER_HOST);
    }
  }
</script>

<Toast />
<div class="container">
  <h1 id="main-title">ἀγορά</h1>

  {#if $isHost}
    <HostView />
  {:else}
    <ParticipantView />
  {/if}
</div>

<div class="connection-status" style:display={$isConnected ? 'none' : 'block'}>
  A ligar ao servidor...
</div>