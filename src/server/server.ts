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
  EstadoParticipantes,
  ClientToServerEvents,
  ServerToClientEvents,
  Participante,
} from '../types/global-types';

/**
 * Classe para gerir o estado da aplicação de forma centralizada e modular.
 * Encapsula toda a lógica de manipulação de participantes e respostas.
 */
class ApplicationState {
  participantes: { [socketId: string]: Participante } = {};
  hostSocketId: string | null = null;

  /**
   * Adiciona um novo participante. Ignora se for o anfitrião.
   * @param id - O ID único do socket.
   */
  adicionarParticipante(id: string): void {
    if (id !== this.hostSocketId && !this.participantes[id]) {
      this.participantes[id] = { respostas: [], pronto: false };
      console.log(`Utilizador ${id} adicionado como participante.`);
    }
  }

  /**
   * Remove um participante ou o anfitrião se ele se desconectar.
   * @param id - O ID único do socket.
   */
  removerParticipante(id: string): void {
    if (id === this.hostSocketId) {
      console.log('O anfitrião desconectou-se.');
      this.hostSocketId = null;
    } else if (this.participantes[id]) {
      delete this.participantes[id];
      console.log(`Participante ${id} removido.`);
    }
  }

  /**
   * Define o anfitrião da sessão.
   * @param id - O ID único do socket do novo anfitrião.
   * @returns `true` se o anfitrião foi definido, `false` caso já exista um.
   */
  definirAnfitriao(id: string): boolean {
    if (this.hostSocketId === null || this.hostSocketId === id) {
      this.hostSocketId = id;
      // Garante que o anfitrião não é listado como participante.
      if (this.participantes[id]) {
        delete this.participantes[id];
      }
      console.log(`Utilizador ${id} foi definido como anfitrião.`);
      return true;
    }
    return false;
  }

  /**
   * Obtém uma lista de todas as respostas sanitizadas e válidas.
   * @returns Uma array de strings com todas as respostas.
   */
  obterTodasAsRespostas(): string[] {
    return Object.values(this.participantes).flatMap(
      (p: Participante) => p.respostas
    );
  }

  /**
   * Obtém o estado atual dos participantes (prontos vs. a responder).
   */
  obterEstadoParticipantes(): EstadoParticipantes {
    const ids = Object.keys(this.participantes);
    const prontos = ids.filter((id) => this.participantes[id].pronto).length;
    const aResponder = ids.length - prontos;
    return { prontos, aResponder };
  }

  /**
   * Limpa todas as respostas e reverte o estado dos participantes.
   */
  limparRespostas(): void {
    Object.values(this.participantes).forEach((p) => {
      p.respostas = [];
      p.pronto = false;
    });
    console.log('Anfitrião limpou as respostas.');
  }
}

// Cria uma única instância da classe de estado
const estadoAplicacao = new ApplicationState();

// --- Funções Utilitárias ---
function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function emitirAtualizacoesGlobais() {
  const total = estadoAplicacao.obterTodasAsRespostas().length;
  io.emit(EVENTS.UPDATE_COUNTER, total);
  io.emit(EVENTS.UPDATE_RESPONSES_LIVE, estadoAplicacao.obterTodasAsRespostas());
  if (estadoAplicacao.hostSocketId) {
    io.emit(
      EVENTS.UPDATE_PARTICIPANT_STATE,
      estadoAplicacao.obterEstadoParticipantes()
    );
  }
}

// --- Segurança: Limitação de Pedidos (Rate Limiting) ---
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Lógica Principal ---
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

// Servir ficheiros estáticos
app.use(express.static(path.join(__dirname, '..', 'client')));

// Rotas da API
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
  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL inválida ou em falta.');
  }
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H' });
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

// Lógica de conexão do Socket.IO
io.on(
  'connection',
  (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(
      `Um utilizador conectou-se: [IP: ${socket.handshake.address} | ID: ${socket.id}]`
    );

    // Lógica para o anfitrião
    socket.on(EVENTS.REGISTER_HOST, () => {
      if (estadoAplicacao.definirAnfitriao(socket.id)) {
        socket.emit(EVENTS.IS_HOST);
        emitirAtualizacoesGlobais();
      } else {
        socket.emit(EVENTS.HOST_EXISTS);
      }
    });

    // Adiciona participante se não for o anfitrião
    estadoAplicacao.adicionarParticipante(socket.id);
    emitirAtualizacoesGlobais();

    socket.on(EVENTS.SUBMIT_RESPONSE, (resposta) => {
      const participante = estadoAplicacao.participantes[socket.id];
      if (!participante || participante.pronto) return;

      if (typeof resposta !== 'string' || resposta.trim() === '') {
        return;
      }
      const respostaSanitizada = escapeHtml(resposta.trim());
      if (respostaSanitizada.length > 500) {
        return;
      }

      // Evita duplicados, normalizando para minúsculas
      const respostasExistentes = new Set(
        participante.respostas.map((r) => r.toLowerCase())
      );
      if (respostasExistentes.has(respostaSanitizada.toLowerCase())) {
        return;
      }

      participante.respostas.push(respostaSanitizada);
      console.log(
        `Nova resposta de [${socket.id}]: "${respostaSanitizada}".`
      );
      emitirAtualizacoesGlobais();
    });

    socket.on(EVENTS.REMOVE_RESPONSE, (index) => {
      const participante = estadoAplicacao.participantes[socket.id];
      if (!participante || participante.pronto) return;

      if (participante.respostas[index]) {
        participante.respostas.splice(index, 1);
        console.log(`Resposta de [${socket.id}] foi removida.`);
        emitirAtualizacoesGlobais();
      }
    });

    socket.on(EVENTS.PARTICIPANT_READY, () => {
      if (estadoAplicacao.participantes[socket.id]) {
        estadoAplicacao.participantes[socket.id].pronto = true;
        console.log(`Participante ${socket.id} está pronto.`);
        emitirAtualizacoesGlobais();
      }
    });

    socket.on(EVENTS.CANCEL_READY, () => {
      if (estadoAplicacao.participantes[socket.id]) {
        estadoAplicacao.participantes[socket.id].pronto = false;
        console.log(`Participante ${socket.id} cancelou a prontidão.`);
        emitirAtualizacoesGlobais();
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
        emitirAtualizacoesGlobais();
      }
    });

    socket.on('disconnect', () => {
      console.log(`Utilizador desconectou-se: ${socket.id}`);
      estadoAplicacao.removerParticipante(socket.id);
      emitirAtualizacoesGlobais();
    });
  }
);

// Rota principal para servir o HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor "Agora" a correr na porta ${PORT}.`);
});
