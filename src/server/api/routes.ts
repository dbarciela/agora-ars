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
router.get('/qrcode', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL inválida ou em falta.');
  }
  try {
    const img = await QRCode.toBuffer(url, { errorCorrectionLevel: 'H' });
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

export default router;
