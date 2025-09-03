import { PORT } from '../../server/config';
import type { EstadoParticipantes } from '../../types/global-types';
import { state } from '../state';

/**
 * UIController é um objeto responsável por todas as manipulações diretas do DOM.
 * Ele lê de um objeto de elementos para evitar múltiplas chamadas a getElementById.
 */
export const UIController = {
  elements: {
    participantView: document.getElementById('participant-view') as HTMLElement,
    hostView: document.getElementById('host-view') as HTMLElement,
    respostaInput: document.getElementById(
      'resposta-input'
    ) as HTMLInputElement,
    submitBtn: document.getElementById('submit-btn') as HTMLButtonElement,
    revealBtn: document.getElementById('reveal-btn') as HTMLButtonElement,
    clearBtn: document.getElementById('clear-btn') as HTMLButtonElement,
    respostasContainer: document.getElementById(
      'respostas-container'
    ) as HTMLElement,
    feedbackMessage: document.getElementById('feedback-message') as HTMLElement,
    minhasRespostasContainer: document.getElementById(
      'minhas-respostas-container'
    ) as HTMLElement,
    prontoBtn: document.getElementById('pronto-btn') as HTMLButtonElement,
    contadorRespostas: document.getElementById(
      'contador-respostas'
    ) as HTMLElement,
    showInfoBtn: document.getElementById('show-info-btn') as HTMLButtonElement,
    infoPanel: document.getElementById('info-acesso-panel') as HTMLElement,
    closeInfoBtn: document.getElementById('close-info-btn') as HTMLButtonElement,
    enderecosLista: document.getElementById('enderecos-lista') as HTMLElement,
    connectionStatus: document.getElementById(
      'connection-status'
    ) as HTMLElement,
    toggleLiveBtn: document.getElementById(
      'toggle-live-btn'
    ) as HTMLButtonElement,
  },

  setLiveMode(isLive: boolean) {
    const btn = this.elements.toggleLiveBtn;
    if (btn) {
      btn.classList.toggle('active', isLive);
      btn.title = isLive
        ? 'Ocultar respostas em tempo real'
        : 'Ver respostas em tempo real';
    }
  },

  async mostrarVistaAnfitriao() {
    this.elements.participantView.style.display = 'none';
    this.elements.hostView.style.display = 'block';

    try {
      const response = await fetch('/api/enderecos');
      const enderecos = await response.json();
      this.elements.enderecosLista.innerHTML = '';

      if (enderecos.length === 0) {
        this.elements.enderecosLista.innerHTML =
          '<p>Não foi possível detetar um endereço de rede. Verifique a sua ligação.</p>';
        return;
      }

      enderecos.forEach(async (net: { endereco: string; nome: string }) => {
        const url = `http://${net.endereco}:${PORT}`;
        const div = document.createElement('div');
        div.className = 'endereco-item';

        const info = document.createElement('div');
        info.className = 'endereco-info';
        info.innerHTML = `<strong>${net.nome}:</strong> <a href="${url}" target="_blank">${url}</a>`;

        try {
          const qrResponse = await fetch(
            `/api/qrcode?url=${encodeURIComponent(url)}`
          );
          if (qrResponse.ok) {
            const qrImg = document.createElement('img');
            qrImg.className = 'qr-code';
            qrImg.width = 128;
            qrImg.height = 128;
            qrImg.src = `/api/qrcode?url=${encodeURIComponent(url)}`;
            div.appendChild(qrImg);
          } else {
            throw new Error(`Status: ${qrResponse.status}`);
          }
        } catch (error) {
          console.error(`Falha ao obter o QR Code para ${url}:`, error);
          const span = document.createElement('span');
          span.textContent = 'Falha ao carregar QR Code';
          div.appendChild(span);
        }
        div.appendChild(info);
        this.elements.enderecosLista.appendChild(div);
      });
    } catch (error) {
      this.elements.enderecosLista.innerHTML =
        '<p>Erro ao obter os endereços de rede.</p>';
      console.error('Erro ao obter endereços:', error);
    }
  },

  renderizarMinhasRespostas(
    respostas: string[],
    isReady: boolean,
    onRemover: (index: number) => void
  ) {
    const container = this.elements.minhasRespostasContainer;
    container.innerHTML = '';
    if (respostas.length === 0) {
      container.innerHTML = '<p>As suas respostas aparecerão aqui.</p>';
      return;
    }

    respostas.forEach((resposta, idx) => {
      const div = document.createElement('div');
      div.className = 'resposta-item';
      const span = document.createElement('span');
      span.textContent = resposta;
      div.appendChild(span);

      if (!isReady) {
        const cruz = document.createElement('span');
        cruz.title = 'Apagar resposta';
        cruz.className = 'delete-icon';
        cruz.onclick = () => onRemover(idx);
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-trash';
        cruz.appendChild(icon);
        div.appendChild(cruz);
      }
      container.appendChild(div);
    });
  },

  atualizarEstadoParticipantes({ prontos, aResponder }: EstadoParticipantes) {
    const total = prontos + aResponder;
    if (this.elements.revealBtn) {
      const percentProntos =
        total === 0 ? 0 : Math.round((prontos / total) * 100);
      const fillDiv = this.elements.revealBtn.querySelector(
        '.reveal-btn-fill'
      ) as HTMLDivElement;
      const textSpan = this.elements.revealBtn.querySelector(
        '.reveal-btn-text'
      ) as HTMLSpanElement;

      if (fillDiv) {
        fillDiv.style.width = `${percentProntos}%`;
        fillDiv.style.backgroundColor =
          percentProntos === 100 ? '#28a745' : '#ffc107';
      }
      if (textSpan) {
        textSpan.textContent =
          total === 0
            ? 'A aguardar...'
            : prontos < total
              ? `Prontos: ${prontos} de ${total}`
              : 'Revelar respostas';
        textSpan.style.color = percentProntos === 100 ? 'white' : '#333';
      }
    }
  },

  atualizarContador(num: number) {
    if (this.elements.contadorRespostas)
      this.elements.contadorRespostas.textContent = `Respostas Recebidas: ${num}`;
  },

  mostrarRespostasReveladas(respostas: string[]) {
    const container = this.elements.respostasContainer;
    const eyeBtn = container.querySelector('#toggle-live-btn');
    container.innerHTML = '';
    if (eyeBtn) container.appendChild(eyeBtn);

    if (respostas.length === 0) {
      const p = document.createElement('p');
      p.textContent =
        'As respostas aparecerão aqui quando o anfitrião as revelar.';
      container.appendChild(p);
      return;
    }

    const contagemRespostas = respostas.reduce(
      (acc: { [key: string]: number }, resposta: string) => {
        const respostaNormalizada = resposta.trim();
        acc[respostaNormalizada] = (acc[respostaNormalizada] || 0) + 1;
        return acc;
      },
      {}
    );

    const totalRespostas = respostas.length;
    const respostasOrdenadas = Object.entries(contagemRespostas).sort(
      ([, a], [, b]) => b - a
    );

    respostasOrdenadas.forEach(([resposta, contagem]) => {
      const percentagem = (contagem / totalRespostas) * 100;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'resposta-grafico-item';
      itemDiv.innerHTML = `
        <div class="barra-container">
          <div class="barra-preenchimento" style="width: ${percentagem}%"></div>
          <span class="resposta-texto">${resposta}</span>
        </div>
        <span class="resposta-contagem">${contagem}</span>
      `;
      container.appendChild(itemDiv);
    });
  },

  setParticipantReadyState(isReady: boolean) {
    const { prontoBtn, respostaInput, submitBtn } = this.elements;
    if (prontoBtn) {
      prontoBtn.textContent = isReady ? 'Cancelar' : 'Pronto';
      prontoBtn.classList.toggle('cancel-state', isReady);
      respostaInput.disabled = isReady;
      submitBtn.disabled = isReady;
    }
  },

  mostrarFeedback(mensagem: string, sucesso = true) {
    const el = this.elements.feedbackMessage;
    el.textContent = mensagem;
    el.className = sucesso ? 'feedback success' : 'feedback error';
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = '';
        el.className = 'feedback';
      }, 500);
    }, 2500);
  },

  obterValorInputResposta: () =>
    UIController.elements.respostaInput.value.trim(),
  limparInputResposta: () => (UIController.elements.respostaInput.value = ''),
  mostrarPainelInfo: () =>
    UIController.elements.infoPanel.classList.add('visible'),
  esconderPainelInfo: () =>
    UIController.elements.infoPanel.classList.remove('visible'),

  setRevealClearButtons(reveladas: boolean) {
    if (this.elements.revealBtn && this.elements.clearBtn) {
      this.elements.revealBtn.style.display = reveladas ? 'none' : 'block';
      this.elements.clearBtn.style.display = reveladas ? 'block' : 'none';
    }
  },

  setParticipantControls(disabled: boolean) {
    const { respostaInput, submitBtn, prontoBtn } = this.elements;
    respostaInput.disabled = disabled;
    submitBtn.disabled = disabled;
    prontoBtn.disabled = disabled;
    if (!disabled) {
      this.setParticipantReadyState(state.isReady);
    }
  },

  updateConnectionStatus(isConnected: boolean) {
    const el = this.elements.connectionStatus;
    el.style.display = isConnected ? 'none' : 'block';
  },
};
