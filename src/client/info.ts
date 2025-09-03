import InfoPanel from './components/InfoPanel.svelte';
import { mount } from 'svelte';

function handleClose() {
  window.close();
}

// Aguardar o DOM estar pronto antes de inicializar o componente
function initApp() {
  const targetElement = document.getElementById('info-root');
  
  if (!targetElement) {
    console.error('Elemento info-root não encontrado');
    return;
  }

  try {
    // Usar mount() do Svelte 5 em vez de new Component()
    const app = mount(InfoPanel, {
      target: targetElement,
      props: {
        onClose: handleClose
      }
    });
    
    console.log('InfoPanel inicializado com sucesso na página popup');
    return app;
  } catch (error) {
    console.error('Erro ao inicializar InfoPanel:', error);
  }
}

// Aguardar o DOM estar completamente carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
