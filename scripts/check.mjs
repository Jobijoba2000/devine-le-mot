import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { verifier, partieTexte } from './content.mjs';

const racine = fileURLToPath(new URL('../', import.meta.url));
const fiches = verifier();
// Longueurs revues indépendamment du calcul de génération.
const longueursAttendues = [8, 9, 6, 8, 5, 7, 8, 11, 12, 7];
const indicesAttendus = [['B','S','E'],['P','P','E'],['V','L','N'],['H','I','N'],['A','C','E'],['S','L','R'],['J','E','S'],['T','M','E'],['B','I','E'],['C','C','E']];
fiches.forEach((fiche, i) => {
  assert.equal(fiche.longueur, longueursAttendues[i], `Longueur ${fiche.mot}`);
  assert.deepEqual([...fiche.lettresInitiales, ...fiche.indices].map(indice => indice.lettre), indicesAttendus[i], `Indices ${fiche.mot}`);
});
assert.deepEqual(fiches.map(fiche => fiche.lettresInitiales.length), [0, 1, 0, 0, 2, 0, 0, 1, 2, 0], 'Répartition des lettres à annoncer');
assert.equal(readFileSync(resolve(racine, 'partie-01.txt'), 'utf8'), partieTexte(fiches), 'Export texte non à jour');
const accueil = readFileSync(resolve(racine, 'index.html'), 'utf8');
assert.ok(!/<script\b/i.test(accueil), 'La page de référence doit être lisible sans JavaScript');
assert.equal([...accueil.matchAll(/<article id="enigme-/g)].length, fiches.length, 'Fiches manquantes sur la page de référence');
for (const fiche of fiches) {
  const article = accueil.match(new RegExp(`<article id="enigme-${fiche.id}">([\\s\\S]*?)</article>`))?.[1];
  assert.ok(article?.includes(`<dd>${fiche.mot}</dd>`) && article.includes(`<dd>${fiche.longueur}</dd>`), `Données absentes de la fiche ${fiche.id}`);
}
const fichiers = [];
function visiter(dossier) {
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    if (entree.name.startsWith('.') || entree.name === 'node_modules') continue;
    const chemin = resolve(dossier, entree.name);
    if (entree.isDirectory()) visiter(chemin); else fichiers.push(chemin);
  }
}
visiter(racine);
let pages = 0;
for (const fichier of fichiers) {
  if (!['.html','.js','.mjs','.json','.css','.md','.txt','.svg'].includes(extname(fichier))) continue;
  const texte = readFileSync(fichier, 'utf8');
  assert.ok(!/[\u2013\u2014]/u.test(texte), `Tiret long dans ${fichier}`);
  if (extname(fichier) !== '.html') continue;
  pages++;
  assert.ok(texte.includes('<html lang="fr">'), `Langue absente : ${fichier}`);
  assert.equal([...texte.matchAll(/<h1(?:\s|>)/g)].length, 1, `Titre principal : ${fichier}`);
  const ids = [...texte.matchAll(/\bid="([^"]+)"/g)].map(resultat => resultat[1]);
  assert.equal(new Set(ids).size, ids.length, `Identifiants dupliqués : ${fichier}`);
  for (const [, url] of texte.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:)/.test(url)) continue;
    const [chemin, ancre] = url.split('#');
    const cible = chemin ? resolve(dirname(fichier), chemin) : fichier;
    assert.ok(existsSync(cible), `Lien cassé : ${url} dans ${fichier}`);
    if (ancre) assert.ok(readFileSync(cible, 'utf8').includes(`id="${ancre}"`), `Ancre manquante : ${url}`);
  }
}
assert.equal(pages, 1);
console.log(`${fiches.length} énigmes vérifiées, ${pages} pages contrôlées, tous les liens locaux valides, aucun tiret long.`);
