import * as os from 'os';
import express from 'express';
import * as http from 'http';
import { Server, Socket } from 'socket.io';
import * as path from 'path';
import rateLimit from 'express-rate-limit';
import * as QRCode from 'qrcode';
import { PORT } from './config';
import { EVENTS } from '../types/events';
import type {
  EstadoAplicacao,
  Participante,
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/global-types';

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

const estadoAplicacao: EstadoAplicacao = {
  participantes: {}, // Estrutura: { socketId: { respostas: [], pronto: false } }
  hostSocketId: null,

  /**
   * Adiciona um novo participante à lista e emite o estado atualizado.
   * @param id - O ID único do socket do participante.
   */
  adicionarParticipante(id: string): void {
    if (id !== this.hostSocketId) {
      this.participantes[id] = { respostas: [], pronto: false };
      console.log(`Utilizador ${id} adicionado como participante.`);
    }
  },

  /**
   * Remove um participante pelo ID.
   */
  removerParticipante(id: string): void {
    if (id === this.hostSocketId) {
      console.log('O anfitrião desconectou-se.');
      this.hostSocketId = null;
    } else {
      delete this.participantes[id];
      console.log(`Participante ${id} removido.`);
    }
  },

  /**
   * Define o anfitrião da sessão.
   */
  definirAnfitriao(id: string): boolean {
    if (this.hostSocketId === null || this.hostSocketId === id) {
      this.hostSocketId = id;
      if (this.participantes[id]) {
        delete this.participantes[id];
      }
      return true;
    }
    return false;
  },

  /**
   * Obtém todas as respostas dos participantes.
   */
  obterTodasAsRespostas(): string[] {
    return Object.values(this.participantes).flatMap(
      (p: Participante) => p.respostas
    );
  },

  /**
   * Obtém o estado dos participantes.
   */
  obterEstadoParticipantes(): { prontos: number; aResponder: number } {
    const ids = Object.keys(this.participantes);
    const prontos = ids.filter((id) => this.participantes[id].pronto).length;
    const aResponder = ids.length - prontos;
    return { prontos, aResponder };
  },

  limparRespostas() {
    Object.values(this.participantes).forEach((p) => {
      p.respostas = [];
      p.pronto = false;
    });
    console.log('Anfitrião limpou as respostas.');
  },
};

// --- Funções Utilitárias ---

// MELHORIA DE SEGURANÇA: Função para escapar caracteres HTML no servidor.
function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function emitirAtualizacaoContador() {
  const total = estadoAplicacao.obterTodasAsRespostas().length;
  io.emit(EVENTS.UPDATE_COUNTER, total);
}

function emitirAtualizacaoEstado() {
  if (!estadoAplicacao.hostSocketId) return;
  io.emit(
    EVENTS.UPDATE_PARTICIPANT_STATE,
    estadoAplicacao.obterEstadoParticipantes()
  );
}

// --- Segurança: Limitação de Pedidos (Rate Limiting) ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Lógica Principal ---
// Servir ficheiros estáticos da pasta 'dist/client' em produção/standalone
app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/host', (req, res) => {
  res.redirect('/?host=true');
});

app.get('/api/enderecos', (req, res) => {
  const interfaces = os.networkInterfaces();
  const enderecos = [];
  for (const nome of Object.keys(interfaces)) {
    const nets = interfaces[nome];
    if (!nets) continue;
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        enderecos.push({ nome: nome, endereco: net.address });
      }
    }
  }
  res.json(enderecos);
});

app.get('/api/qrcode', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('URL é necessária');
  }
  try {
    if (typeof url !== 'string') {
      return res.status(400).send('URL inválida');
    }
    const qrCodeDataUrl = await QRCode.toDataURL(url);
    const img = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length,
    });
    res.end(img);
  } catch (err) {
    console.error('Falha ao gerar QR Code:', err);
    res.status(500).send('Falha ao gerar QR Code');
  }
});

io.on(
  'connection',
  (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    const clientIp = socket.handshake.address;
    console.log(
      `Um utilizador conectou-se: [IP: ${clientIp} | ID: ${socket.id}]`
    );

    socket.on(EVENTS.REGISTER_HOST, () => {
      if (estadoAplicacao.definirAnfitriao(socket.id)) {
        socket.emit(EVENTS.IS_HOST);
        console.log(`Utilizador ${socket.id} foi definido como anfitrião.`);
      } else {
        socket.emit(EVENTS.HOST_EXISTS);
      }
      emitirAtualizacaoEstado();
      emitirAtualizacaoContador();
    });

    estadoAplicacao.adicionarParticipante(socket.id);
    emitirAtualizacaoEstado();

    socket.on(EVENTS.SUBMIT_RESPONSE, (resposta) => {
      // 1. Validar e sanitizar a entrada de imediato
      if (typeof resposta !== 'string' || resposta.trim() === '') {
        return;
      }
      const respostaSanitizada = escapeHtml(resposta.trim());
      if (respostaSanitizada.length > 500) {
        return;
      }

      const participante = estadoAplicacao.participantes[socket.id];
      if (participante && !participante.pronto) {
        // 2. Validar duplicados com base na versão sanitizada e normalizada
        const respostaNormalizada = respostaSanitizada.toLowerCase();
        const respostasExistentes = new Set(
          participante.respostas.map((r) => r.toLowerCase())
        );
        if (respostasExistentes.has(respostaNormalizada)) {
          return;
        }

        // 3. Adicionar a resposta sanitizada
        participante.respostas.push(respostaSanitizada);
        console.log(
          `Nova resposta de [${socket.id}]: "${respostaSanitizada}".`
        );
        emitirAtualizacaoContador();
      }
    });

    socket.on(EVENTS.REMOVE_RESPONSE, (index) => {
      const participante = estadoAplicacao.participantes[socket.id];
      if (participante && !participante.pronto) {
        if (participante.respostas[index]) {
          const respostaRemovida = participante.respostas[index];
          participante.respostas.splice(index, 1);
          console.log(
            `Resposta "${respostaRemovida}" de [${socket.id}] foi removida.`
          );
          emitirAtualizacaoContador();
        }
      }
    });

    socket.on(EVENTS.PARTICIPANT_READY, () => {
      if (estadoAplicacao.participantes[socket.id]) {
        estadoAplicacao.participantes[socket.id].pronto = true;
        console.log(`Participante ${socket.id} está pronto.`);
        emitirAtualizacaoEstado();
      }
    });

    socket.on(EVENTS.CANCEL_READY, () => {
      if (estadoAplicacao.participantes[socket.id]) {
        estadoAplicacao.participantes[socket.id].pronto = false;
        console.log(`Participante ${socket.id} cancelou a prontidão.`);
        emitirAtualizacaoEstado();
      }
    });

    socket.on(EVENTS.REVEAL_RESPONSES, () => {
      if (socket.id === estadoAplicacao.hostSocketId) {
        console.log('Anfitrião revelou as respostas.');
        io.emit(
          EVENTS.RESPONSES_REVEALED,
          estadoAplicacao.obterTodasAsRespostas()
        );
      }
    });

    socket.on(EVENTS.CLEAR_RESPONSES, () => {
      if (socket.id === estadoAplicacao.hostSocketId) {
        estadoAplicacao.limparRespostas();
        io.emit(EVENTS.RESPONSES_REVEALED, []);
        emitirAtualizacaoContador();
        emitirAtualizacaoEstado();
      }
    });

    socket.on('disconnect', () => {
      console.log(`Utilizador desconectou-se: ${socket.id}`);
      estadoAplicacao.removerParticipante(socket.id);
      emitirAtualizacaoEstado();
      emitirAtualizacaoContador();
    });
  }
);

// Handler para a rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor "Agora" a correr na porta ${PORT}.`);
  console.log(
    `Anfitrião: Use a aplicação Electron ou aceda a http://<seu-ip>:${PORT}/host`
  );
  console.log(`Participantes: Acedam a http://<seu-ip>:${PORT}`);
});
