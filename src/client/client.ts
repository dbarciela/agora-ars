import { io, type Socket } from 'socket.io-client';
import type {
  ClientState,
  EstadoParticipantes,
  ServerToClientEvents,
  ClientToServerEvents,
} from '../types/global-types';
import { EVENTS } from '../types/events';
import { PORT } from '../server/config';

// --- Gestão de Estado do Cliente ---
const state: ClientState = {
  minhasRespostas: [],
  isReady: false,
};

// --- Controlador da Interface (UIController) ---
const UIController = {
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
    prontosIndicador: document.getElementById(
      'prontos-indicador'
    ) as HTMLElement,
    aResponderIndicador: document.getElementById(
      'a-responder-indicador'
    ) as HTMLElement,
    barProntos: document.getElementById('bar-prontos') as HTMLElement,
    barAResponder: document.getElementById('bar-a-responder') as HTMLElement,
    contadorRespostas: document.getElementById(
      'contador-respostas'
    ) as HTMLElement,
    contadorParticipantes: document.getElementById(
      'contador-participantes'
    ) as HTMLElement,
    showInfoBtn: document.getElementById('show-info-btn') as HTMLButtonElement,
    infoPanel: document.getElementById('info-acesso-panel') as HTMLElement,
    closeInfoBtn: document.getElementById(
      'close-info-btn'
    ) as HTMLButtonElement,
    enderecosLista: document.getElementById('enderecos-lista') as HTMLElement,
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

      enderecos.forEach((net: { endereco: string; nome: string }) => {
  const url = `http://${net.endereco}:${PORT}`;
        const div = document.createElement('div');
        div.className = 'endereco-item';

        const info = document.createElement('div');
        info.className = 'endereco-info';
        info.innerHTML = `<strong>${net.nome}:</strong> <a href="${url}" target="_blank">${url}</a>`;

        const qrImg = document.createElement('img');
        qrImg.className = 'qr-code';
        qrImg.width = 128;
        qrImg.height = 128;
        qrImg.src = `/api/qrcode?url=${encodeURIComponent(url)}`;

        div.appendChild(qrImg);
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

    const podeApagar = !isReady;
    respostas.forEach((resposta, idx) => {
      const div = document.createElement('div');
      div.className = 'resposta-item';
      const span = document.createElement('span');
      span.textContent = resposta;
      div.appendChild(span);

      if (podeApagar) {
        const cruz = document.createElement('span');
        cruz.textContent = '🗑️';
        cruz.title = 'Apagar resposta';
        cruz.className = 'delete-icon';
        cruz.onclick = () => onRemover(idx);
        div.appendChild(cruz);
      }
      container.appendChild(div);
    });
  },

  atualizarEstadoParticipantes({ prontos, aResponder }: EstadoParticipantes) {
    if (this.elements.prontosIndicador)
      this.elements.prontosIndicador.textContent = `Prontos: ${prontos}`;
    if (this.elements.aResponderIndicador)
      this.elements.aResponderIndicador.textContent = `A responder: ${aResponder}`;

    const total = prontos + aResponder;
    if (this.elements.contadorParticipantes)
      this.elements.contadorParticipantes.textContent = `Participantes: ${total}`;

    if (this.elements.revealBtn) {
      if (aResponder === 0 && prontos > 0) {
        this.elements.revealBtn.style.backgroundColor = '#28a745';
        this.elements.revealBtn.style.color = 'white';
      } else if (prontos > 0 || aResponder > 0) {
        this.elements.revealBtn.style.backgroundColor = '#ffc107';
        this.elements.revealBtn.style.color = '#333';
      } else {
        this.elements.revealBtn.style.backgroundColor = '#dc3545';
        this.elements.revealBtn.style.color = 'white';
      }
    }

    if (this.elements.barProntos && this.elements.barAResponder) {
      this.elements.barProntos.style.width =
        total === 0 ? '0' : `${(prontos / total) * 100}%`;
      this.elements.barAResponder.style.width =
        total === 0 ? '0' : `${(aResponder / total) * 100}%`;
    }
  },

  atualizarContador(num: number) {
    if (this.elements.contadorRespostas)
      this.elements.contadorRespostas.textContent = `Respostas Recebidas: ${num}`;
  },

  mostrarRespostasReveladas(respostas: string[]) {
    const container = this.elements.respostasContainer;
    container.innerHTML = '';

    if (respostas.length === 0) {
      container.innerHTML =
        '<p>As respostas aparecerão aqui quando o anfitrião as revelar.</p>';
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
      ([, a]: [string, number], [, b]: [string, number]) => b - a
    );

    respostasOrdenadas.forEach(([resposta, contagem]: [string, number]) => {
      const percentagem =
        totalRespostas > 0 ? (contagem / totalRespostas) * 100 : 0;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'resposta-grafico-item';

      const barraContainer = document.createElement('div');
      barraContainer.className = 'barra-container';

      const textoBg = document.createElement('span');
      textoBg.className = 'resposta-texto resposta-texto-bg';
      textoBg.textContent = resposta;

      const barraPreenchimento = document.createElement('div');
      barraPreenchimento.className = 'barra-preenchimento';
      barraPreenchimento.style.width = `${percentagem}%`;

      const textoFg = document.createElement('span');
      textoFg.className = 'resposta-texto resposta-texto-fg';
      textoFg.textContent = resposta;

      const contagemSpan = document.createElement('span');
      contagemSpan.className = 'resposta-contagem';
      contagemSpan.textContent = contagem.toString();

      barraPreenchimento.appendChild(textoFg);
      barraContainer.appendChild(textoBg);
      barraContainer.appendChild(barraPreenchimento);

      itemDiv.appendChild(barraContainer);
      itemDiv.appendChild(contagemSpan);

      container.appendChild(itemDiv);
    });
  },

  setParticipantReadyState(isReady: boolean, disablePronto = false) {
    const { prontoBtn, respostaInput, submitBtn } = this.elements;
    if (prontoBtn) {
      prontoBtn.disabled = !!disablePronto;
      if (isReady) {
        prontoBtn.textContent = 'Cancelar';
        prontoBtn.classList.add('cancel-state');
        respostaInput.disabled = true;
        submitBtn.disabled = true;
      } else {
        prontoBtn.textContent = 'Pronto';
        prontoBtn.classList.remove('cancel-state');
        respostaInput.disabled = false;
        submitBtn.disabled = false;
      }
    }
  },

  mostrarFeedback(mensagem: string, sucesso = true) {
    this.elements.feedbackMessage.textContent = mensagem;
    this.elements.feedbackMessage.className = sucesso
      ? 'feedback success'
      : 'feedback error';

    this.elements.feedbackMessage.style.opacity = '1';
    setTimeout(() => {
      this.elements.feedbackMessage.style.opacity = '0';
      setTimeout(() => {
        this.elements.feedbackMessage.textContent = '';
        this.elements.feedbackMessage.className = 'feedback';
      }, 500);
    }, 2500);
  },

  obterValorInputResposta() {
    return this.elements.respostaInput.value.trim();
  },

  limparInputResposta() {
    this.elements.respostaInput.value = '';
  },

  mostrarPainelInfo() {
    this.elements.infoPanel.classList.add('visible');
  },

  esconderPainelInfo() {
    this.elements.infoPanel.classList.remove('visible');
  },

  setRevealClearButtons(reveladas: boolean) {
    if (this.elements.revealBtn && this.elements.clearBtn) {
      this.elements.revealBtn.style.display = reveladas
        ? 'none'
        : 'inline-block';
      this.elements.clearBtn.style.display = reveladas
        ? 'inline-block'
        : 'none';
    }
  },
};

// --- Serviço de Sockets ---
const SocketService = {
  socket: null as Socket<ServerToClientEvents, ClientToServerEvents> | null,
  init() {
    this.socket = io();
  },
  emit<T extends keyof ClientToServerEvents>(
    evento: T,
    ...dados: Parameters<ClientToServerEvents[T]>
  ) {
    if (this.socket) {
      this.socket.emit(evento, ...dados);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<T extends keyof ServerToClientEvents>(
    evento: T,
    callback: ServerToClientEvents[T]
  ) {
    if (this.socket) {
      this.socket.on(evento, callback as any);
    }
  },
};

// --- Controlador da Aplicação ---
const AppController = {
  init() {
    SocketService.init();
    this.bindSocketEvents();
    this.bindDOMEvents();
    this.verificarModoAnfitriao();
    UIController.setRevealClearButtons(false);
  },

  atualizarEstadoLocal(novasRespostas: string[], novoEstadoPronto: boolean) {
    state.minhasRespostas = novasRespostas;
    state.isReady = novoEstadoPronto;
    UIController.setParticipantReadyState(state.isReady);
    UIController.renderizarMinhasRespostas(
      state.minhasRespostas,
      state.isReady,
      (idx) => this.handleRemoverResposta(idx)
    );
  },

  bindDOMEvents() {
    UIController.elements.respostaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSubmeterResposta();
      }
    });

    if (UIController.elements.submitBtn) {
      UIController.elements.submitBtn.addEventListener('click', () =>
        this.handleSubmeterResposta()
      );
    }

    if (UIController.elements.prontoBtn) {
      UIController.elements.prontoBtn.addEventListener('click', () =>
        this.handleProntoClick()
      );
    }

    UIController.elements.revealBtn.addEventListener('click', () =>
      SocketService.emit(EVENTS.REVEAL_RESPONSES)
    );
    UIController.elements.clearBtn.addEventListener('click', () =>
      SocketService.emit(EVENTS.CLEAR_RESPONSES)
    );

    if (UIController.elements.showInfoBtn) {
      UIController.elements.showInfoBtn.addEventListener('click', () =>
        UIController.mostrarPainelInfo()
      );
    }
    if (UIController.elements.closeInfoBtn) {
      UIController.elements.closeInfoBtn.addEventListener('click', () =>
        UIController.esconderPainelInfo()
      );
    }
    if (UIController.elements.infoPanel) {
      UIController.elements.infoPanel.addEventListener('click', (e) => {
        if (e.target === UIController.elements.infoPanel) {
          UIController.esconderPainelInfo();
        }
      });
    }
  },

  bindSocketEvents() {
    SocketService.on(EVENTS.IS_HOST, () => {
      UIController.mostrarVistaAnfitriao();
      UIController.setRevealClearButtons(false);
    });

    SocketService.on(EVENTS.HOST_EXISTS, () => {
      document.body.innerHTML = '<h1>Já existe um anfitrião ativo.</h1>';
    });

    SocketService.on(EVENTS.UPDATE_PARTICIPANT_STATE, (estado) => {
      UIController.atualizarEstadoParticipantes(estado);
    });

    SocketService.on(EVENTS.UPDATE_COUNTER, (num) => {
      UIController.atualizarContador(num);
    });

    SocketService.on(EVENTS.RESPONSES_REVEALED, (respostas) => {
      UIController.mostrarRespostasReveladas(respostas);
      UIController.setRevealClearButtons(respostas.length > 0);
    });
  },

  handleSubmeterResposta() {
    const resposta = UIController.obterValorInputResposta();
    if (resposta && !state.isReady) {
      if (state.minhasRespostas.includes(resposta)) {
        UIController.mostrarFeedback('Já submeteu esta resposta.', false);
        return;
      }
      SocketService.emit(EVENTS.SUBMIT_RESPONSE, resposta);
      const novasRespostas = [...state.minhasRespostas, resposta];
      this.atualizarEstadoLocal(novasRespostas, state.isReady);
      UIController.limparInputResposta();
    }
  },

  handleRemoverResposta(index: number) {
    SocketService.emit(EVENTS.REMOVE_RESPONSE, index);
    const novasRespostas = state.minhasRespostas.filter((_, i) => i !== index);
    this.atualizarEstadoLocal(novasRespostas, state.isReady);
  },

  handleProntoClick() {
    const novoEstadoPronto = !state.isReady;
    if (novoEstadoPronto) {
      SocketService.emit(EVENTS.PARTICIPANT_READY);
    } else {
      SocketService.emit(EVENTS.CANCEL_READY);
    }
    this.atualizarEstadoLocal(state.minhasRespostas, novoEstadoPronto);
  },

  async verificarModoAnfitriao() {
    const urlParams = new URLSearchParams(window.location.search);
    const isHostFromUrl = urlParams.has('host');

    let isElectronHost = false;
    if (
      window.agoraAPI &&
      typeof window.agoraAPI.isElectronHost === 'function'
    ) {
      try {
        isElectronHost = await window.agoraAPI.isElectronHost();
      } catch (e) {
        console.error('Erro ao verificar o modo anfitrião do Electron:', e);
      }
    }

    if (isHostFromUrl || isElectronHost) {
      SocketService.emit(EVENTS.REGISTER_HOST);
    }
  },
};

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});

declare global {
  interface Window {
    agoraAPI?: {
      isElectronHost: () => Promise<boolean>;
    };
  }
}
