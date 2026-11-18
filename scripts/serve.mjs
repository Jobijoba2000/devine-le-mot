import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = 4173;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
createServer(async (req, res) => {
  try {
    const chemin = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let fichier = resolve(racine, '.' + chemin);
    if ((fichier !== racine && !fichier.startsWith(racine + sep)) || chemin.split('/').some(partie => partie.startsWith('.'))) {
      res.writeHead(403).end('Accès refusé');
      return;
    }
    if ((await stat(fichier)).isDirectory()) fichier = resolve(fichier, 'index.html');
    const type = types[extname(fichier)];
    if (!type) { res.writeHead(403).end('Accès refusé'); return; }
    const contenu = await readFile(fichier);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(contenu);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Page introuvable'); }
}).listen(port, '127.0.0.1', () => console.log(`Aperçu local : http://127.0.0.1:${port}`));
