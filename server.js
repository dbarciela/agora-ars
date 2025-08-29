const os = require('os'); // Módulo nativo do Node.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const rateLimit = require('express-rate-limit');
const QRCode = require('qrcode');
const { PORT } = require('./config');
const { EVENTS } = require('./public/events.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Gestão de Estado da Aplicação ---
const estadoAplicação = {
    participantes: {}, // Estrutura: { socketId: { respostas: [], pronto: false } }
    hostSocketId: null,

    adicionarParticipante(id) {
        if (id !== this.hostSocketId) {
            this.participantes[id] = { respostas: [], pronto: false };
            console.log(`Utilizador ${id} adicionado como participante.`);
        }
    },

    removerParticipante(id) {
        if (id === this.hostSocketId) {
            console.log('O anfitrião desconectou-se.');
            this.hostSocketId = null;
        } else {
            delete this.participantes[id];
            console.log(`Participante ${id} removido.`);
        }
    },

    definirAnfitriao(id) {
        if (this.hostSocketId === null || this.hostSocketId === id) {
            this.hostSocketId = id;
            if (this.participantes[id]) {
                delete this.participantes[id];
            }
            return true;
        }
        return false;
    },

    obterTodasAsRespostas() {
        return Object.values(this.participantes).flatMap(p => p.respostas);
    },

    obterEstadoParticipantes() {
        const ids = Object.keys(this.participantes);
        const prontos = ids.filter(id => this.participantes[id].pronto).length;
        const aResponder = ids.length - prontos;
        return { prontos, aResponder };
    },

    limparRespostas() {
        Object.values(this.participantes).forEach(p => {
            p.respostas = [];
            p.pronto = false;
        });
        console.log('Anfitrião limpou as respostas.');
    }
};

// --- Funções Utilitárias ---

// MELHORIA DE SEGURANÇA: Função para escapar caracteres HTML no servidor.
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function emitirAtualizacaoContador() {
    const total = estadoAplicação.obterTodasAsRespostas().length;
    io.emit(EVENTS.UPDATE_COUNTER, total);
}

function emitirAtualizacaoEstado() {
    if (!estadoAplicação.hostSocketId) return;
    io.emit(EVENTS.UPDATE_PARTICIPANT_STATE, estadoAplicação.obterEstadoParticipantes());
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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/enderecos', (req, res) => {
    const interfaces = os.networkInterfaces();
    const enderecos = [];
    for (const nome of Object.keys(interfaces)) {
        for (const net of interfaces[nome]) {
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
        const qrCodeDataUrl = await QRCode.toDataURL(url);
        const img = Buffer.from(qrCodeDataUrl.split(",")[1], 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    } catch (err) {
        console.error('Falha ao gerar QR Code:', err);
        res.status(500).send('Falha ao gerar QR Code');
    }
});

io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    console.log(`Um utilizador conectou-se: [IP: ${clientIp} | ID: ${socket.id}]`);

    socket.on(EVENTS.REGISTER_HOST, () => {
        if (estadoAplicação.definirAnfitriao(socket.id)) {
            socket.emit(EVENTS.IS_HOST);
            console.log(`Utilizador ${socket.id} foi definido como anfitrião.`);
        } else {
            socket.emit(EVENTS.HOST_EXISTS);
        }
        emitirAtualizacaoEstado();
        emitirAtualizacaoContador();
    });
    
    estadoAplicação.adicionarParticipante(socket.id);
    emitirAtualizacaoEstado();

    socket.on(EVENTS.SUBMIT_RESPONSE, (resposta) => {
        if (typeof resposta !== 'string' || resposta.trim() === '' || resposta.length > 500) {
            return; 
        }
        
        const participante = estadoAplicação.participantes[socket.id];
        if (participante && !participante.pronto) {
            // MELHORIA DE ROBUSTEZ: Validar duplicados no servidor.
            const respostaNormalizada = resposta.trim().toLowerCase();
            const respostasExistentes = new Set(participante.respostas.map(r => r.trim().toLowerCase()));
            if (respostasExistentes.has(respostaNormalizada)) {
                // Opcional: notificar o cliente do erro.
                return;
            }

            // MELHORIA DE SEGURANÇA: Sanitizar a resposta antes de a armazenar.
            const respostaSanitizada = escapeHtml(resposta.trim());
            participante.respostas.push(respostaSanitizada);

            console.log(`Nova resposta de [${socket.id}]: "${respostaSanitizada}".`);
            emitirAtualizacaoContador();
        }
    });

    socket.on(EVENTS.REMOVE_RESPONSE, (index) => {
        const participante = estadoAplicação.participantes[socket.id];
        if (participante && !participante.pronto) {
            if (participante.respostas[index]) {
                const respostaRemovida = participante.respostas[index];
                participante.respostas.splice(index, 1);
                console.log(`Resposta "${respostaRemovida}" de [${socket.id}] foi removida.`);
                emitirAtualizacaoContador();
            }
        }
    });

    socket.on(EVENTS.PARTICIPANT_READY, () => {
        if (estadoAplicação.participantes[socket.id]) {
            estadoAplicação.participantes[socket.id].pronto = true;
            console.log(`Participante ${socket.id} está pronto.`);
            emitirAtualizacaoEstado();
        }
    });
    
    socket.on(EVENTS.CANCEL_READY, () => {
        if (estadoAplicação.participantes[socket.id]) {
            estadoAplicação.participantes[socket.id].pronto = false;
            console.log(`Participante ${socket.id} cancelou a prontidão.`);
            emitirAtualizacaoEstado();
        }
    });

    socket.on(EVENTS.REVEAL_RESPONSES, () => {
        if (socket.id === estadoAplicação.hostSocketId) {
            console.log('Anfitrião revelou as respostas.');
            io.emit(EVENTS.RESPONSES_REVEALED, estadoAplicação.obterTodasAsRespostas());
        }
    });

    socket.on(EVENTS.CLEAR_RESPONSES, () => {
        if (socket.id === estadoAplicação.hostSocketId) {
            estadoAplicação.limparRespostas();
            io.emit(EVENTS.RESPONSES_REVEALED, []);
            emitirAtualizacaoContador();
            emitirAtualizacaoEstado();
        }
    });

    socket.on('disconnect', () => {
        console.log(`Utilizador desconectou-se: ${socket.id}`);
        estadoAplicação.removerParticipante(socket.id);
        emitirAtualizacaoEstado();
        emitirAtualizacaoContador();
    });

    app.get('/host', (req, res) => {
        if (!estadoAplicação.hostSocketId) {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        } else {
            res.status(409).send('<h1>Já existe um anfitrião ativo nesta sessão.</h1>');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor "Agora" a correr na porta ${PORT}.`);
    console.log(`Anfitrião: Use a aplicação Electron ou aceda a http://<seu-ip>:${PORT}/host`);
    console.log(`Participantes: Acedam a http://<seu-ip>:${PORT}`);
});