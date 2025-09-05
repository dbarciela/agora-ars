<script lang="ts">
  import { onDestroy } from 'svelte';
  import { toastStore, type ToastMessage } from '../stores/toastStore';
  import { fly, fade } from 'svelte/transition';
  import '../components/toast.css';

  let toasts: ToastMessage[] = [];
  const unsubscribe = toastStore.subscribe((v) => (toasts = v));
  onDestroy(unsubscribe);
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div
      class="toast {toast.type}"
  transition:fly={{ y: -30, duration: 250 }}
  aria-live="polite"
    >
      <span class="toast-icon">
        {#if toast.type === 'success'}<i class="fa-solid fa-circle-check"></i>{/if}
        {#if toast.type === 'error'}<i class="fa-solid fa-circle-xmark"></i>{/if}
        {#if toast.type === 'info'}<i class="fa-solid fa-circle-info"></i>{/if}
        {#if toast.type === 'warning'}<i class="fa-solid fa-triangle-exclamation"></i>{/if}
      </span>
      <span class="toast-message">{toast.message}</span>
    </div>
  {/each}
</div>
