import { Router } from 'express';
import * as os from 'os';
import * as QRCode from 'qrcode';
import { PORT } from '../config';

const router = Router();

// Rota para obter os endereços de rede do servidor
router.get('/enderecos', (req, res) => {
  const interfaces = os.networkInterfaces();
  const enderecos = [];
  for (const nome of Object.keys(interfaces)) {
    const nets = interfaces[nome];
    if (!nets) continue;
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        enderecos.push({ nome: nome, endereco: net.address, porta: PORT });
      }
    }
  }
  res.json(enderecos);
});

// Rota para gerar um QR Code a partir de uma URL
// Aceita query params opcionais: size|width|w (número de pixels da largura do PNG).
// Exemplo: /api/qrcode?url=http%3A%2F%2Flocalhost%3A4321&size=512
router.get('/qrcode', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL inválida ou em falta.');
  }

  // Permitir pedido de maior resolução via query param (size, width ou w)
  const sizeParam = (req.query.size || req.query.width || req.query.w) as
    | string
    | undefined;
  let width: number | undefined;
  if (sizeParam) {
    const parsed = parseInt(sizeParam, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return res.status(400).send('Parâmetro size/width inválido.');
    }
    // Impor limites razoáveis para evitar uso abusivo
    const MIN = 64;
    const MAX = 2000;
    width = Math.min(Math.max(parsed, MIN), MAX);
  }

  try {
    const opts: any = { errorCorrectionLevel: 'H' };
    if (width) opts.width = width;

    // `qrcode` typings expose a callback-style toBuffer; use callback to keep TypeScript happy
    QRCode.toBuffer(url, opts, (err: any, buffer?: Buffer) => {
      if (err) {
        console.error('Falha ao gerar QR Code:', err);
        return res.status(500).send('Falha ao gerar QR Code');
      }
      if (!buffer) {
        console.error('Falha ao gerar QR Code: buffer vazio');
        return res.status(500).send('Falha ao gerar QR Code');
      }
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=31536000',
      });
      res.end(buffer);
    });
  } catch (err) {
    console.error('Falha inesperada ao gerar QR Code:', err);
    res.status(500).send('Falha ao gerar QR Code');
  }
});

export default router;
