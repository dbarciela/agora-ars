import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import * as path from 'path';
import rateLimit from 'express-rate-limit';
import { PORT } from './config';
import apiRoutes from './api/routes';
import { setupSocketHandlers } from './socket/handler';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/global-types';

// --- Configuração do Servidor Express ---
const app = express();
const server = http.createServer(app);

// --- Segurança: Limitação de Pedidos (Rate Limiting) ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Aumentado para evitar erros em desenvolvimento
  legacyHeaders: false,
});
app.use(limiter);

// --- Servir Ficheiros Estáticos do Cliente ---
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// --- Rotas da API ---
app.use('/api', apiRoutes);

// --- Rota Principal para o index.html ---
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// --- Rota para a página de informações (popup) ---
app.get('/info.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'info.html'));
});

// --- Configuração do Socket.IO ---
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);
setupSocketHandlers(io); // Usa o nosso gestor de sockets modularizado

// --- Iniciar o Servidor ---
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor "Agora" a correr na porta ${PORT}.`);
});
